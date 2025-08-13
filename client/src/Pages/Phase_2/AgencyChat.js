import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMessages, sendMessage, clearMessages, GetSession, ReadMessages, createPayment, updatePayment, fetchLatestPayment } from '../../slice/AgencyChatSlice';
import { getSocket, disconnectSocket } from '../../socket';
import { FiDollarSign, FiFileText, FiPhoneCall, FiPhone, FiVideo, FiX, FiPaperclip } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import MatchmakingForm from './MatchMakingForm';
import { PaymentRequestModal } from '../../Components/Phase_2/paymentModal';
import { createAccount } from '../../slice/savedAccountsSlice';
import { UploadProofModal } from '../../Components/Phase_2/proofModal';
import { PaymentVerificationModal } from '../../Components/Phase_2/paymentVerificationModal';
import VideoCall from '../../Components/Phase_2/VideoCall';
import AudioCall from '../../Components/Phase_2/AudioCall';

const renderFileMessage = (file) => {
  const fileType = file.mimetype?.split('/')[0] || 'file';
  const fileUrl = `http://localhost:5000/${file.path}`;

  switch (fileType) {
    case 'image':
      return (
        <img
          src={fileUrl}
          alt={file.originalname}
          className="max-w-xs max-h-64 rounded border border-gray-200"
        />
      );
    case 'video':
      return (
        <video controls className="max-w-xs max-h-64 rounded border border-gray-200">
          <source src={fileUrl} type={file.mimetype} />
          Your browser does not support the video tag.
        </video>
      );
    case 'audio':
      return (
        <audio controls className="w-full">
          <source src={fileUrl} type={file.mimetype} />
          Your browser does not support the audio element.
        </audio>
      );
    // In your renderFileMessage function
    default:
      if (file.mimetype === 'application/pdf') {
        return (
          <div className="flex items-center p-2 bg-gray-100 rounded border border-gray-200">
            <FiFileText className="mr-2 text-red-500" />
            <button
              onClick={() => window.open(fileUrl, '_blank')}
              className="text-blue-500 hover:underline truncate max-w-xs text-left"
            >
              {file.originalname}
            </button>
            <span className="ml-2 text-xs text-gray-500">(PDF)</span>
          </div>
        );
      }
    // return (
    //   <div className="flex items-center p-2 bg-gray-100 rounded border border-gray-200">
    //     <FiFileText className="mr-2 text-gray-600" />
    //     <a
    //       href={fileUrl}
    //       download={file.originalname}
    //       target="_blank"
    //       rel="noopener noreferrer"
    //       className="text-blue-500 hover:underline truncate max-w-xs"
    //     >
    //       {file.originalname}
    //     </a>
    //   </div>
    // );
  }
};

