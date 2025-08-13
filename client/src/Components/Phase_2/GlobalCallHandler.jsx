
import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getSocket } from '../../socket';
import { useSelector } from 'react-redux';
import { 
  FiPhone, 
  FiPhoneOff, 
  FiUser,
  FiVideo
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const GlobalCallHandler = () => {
  const [incomingCall, setIncomingCall] = useState(null);
  const [callSound, setCallSound] = useState(null);
  const socket = getSocket();
  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth);
  const audioRef = useRef();

  useEffect(() => {
    if (!socket || !user) return;

    // Register user when component mounts
    socket.emit('register', user._id);

    // Create call sound
    const audio = new Audio('/call-ringtone.mp3'); // You'll need to add this file
    audio.loop = true;
    setCallSound(audio);

    const handleIncomingCall = (data) => {
      console.log('GLOBAL: Incoming call received:', data);
      setIncomingCall({
        callerId: data.from,
        callerName: data.callerName || 'Unknown',
        signalData: data.signalData,
        callType: data.callType || 'audio' // audio or video
      });
      
      // Play ringtone
      if (audio) {
        audio.play().catch(console.error);
      }
    };

    const handleCallEnded = () => {
      console.log('GLOBAL: Call ended');
      setIncomingCall(null);
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    };

    const handleCallAccepted = () => {
      console.log('GLOBAL: Call accepted by another device');
      setIncomingCall(null);
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    };

    // Remove existing listeners
    socket.off('callUser');
    socket.off('callEnded');
    socket.off('callAccepted');

    // Add listeners
    socket.on('callUser', handleIncomingCall);
    socket.on('callEnded', handleCallEnded);
    socket.on('callAccepted', handleCallAccepted);

    return () => {
      if (socket) {
        socket.off('callUser');
        socket.off('callEnded');
        socket.off('callAccepted');
      }
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    };
  }, [socket, user]);

  const acceptCall = () => {
    if (!incomingCall) return;

    // Stop ringtone
    if (callSound) {
      callSound.pause();
      callSound.currentTime = 0;
    }

    // Navigate to appropriate call page with call data
    const callData = {
      recipientId: incomingCall.callerId,
      recipientName: incomingCall.callerName,
      isInitiator: false,
      signalData: incomingCall.signalData
    };

    // Store call data in sessionStorage for the call component
    sessionStorage.setItem('pendingCall', JSON.stringify(callData));

    // Navigate to a dedicated call page or show call modal
    if (incomingCall.callType === 'video') {
      navigate('/video-call');
    } else {
      navigate('/audio-call');
    }

    setIncomingCall(null);
  };

  const rejectCall = () => {
    if (!incomingCall) return;

    // Stop ringtone
    if (callSound) {
      callSound.pause();
      callSound.currentTime = 0;
    }

    // Notify caller of rejection
    socket.emit('rejectCall', { to: incomingCall.callerId });
    setIncomingCall(null);
  };

  return (
    <AnimatePresence>
      {incomingCall && (
        <motion.div
          initial={{ opacity: 0, y: -100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -100 }}
          className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[9999] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6 min-w-[320px] max-w-md"
        >
          {/* Header */}
          <div className="text-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mx-auto mb-3 flex items-center justify-center">
              {incomingCall.callType === 'video' ? (
                <FiVideo className="w-8 h-8 text-white" />
              ) : (
                <FiUser className="w-8 h-8 text-white" />
              )}
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Incoming {incomingCall.callType === 'video' ? 'Video' : 'Audio'} Call
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {incomingCall.callerName}
            </p>
          </div>

          {/* Animated pulse effect */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 animate-pulse pointer-events-none"></div>

          {/* Action buttons */}
          <div className="flex space-x-4 relative z-10">
            <button
              onClick={acceptCall}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2 shadow-lg"
            >
              <FiPhone className="w-5 h-5" />
              <span>Accept</span>
            </button>
            <button
              onClick={rejectCall}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2 shadow-lg"
            >
              <FiPhoneOff className="w-5 h-5" />
              <span>Decline</span>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default GlobalCallHandler;
