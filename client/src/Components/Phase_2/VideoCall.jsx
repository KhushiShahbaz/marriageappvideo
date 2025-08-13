
import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import Peer from 'simple-peer';
import { getSocket } from '../../socket';
import { 
  FiPhone, 
  FiPhoneOff, 
  FiVideo, 
  FiVideoOff, 
  FiMic, 
  FiMicOff,
  FiMaximize2,
  FiMinimize2
} from 'react-icons/fi';

const VideoCall = ({ 
  isOpen, 
  onClose, 
  recipientId, 
  recipientName, 
  isInitiator = false 
}) => {
  const [stream, setStream] = useState(null);
  const [receivingCall, setReceivingCall] = useState(false);
  const [caller, setCaller] = useState('');
  const [callerSignal, setCallerSignal] = useState(null);
  const [callAccepted, setCallAccepted] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [isFullScreen, setIsFullScreen] = useState(false);

  const myVideo = useRef();
  const userVideo = useRef();
  const connectionRef = useRef();
  const socket = getSocket();

  useEffect(() => {
    if (isOpen) {
      navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      }).then((stream) => {
        setStream(stream);
        if (myVideo.current) {
          myVideo.current.srcObject = stream;
        }
      }).catch((err) => {
        console.error('Error accessing media devices:', err);
      });

      if (socket) {
        socket.on('callUser', (data) => {
          setReceivingCall(true);
          setCaller(data.from);
          setCallerSignal(data.signal);
        });

        socket.on('callAccepted', (signal) => {
          setCallAccepted(true);
          connectionRef.current.signal(signal);
        });

        socket.on('callEnded', () => {
          endCall();
        });
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
    };
  }, [isOpen]);

  const callUser = () => {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream: stream
    });

    peer.on('signal', (data) => {
      socket.emit('callUser', {
        userToCall: recipientId,
        signalData: data,
        from: socket.id
      });
    });

    peer.on('stream', (stream) => {
      if (userVideo.current) {
        userVideo.current.srcObject = stream;
      }
    });

    socket.on('callAccepted', (signal) => {
      setCallAccepted(true);
      peer.signal(signal);
    });

    connectionRef.current = peer;
  };

  const answerCall = () => {
    setCallAccepted(true);
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream: stream
    });

    peer.on('signal', (data) => {
      socket.emit('answerCall', { signal: data, to: caller });
    });

    peer.on('stream', (stream) => {
      if (userVideo.current) {
        userVideo.current.srcObject = stream;
      }
    });

    peer.signal(callerSignal);
    connectionRef.current = peer;
  };

  const endCall = () => {
    setCallEnded(true);
    setCallAccepted(false);
    setReceivingCall(false);
    
    if (connectionRef.current) {
      connectionRef.current.destroy();
    }
    
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    
    socket.emit('endCall', { to: recipientId });
    onClose();
  };

  const toggleVideo = () => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setVideoEnabled(videoTrack.enabled);
      }
    }
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

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`fixed inset-0 z-50 bg-gray-900 ${isFullScreen ? '' : 'p-4'}`}
    >
      <div className={`${isFullScreen ? 'h-full' : 'h-full max-w-6xl mx-auto'} bg-gray-800 rounded-lg overflow-hidden relative`}>
        
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/50 to-transparent p-4">
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold">
                  {recipientName?.charAt(0)?.toUpperCase()}
                </span>
              </div>
              <div>
                <h3 className="font-semibold">{recipientName}</h3>
                <p className="text-sm opacity-75">
                  {callAccepted ? 'Connected' : receivingCall ? 'Incoming call...' : 'Connecting...'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={toggleFullScreen}
                className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
              >
                {isFullScreen ? <FiMinimize2 className="w-5 h-5" /> : <FiMaximize2 className="w-5 h-5" />}
              </button>
              <button
                onClick={onClose}
                className="p-2 bg-red-500/80 rounded-full hover:bg-red-500 transition-colors"
              >
                ×
              </button>
            </div>
          </div>
        </div>

        {/* Video Container */}
        <div className="relative h-full">
          {/* Remote Video */}
          {callAccepted && (
            <video
              ref={userVideo}
              autoPlay
              className="w-full h-full object-cover"
            />
          )}

          {/* Local Video */}
          <div className="absolute bottom-20 right-4 w-32 h-24 md:w-48 md:h-36 bg-gray-700 rounded-lg overflow-hidden border-2 border-white/20">
            <video
              ref={myVideo}
              autoPlay
              muted
              className="w-full h-full object-cover"
            />
            {!videoEnabled && (
              <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                <FiVideoOff className="w-8 h-8 text-gray-400" />
              </div>
            )}
          </div>

          {/* Incoming Call Overlay */}
          {receivingCall && !callAccepted && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="absolute inset-0 bg-black/80 flex items-center justify-center"
            >
              <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl text-center max-w-sm mx-4">
                <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <FiVideo className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2 dark:text-white">Incoming Call</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">{recipientName} is calling...</p>
                <div className="flex space-x-4">
                  <button
                    onClick={answerCall}
                    className="flex-1 bg-green-500 text-white py-3 px-6 rounded-full font-semibold hover:bg-green-600 transition-colors flex items-center justify-center space-x-2"
                  >
                    <FiPhone className="w-5 h-5" />
                    <span>Accept</span>
                  </button>
                  <button
                    onClick={endCall}
                    className="flex-1 bg-red-500 text-white py-3 px-6 rounded-full font-semibold hover:bg-red-600 transition-colors flex items-center justify-center space-x-2"
                  >
                    <FiPhoneOff className="w-5 h-5" />
                    <span>Decline</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Controls */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
          <div className="flex items-center justify-center space-x-4">
            <button
              onClick={toggleAudio}
              className={`p-4 rounded-full transition-all ${
                audioEnabled 
                  ? 'bg-white/20 text-white hover:bg-white/30' 
                  : 'bg-red-500 text-white hover:bg-red-600'
              }`}
            >
              {audioEnabled ? <FiMic className="w-6 h-6" /> : <FiMicOff className="w-6 h-6" />}
            </button>

            <button
              onClick={toggleVideo}
              className={`p-4 rounded-full transition-all ${
                videoEnabled 
                  ? 'bg-white/20 text-white hover:bg-white/30' 
                  : 'bg-red-500 text-white hover:bg-red-600'
              }`}
            >
              {videoEnabled ? <FiVideo className="w-6 h-6" /> : <FiVideoOff className="w-6 h-6" />}
            </button>

            {!callAccepted && !receivingCall && isInitiator && (
              <button
                onClick={callUser}
                className="p-4 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors"
              >
                <FiPhone className="w-6 h-6" />
              </button>
            )}

            <button
              onClick={endCall}
              className="p-4 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
            >
              <FiPhoneOff className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default VideoCall;
