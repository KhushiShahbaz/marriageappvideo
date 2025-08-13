// src/components/AgencyProfileDisplay.js
import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { deleteAgency, fetchAgencyByuserId } from '../../slice/agencySlice';
import { Button } from '../../Components/Layout/Button';
import { Building, Phone, FileText, MapPin, UserCheck, ShieldCheck, BadgeInfo, Calendar, IdCard, Globe, Mail, Users, Star, Edit, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import ConfirmationModal from '../../Components/Phase_2/ConfirmationModal';
import { motion } from 'framer-motion';


const InfoItem = ({ icon, label, value }) => (
  <div>
    <p className="text-sm font-medium text-gray-700 dark:text-gray-100 flex items-center gap-1">
      {icon} {label}
    </p>
    <p className="text-gray-800 dark:text-gray-200">{value}</p>
  </div>
);

export const AgencyProfileDisplay = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [agency, setAgency] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const dispatch = useDispatch();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user?.id) {
          throw new Error('User ID not found');
        }

        const result = await dispatch(fetchAgencyByuserId(user.id)).unwrap();

        if (result?.message?.includes('Agency not found') || result?.message?.includes("Agency not verified")) {
          setAgency(null);
          setError(null);
        } else {
          setAgency(result?.data);
        }
      } catch (err) {
        const errMessage = err?.message || '';
        if (errMessage.includes('404') || errMessage.includes('Profile not found')) {
          setAgency(null);
          setError(null);
        } else {
          setError(errMessage || 'Failed to load agency profile');
        }
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [dispatch, id]);

  const handleEditProfile = () => {
    if (agency?._id) {
      navigate(`/agency/addProfile/${agency._id}`);
    }
  };

  const handleDeleteProfile = () => {
    setShowDeleteModal(true);
  };

  const confirmDeleteProfile = async () => {
    try {
      await dispatch(deleteAgency(agency._id)).unwrap();
      toast.success('Profile Deleted successfully');
      navigate('/');
    } catch (err) {
      setError(err.message || 'Failed to delete profile');
    } finally {
      setShowDeleteModal(false);
    }
  };

  const handleCardClick = () => {
    navigate("/agency/addProfile");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300 text-lg">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center max-w-md mx-4"
        >
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Error</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300"
          >
            Retry
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900 p-6">
      {!agency ? (
        <div className="flex items-center justify-center min-h-[90vh]">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-pink-600 to-red-600 p-12 rounded-3xl shadow-2xl text-center max-w-md mx-auto"
          >
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-20 h-20 bg-white/10 rounded-full -translate-x-10 -translate-y-10"></div>
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/10 rounded-full translate-x-16 translate-y-16"></div>

            <div className="relative z-10">
              <div className="text-white text-7xl mb-6">🏢</div>
              <h2 className="text-3xl font-bold text-white mb-4">Create Your Agency</h2>
              <p className="text-white/90 mb-8 text-lg leading-relaxed">
                Join our platform and start connecting hearts with our intelligent matchmaking system
              </p>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white text-purple-600 px-8 py-4 rounded-2xl font-bold text-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
                onClick={handleCardClick}
              >
                Get Started
              </motion.button>
            </div>
          </motion.div>
        </div>
      ) : (
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Your Agency Profile</h1>
            <p className="text-gray-600 dark:text-gray-300">Manage your agency information and settings</p>
          </motion.div>

          {/* Main Profile Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden mb-8"
          >
            {/* Cover Section */}
            <div className="relative h-64 bg-gradient-to-br from-purple-500 via-pink-500 to-red-500">
              <div className="absolute inset-0 bg-black/20"></div>

              {/* Agency Logo */}
              <div className="absolute -bottom-16 left-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                  className="w-32 h-32 rounded-2xl border-4 border-white dark:border-gray-700 bg-white dark:bg-gray-700 shadow-2xl overflow-hidden"
                >
                  {agency.images?.[0] ? (
                    <img
                      src={`http://localhost:5000/${agency.images[0]}`}
                      alt={agency.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl text-gray-400">
                      🏢
                    </div>
                  )}
                </motion.div>
              </div>

              {/* Verification Badge */}
              {agency.isVerified && (
                <div className="absolute top-6 right-6">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.4 }}
                    className="flex items-center bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-2 rounded-full shadow-lg"
                  >
                    <ShieldCheck className="w-5 h-5 mr-2" />
                    <span className="font-semibold">Verified</span>
                  </motion.div>

                </div>)}

              {/* Action Buttons */}
              <div className="absolute top-6 left-6 flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleEditProfile}
                  className="flex items-center bg-white/90 hover:bg-white text-gray-800 px-4 py-2 rounded-full font-medium transition-all duration-300 shadow-lg"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleDeleteProfile()}
                  className="flex items-center bg-red-500/90 hover:bg-red-600 text-white px-4 py-2 rounded-full font-medium transition-all duration-300 shadow-lg"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </motion.button>
              </div>
            </div>

            {/* Profile Info */}
            <div className="pt-20 px-8 pb-8">
              <div className="mb-8">
                <motion.h2
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-3xl font-bold text-gray-900 dark:text-white mb-3"
                >
                  {agency.name}
                </motion.h2>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="flex flex-wrap gap-4 text-gray-600 dark:text-gray-300 mb-6"
                >
                  <div className="flex items-center">
                    <MapPin className="w-5 h-5 mr-2 text-purple-500" />
                    <span>{agency.address?.city}, {agency.address?.country}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-5 h-5 mr-2 text-purple-500" />
                    <span>{agency.yearOfExp} years experience</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="w-5 h-5 mr-2 text-purple-500" />
                    <span>500+ matches</span>
                  </div>
                </motion.div>

                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed"
                >
                  {agency.profile}
                </motion.p>
              </div>

              {/* Stats Cards */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
              >
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 p-6 rounded-2xl">
                  <div className="flex items-center mb-3">
                    <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mb-3">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">500+</h3>
                  <p className="text-gray-600 dark:text-gray-300">Active Clients</p>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 p-6 rounded-2xl">
                  <div className="flex items-center mb-3">
                    <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center mb-3">
                      <Star className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">4.9</h3>
                  <p className="text-gray-600 dark:text-gray-300">Average Rating</p>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 p-6 rounded-2xl">
                  <div className="flex items-center mb-3">
                    <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center mb-3">
                      <BadgeInfo className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">350+</h3>
                  <p className="text-gray-600 dark:text-gray-300">Successful Matches</p>
                </div>
              </motion.div>

              {/* Contact Information */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-2xl">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                    <Phone className="w-5 h-5 mr-2 text-purple-500" />
                    Contact Details
                  </h3>
                  <div className="space-y-3">



                    <InfoItem icon={<Phone className="w-4 h-4" />} label="Business Number" value={agency.businessNo} />
                    <InfoItem icon={<FileText className="w-4 h-4" />} label="License Number" value={agency.licenseNo} />
                    <InfoItem icon={<IdCard className="w-4 h-4" />} label="CNIC Number" value={agency.cnicNo || 'Not provided'} />                 <InfoItem icon={<Phone className="w-4 h-4" />} label="Contact Number" value={agency.contactNo} />


                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-2xl">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                    <MapPin className="w-5 h-5 mr-2 text-purple-500" />
                    Address
                  </h3>
                  <InfoItem icon={<MapPin className="w-4 h-4" />} label="Street" value={agency?.address?.street} />
                  <div className="grid grid-cols-2 gap-4">
                    <InfoItem icon={<MapPin className="w-4 h-4" />} label="City" value={agency?.address?.city} />
                    <InfoItem icon={<MapPin className="w-4 h-4" />} label="State" value={agency?.address?.state || 'Not provided'} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <InfoItem icon={<BadgeInfo className="w-4 h-4" />} label="Postal Code" value={agency?.address?.postalCode || 'Not provided'} />
                    <InfoItem icon={<Globe className="w-4 h-4" />} label="Country" value={agency?.address?.country} />
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Gallery Section */}
          {agency.images?.length > 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
              className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8"
            >
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Gallery</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {agency.images.slice(1).map((img, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.05 }}
                    className="group relative rounded-2xl overflow-hidden h-48 bg-gray-100 dark:bg-gray-700"
                  >
                    <img
                      src={`http://localhost:5000/${img}`}
                      alt={`Gallery image ${index + 1}`}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300"></div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Documents */}
          {agency.images?.length > 0 && (
            <div className="bg-white  dark:bg-gray-700 border-2 border-gray-200  dark:border-gray-700 rounded-2xl shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center gap-2 border-b border-gray-200 dark:border-gray-700 pb-2 mb-4">
                <FileText className="w-5 h-5 text-gray-500 dark:text-gray-400" /> Documents
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {agency.images.map((img, index) => (
                  <div key={index} className="border rounded-lg overflow-hidden dark:border-gray-700">
                    <img src={`http://localhost:5000/${img}`} alt={`Document ${index + 1}`} className="w-full h-40 object-cover" />
                    <div className="p-2 text-center bg-gray-50 dark:bg-gray-800">
                      <p className="text-sm text-gray-600 dark:text-gray-300">Document {index + 1}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {
        showDeleteModal &&
        <ConfirmationModal
          onClickCancel={() => setShowDeleteModal(false)}
          onClickSubmit={confirmDeleteProfile}
          cnfrmText="Are you sure you want to delete your agency profile? This action cannot be undone."
        />
      }
    </div>
  );
};

export default AgencyProfileDisplay;