const AgencyChat = ({ isAdmin, agencyId, userId, disableSend }) => {
  const dispatch = useDispatch();
  const [showCallTypeModal, setShowCallTypeModal] = useState(false);
  const [callType, setCallType] = useState(null); // 'audio' or 'video'
  const { sessions, messages } = useSelector((state) => state.chat);
  const { user } = useAuth()
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSession, setSelectedSession] = useState(null);
  const [chatInput, setChatInput] = useState('');
  const [socket, setSocket] = useState(null);
  const [requestingDetails, setRequestingDetails] = useState(false);
  const messagesEndRef = useRef(null); // ✅ ref to scroll into view
  const [showModal, setShowModal] = useState(false)
  const [showPayment, setShowPayment] = useState(false)
  const [requestingPayment, setRequestingPayment] = useState(false)
  const [paymentConfirmation, setPaymentConfirmation] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState({})
  const [VerificationModal, setVerificationModal] = useState(false)
  const [files, setFiles] = useState([]);
  const fileInputRef = useRef(null);
  const [videoCallOpen, setVideoCallOpen] = useState(false);
  const [audioCallOpen, setAudioCallOpen] = useState(false);

  const peerRef = useRef(null)
  const handleFileChange = (e) => {
    setFiles([...e.target.files]);
  };
  const removeFile = (index) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
  };

  useEffect(() => {
    if (agencyId && user?.id && user?.role === 'user') {
      dispatch(GetSession({ agencyId, userId: user.id }))
        .unwrap()
        .then(async (session) => {

          setSelectedSession(session);

        });
    } else if (agencyId && userId && user?.role === 'agency') {
      dispatch(GetSession({ agencyId, userId }))
        .unwrap()
        .then((session) => {
          setSelectedSession(session);

          // ✅ Auto-select
        });
    }
  }, [agencyId, user]);

  useEffect(() => {
    setLoading(true);

    if (selectedSession?._id) {
      fetchPayment();// ✅ Auto-select
    }
  }, [selectedSession])

  useEffect(() => {
    dispatch(ReadMessages({ sessionId: selectedSession?._id, reader: user?.role }))
      .unwrap()
      .then((session) => {
        setLoading(false); // ✅ update loading
      })
      .catch((err) => {
        setError("Failed to fetch sessions");
        setLoading(false); // ✅ also update on error
      });

  }, [dispatch]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };



  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Setup socket
  useEffect(() => {
    if (!selectedSession) return;

    const s = getSocket();
    setSocket(s);

    s.emit('joinSession', { sessionId: selectedSession._id }); // ✅ Join new session
    dispatch(fetchMessages({ sessionId: selectedSession._id }));

    s.on('newMessage', (msg) => {
      if (msg.sessionId === selectedSession._id) {
        dispatch(fetchMessages({ sessionId: selectedSession._id }));
      }

    });
    
    s.emit('register', user?.id);

    return () => {
      disconnectSocket();
      dispatch(clearMessages());
      s.off('incoming-call');
      s.off('call-signal');
      s.off('call-ended');
    };
  }, [selectedSession]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if ((!chatInput && files.length === 0) || !selectedSession) return;
    const payload = {
      sessionId: selectedSession?._id || '',
      sender: user?.role,
      type: 'text',
      text: chatInput,
      files: files
    };
    await dispatch(sendMessage(payload));
    setChatInput('');
    setFiles([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; // Clear file input
    }
  };

  const handleRequestDetails = async () => {
    if (user?.role === 'agency') {
      setRequestingDetails(true);


      const payload = {
        sessionId: selectedSession._id,
        sender: 'agency',
        type: 'requestForm',
        text: 'Please fill out the matchmaking form.'
      };
      await dispatch(sendMessage(payload));


      setTimeout(() => setRequestingDetails(false), 1000);
    }
  };


  const handleRequestPayment = async (paymentDetails) => {
    setRequestingPayment(true);

    const paymentMessage =
      `💳 *Payment Request*\n` +
      `Amount: ${paymentDetails.currency}${paymentDetails.amount}\n` +
      `For: "${paymentDetails.description}" Matchmaking Process\n` +
      `\n🏦 *Bank Details*:\n` +
      `Account Title: ${paymentDetails.accountTitle}\n` +
      `Account Number: ${paymentDetails.accountNumber}\n` +
      `Bank Name: ${paymentDetails.bankName}\n` +
      (paymentDetails.dueDate
        ? `\n📅 *Due Date*: ${new Date(paymentDetails.dueDate).toLocaleDateString()}\n`
        : '') +
      `\nAfter sending payment, please share a confirmation message. ✅`;

    const payload = {
      sessionId: selectedSession._id,
      sender: 'agency',
      type: 'paymentRequest',
      text: paymentMessage,
      formData: {
        amount: paymentDetails.amount,
        currency: paymentDetails.currency,
        description: paymentDetails.description,
        dueDate: paymentDetails.dueDate,
        bankName: paymentDetails.bankName,
        accountNumber: paymentDetails.accountNumber,
        accountTitle: paymentDetails.accountTitle,
        status: 'pending',
      }
    };

    try {
      // ✅ Send data to backend for saving in PaymentDetail schema
      const paymentPayload = {
        sessionId: selectedSession._id,
        userId: selectedSession.userId,
        agencyId: user?.id, // or however you get the candidate's userId
        amount: paymentDetails.amount,
        currency: paymentDetails.currency,
        description: paymentDetails.description,
        dueDate: paymentDetails.dueDate,
        bankName: paymentDetails.bankName,
        accountNumber: paymentDetails.accountNumber,
        accountTitle: paymentDetails.accountTitle,
      };

      await dispatch(createPayment(paymentPayload)).then(async (res) => {
        if (res) {
          setShowPayment(false);

          await dispatch(sendMessage(payload));
          const accountPayload = {
            agencyId: user.id, // or get agency ID from session/context
            accountTitle: paymentDetails.accountTitle,
            accountNumber: paymentDetails.accountNumber,
            bankName: paymentDetails.bankName
          }
          await dispatch(createAccount(accountPayload))
        }
      })




    } catch (error) {
      console.error('Failed to send payment request:', error);
    } finally {
      setRequestingPayment(false);
    }
  };


  const fetchPayment = async () => {
    await dispatch(fetchLatestPayment(selectedSession?._id)).unwrap().then((data) => {
      setSelectedRequest(data?.data);
      setLoading(false);
    });


  };

  // const handleAcceptCall = () => {
  //   if (!incomingCall) return;

  //   setActiveCall({
  //     callType: incomingCall.callType,
  //     roomId: incomingCall.roomId,
  //     isInitiator: false
  //   });
  //   setIncomingCall(null);

  //   // Join the call room
  //   socket.emit('join-call-room', incomingCall.roomId);
  // };

  // Add this function to handle call rejection
  // const handleRejectCall = () => {
  //   if (!incomingCall) return;

  //   socket.emit('call-ended', { roomId: incomingCall.roomId });
  //   setIncomingCall(null);
  // };

  return (
    <div className="p-0 md:p-4 w-full md:gap-6">
      {/* Chat area */}
      <div className="w-full dark:bg-gray-800 bg-white rounded-3xl shadow h-full">
        <div className="px-6 py-4 border-b border-marriagePink/30 flex items-center gap-3 sticky top-0 z-10 rounded-t-3xl">
          {selectedSession && (
            <>
              <div className="min-w-0 flex flex-col">
                <div className="font-bold dark:text-white truncate capitalize text-lg">
                  {selectedSession.userId?.name || 'Anonymous User'}
                </div>
                <div className="text-xs dark:text-white/80 truncate"> {selectedSession.userId?.email}</div>
              </div>
              {(user.role === 'user') &&
                (<button
                  className="ml-auto p-2 rounded-full bg-green-200 text-green-600 hover:bg-green-100 transition shadow"
                  title="Payment Confirmation"

                  onClick={() => setPaymentConfirmation(true)}
                >
                  <FiDollarSign className="text-xl" />
                </button>)}
              {(user.role === 'agency') &&
                (<button
                  className="ml-auto p-2 rounded-full bg-white text-green-600 hover:bg-green-100 transition shadow"
                  title="Request Payment"
                  disabled={requestingPayment}
                  onClick={() => setShowPayment(true)}
                >
                  <FiDollarSign className="text-xl" />
                </button>)}
              {(user.role === 'user' || user.role === 'agency') && (
                <button
                  className="p-2 rounded-full bg-blue-200 text-blue-600 hover:bg-blue-100 transition shadow"
                  title="Start Call"
                  onClick={() => setShowCallTypeModal(true)}
                >
                  <FiPhoneCall className="text-xl" />
                </button>
              )}
              {(user.role === 'agency') && (<button
                className=" p-2 rounded-full bg-white text-marriageHotPink hover:bg-marriagePink hover:text-white transition shadow"
                title="Request Form"
                disabled={requestingDetails}
                onClick={handleRequestDetails}
              >
                <FiFileText className="text-xl" />
              </button>)}
            </>
          )}
        </div>


        <div className="h-[66vh] lg:h-[60vh] overflow-y-auto px-4 py-4 custom-scrollbar">
          {selectedSession ? (
            messages.length === 0 ? (
              <div className="text-gray-400 text-center mt-8">No messages yet.</div>
            ) : (
              <>
                {messages.map((msg, idx) => (
                  <div key={idx} className={`mb-3 flex ${msg.sender === user?.role ? 'justify-end' : 'justify-start'} animate-fadeIn`}>
                    <div
                      className={`relative max-w-[75%] px-4 py-2 rounded-2xl shadow-lg ${msg.sender === user?.role
                        ? 'bg-marriageHotPink text-white rounded-br-none mr-2'
                        : 'bg-white text-marriageHotPink border border-marriagePink rounded-bl-none ml-2'}`}
                    >
                      <div className="whitespace-pre-line break-words text-base">
                        {msg.type === 'formResponse' ? (
                          JSON.stringify(JSON.parse(msg.formData), null, 2)
                        ) : msg.type === 'requestForm' ? (
                          <a onClick={() => setShowModal(true)} className='cursor-pointer underline'>{msg.text}</a>
                        ) : msg.type === 'paymentConfirmation' ? (
                          <div>
                            <a onClick={() => {
                              setSelectedPayment(msg)
                              setVerificationModal(true)
                            }} className='cursor-pointer underline'>{msg.text}</a>
                            {msg.formData.proofImage && (
                              <img
                                src={`http://localhost:5000/${msg.formData.proofImage}`}
                                alt="Payment Proof"
                                className="mt-2 md:max-w-xs w-70 rounded border"
                              />
                            )}
                          </div>
                        ) : (
                          msg.text
                        )}
                        {(msg.file && msg.file.length > 0) &&

                          <div className="space-y-2">
                            {msg.file.map((file, i) => (
                              <div key={i}>{renderFileMessage(file)}</div>
                            ))}
                          </div>

                        }
                      </div>
                      <div className="text-xs text-right mt-1 opacity-60">
                        {msg.sender === 'agency' ? 'You' : 'User'} — {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </>
            )
          ) : (
            <div className="text-gray-400 flex-1 flex items-center justify-center">Select a chat to view messages</div>
          )}
        </div>
        {files.length > 0 && (
          <div className="px-6 pt-2 pb-1 border-t border-marriagePink/30 bg-gray-50">
            <div className="flex flex-wrap gap-2 mb-2">
              {Array.from(files).map((file, index) => (
                <div key={index} className="relative flex items-center bg-white rounded-lg p-2 border border-gray-200 shadow-sm">
                  <div className="flex items-center">
                    <FiFileText className="text-gray-500 mr-2" />
                    <span className="text-sm text-gray-700 truncate max-w-xs">
                      {file.name}
                    </span>
                  </div>
                  <button
                    onClick={() => removeFile(index)}
                    className="ml-2 text-gray-500 hover:text-red-500"
                  >
                    <FiX size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <form className="flex gap-2 items-end mt-auto dark:bg-gray-800 px-6 py-4 border-t border-marriagePink/30 bg-white sticky bottom-0 rounded-b-3xl">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            multiple
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition cursor-pointer"
            title="Attach files"
          >
            <FiPaperclip className="text-xl" />
          </label>
          <input
            type="text"
            className="flex-1 px-4 py-2 rounded-full border-2 border-marriagePink focus:ring-2 focus:ring-marriageHotPink focus:outline-none bg-white text-marriageHotPink shadow"
            placeholder={disableSend ? 'Sending disabled' : 'Type your message...'}
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            disabled={disableSend}
          />
          <button
            onClick={handleSend}
            // type="submit"
            className="px-4 py-2 rounded-full bg-marriageHotPink text-white font-bold hover:bg-marriageRed transition shadow text-lg"
            // disabled={disableSend}
            title="Send"
          >
            Send
          </button>
        </form>
        {showPayment && <PaymentRequestModal
          onClose={() => setShowPayment(false)}
          onRequestPayment={handleRequestPayment}
          isLoading={requestingPayment}
        />}
        {paymentConfirmation && selectedRequest && (
          <UploadProofModal
            paymentData={selectedRequest}
            onClose={() => {
              setSelectedRequest(null);
              setPaymentConfirmation(false);
            }}
            setPaymentConfirmation={setPaymentConfirmation}
            selectedSession={selectedSession}
          />
        )}
        {(VerificationModal && selectedPayment && user.role === 'agency')
          &&
          <PaymentVerificationModal
            payment={selectedPayment}
            onClose={() => setVerificationModal(false)}
            selectedSession={selectedSession}

          />}

        {showCallTypeModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
            <div className="bg-white rounded-lg p-6 w-72 shadow-lg dark:bg-gray-800">
              <h3 className="text-lg font-bold mb-4 dark:text-white">Choose Call Type</h3>
              <div className="flex gap-4 justify-center">
                <button
                  className="flex items-center gap-2 px-5 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition shadow"
                  onClick={() => {
                    setAudioCallOpen(true)
                    setShowCallTypeModal(false);
                  }}
                >
                  <FiPhone className="text-xl" />
                  <span className="font-medium">Audio</span>
                </button>

                <button
                  className="flex items-center gap-2 px-5 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition shadow"
                  onClick={() => {
                   setVideoCallOpen(true)
                    setShowCallTypeModal(false);
                  }}
                >
                  <FiVideo className="text-xl" />
                  <span className="font-medium">Video</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Video Call Component */}
      <VideoCall
        isOpen={videoCallOpen}
        onClose={() => setVideoCallOpen(false)}
        recipientId={selectedSession?.userId?._id}
        recipientName={selectedSession?.userId?.name}
        currentUserId={user?.id}
        isInitiator={true}
      />

      {/* Audio Call Component */}
      <AudioCall
        isOpen={audioCallOpen}
        onClose={() => setAudioCallOpen(false)}
        recipientId={selectedSession?.userId?._id}
        recipientName={selectedSession?.userId?.name}
        currentUserId={user?.id}
        isInitiator={true}
      />

        {(showModal && user.role === 'user') && <MatchmakingForm onClose={() => setShowModal(false)} selectedSession={selectedSession} />}
      </div>
    
    </div>
  );
};

export default AgencyChat;



