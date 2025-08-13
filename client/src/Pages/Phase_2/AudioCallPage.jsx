
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AudioCall from '../../Components/Phase_2/AudioCall';
import { useSelector } from 'react-redux';

const AudioCallPage = () => {
  const [callData, setCallData] = useState(null);
  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth);

  useEffect(() => {
    // Get call data from sessionStorage
    const pendingCall = sessionStorage.getItem('pendingCall');
    if (pendingCall) {
      const data = JSON.parse(pendingCall);
      setCallData(data);
      // Clear the stored data
      sessionStorage.removeItem('pendingCall');
    } else {
      // If no call data, redirect back
      navigate(-1);
    }
  }, [navigate]);

  const handleCallEnd = () => {
    navigate(-1); // Go back to previous page
  };

  if (!callData || !user) {
    return <div>Loading call...</div>;
  }

  return (
    <div className="fixed inset-0 z-50">
      <AudioCall
        isOpen={true}
        onClose={handleCallEnd}
        recipientId={callData.recipientId}
        recipientName={callData.recipientName}
        currentUserId={user._id}
        isInitiator={callData.isInitiator}
        initialSignalData={callData.signalData}
      />
    </div>
  );
};

export default AudioCallPage;
