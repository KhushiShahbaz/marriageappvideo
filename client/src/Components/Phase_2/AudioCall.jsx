
import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import Peer from 'simple-peer';
import { getSocket } from '../../socket';
import { 
  FiPhone, 
  FiPhoneOff, 
  FiMic, 
  FiMicOff,
  FiUser
} from 'react-icons/fi';

const AudioCall = ({ 
  isOpen, 
  onClose, 
  recipientId, 
  recipientName, 
  currentUserId,
  isInitiator = false,
  initialSignalData = null
}) => {
    console.log(recipientId)
  const [stream, setStream] = useState(null);
  const [receivingCall, setReceivingCall] = useState(false);
  const [caller, setCaller] = useState('');
  const [callerSignal, setCallerSignal] = useState(null);
  const [callAccepted, setCallAccepted] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [callStarted, setCallStarted] = useState(false);

  const connectionRef = useRef();
  const socket = getSocket();
  const callTimerRef = useRef();
  useEffect(() => {
    if (isOpen) {
      // Get media stream
      navigator.mediaDevices.getUserMedia({ 
        video: false, 
        audio: true 
      }).then((stream) => {
        setStream(stream);
      }).catch((err) => {
        console.error('Error accessing microphone:', err);
      });

      // Register current user with their ID
      if (socket && currentUserId) {
        console.log('Registering user:', currentUserId);
        socket.emit('register', currentUserId);

        // Set up call event listeners
        const handleIncomingCall = (data) => {
          console.log('INCOMING CALL DATA:', data);
          setReceivingCall(true);
          setCaller(data.from);
          setCallerSignal(data.signalData);
        };

        // Handle initial signal data if this is an incoming call
        if (initialSignalData && !isInitiator) {
          setReceivingCall(true);
          setCaller(recipientId);
          setCallerSignal(initialSignalData);
        } else if (isInitiator && stream) {
          // Auto-initiate call for outgoing calls
          setTimeout(() => callUser(), 500);
        }

        const handleCallAccepted = (signal) => {
          console.log('Call accepted');
          setCallAccepted(true);
          if (connectionRef.current) {
            connectionRef.current.signal(signal);
          }
          if (!callStarted) {
            startCallTimer();
          }
        };

        const handleCallEnded = () => {
          console.log('Call ended by peer');
          endCall();
        };

        // Remove existing listeners first
        socket.off('callUser');
        socket.off('callAccepted');
        socket.off('callEnded');

        // Add new listeners
        socket.on('callUser', handleIncomingCall);
        socket.on('callAccepted', handleCallAccepted);
        socket.on('callEnded', handleCallEnded);
      }
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (socket) {
        socket.off('callUser');
        socket.off('callAccepted');
        socket.off('callEnded');
      }
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
      }
    };
  }, [isOpen, currentUserId]);

  const startCallTimer = () => {
    callTimerRef.current = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    console.log('Current user ID:', currentUserId);
    console.log('Recipient ID:', recipientId);
    
    if (socket) {
      socket.emit('register', currentUserId); // ✅ Consistent registration
    }
  }, []);

  const callUser = () => {
    console.log('Initiating call to:', recipientId);
    setCallStarted(true);
    startCallTimer(); // Start timer when call is initiated
    
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream: stream
    });
  
    peer.on('signal', (data) => {
      console.log('Sending call signal to:', recipientId);
      socket.emit('callUser', {
        userToCall: recipientId,
        signalData: data,
        from: currentUserId,
        callerName: 'You' // You can pass the actual caller name if available
      });
    });

    peer.on('stream', (remoteStream) => {
      // Handle remote audio stream if needed
      console.log('Received remote audio stream');
    });
  
    connectionRef.current = peer;
  };

  const answerCall = () => {
    console.log('Answering call from:', caller);
    setCallAccepted(true);
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream: stream
    });

    peer.on('signal', (data) => {
      console.log('Sending answer signal to:', caller);
      socket.emit('answerCall', { signal: data, to: caller });
    });

    peer.on('stream', (remoteStream) => {
      console.log('Received remote audio stream in answer');
    });

    peer.signal(callerSignal);
    connectionRef.current = peer;
    if (!callStarted) {
      setCallStarted(true);
      startCallTimer();
    }
  };

  const endCall = () => {
    console.log('Ending call');
    setCallEnded(true);
    setCallAccepted(false);
    setReceivingCall(false);
    setCallDuration(0);
    setCallStarted(false);
    
    if (connectionRef.current) {
      connectionRef.current.destroy();
    }
    
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    
    if (callTimerRef.current) {
      clearInterval(callTimerRef.current);
    }
    
    // Notify the peer that call ended
    const targetUser = callAccepted || receivingCall ? (caller || recipientId) : recipientId;
    socket.emit('endCall', { to: targetUser });
    onClose();
  };

  const toggleAudio = () => {
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setAudioEnabled(audioTrack.enabled);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-8 text-center text-white">
          <div className="w-24 h-24 bg-white/20 rounded-full mx-auto mb-4 flex items-center justify-center">
            <FiUser className="w-12 h-12" />
          </div>
          <h3 className="text-xl font-bold mb-2">{recipientName}</h3>
          <p className="opacity-90">
            {callAccepted ? `Connected - ${formatDuration(callDuration)}` : 
             receivingCall ? 'Incoming call...' : 
             callStarted ? `Calling - ${formatDuration(callDuration)}` : 'Connecting...'}
          </p>
        </div>

        {/* Incoming Call Interface */}
        {receivingCall && !callAccepted && (
          <div className="p-8 text-center">
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              {recipientName} is calling you...
            </p>
            <div className="flex space-x-4">
              <button
                onClick={answerCall}
                className="flex-1 bg-green-500 text-white py-4 px-6 rounded-2xl font-semibold hover:bg-green-600 transition-all transform hover:scale-105 flex items-center justify-center space-x-2"
              >
                <FiPhone className="w-5 h-5" />
                <span>Accept</span>
              </button>
              <button
                onClick={endCall}
                className="flex-1 bg-red-500 text-white py-4 px-6 rounded-2xl font-semibold hover:bg-red-600 transition-all transform hover:scale-105 flex items-center justify-center space-x-2"
              >
                <FiPhoneOff className="w-5 h-5" />
                <span>Decline</span>
              </button>
            </div>
          </div>
        )}

        {/* Call Controls */}
        {(callAccepted || (!receivingCall && !callAccepted)) && (
          <div className="p-8">
            <div className="flex items-center justify-center space-x-6">
              <button
                onClick={toggleAudio}
                className={`p-4 rounded-full transition-all transform hover:scale-105 ${
                  audioEnabled 
                    ? 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300' 
                    : 'bg-red-500 text-white'
                }`}
              >
                {audioEnabled ? <FiMic className="w-6 h-6" /> : <FiMicOff className="w-6 h-6" />}
              </button>

              {!callAccepted && !receivingCall && isInitiator && (
                <button
                  onClick={callUser}
                  className="p-4 bg-green-500 text-white rounded-full hover:bg-green-600 transition-all transform hover:scale-105"
                >
                  <FiPhone className="w-6 h-6" />
                </button>
              )}

              <button
                onClick={endCall}
                className="p-4 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all transform hover:scale-105"
              >
                <FiPhoneOff className="w-6 h-6" />
              </button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default AudioCall;
