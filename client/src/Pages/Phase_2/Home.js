// MatchmakingHome.jsx
import React, { useEffect, useState } from "react";
import {
  Headset,
  BadgeCheck,
  EyeOff,
  Filter,
  Heart,
  Sparkles,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useDispatch } from "react-redux";
import { useAuth } from "../../context/AuthContext";
import { fetchProfileByuserId } from "../../slice/userProfile";
import { FaHeart,  FaStar, } from 'react-icons/fa';
import match from "../../assets/match.png";
import { MatchFeatures, successStories } from "../../utils";

export const HeroSection = () => {
  const { user } = useAuth();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [error, setError] = useState(null);

  const handleCreateProfile = () => {
    if (user?.role === "user") navigate("/user/addProfile");
    else if (user?.role === "agency") navigate("/agency/addProfile");
  };

  useEffect(() => {
    const loadProfile = async () => {
      try {
        if (!user?.id) throw new Error("User ID not found");

        const result = await dispatch(fetchProfileByuserId(user.id)).unwrap();

        if (result?.message?.includes("Profile not found")) {
          localStorage.setItem("id", JSON.stringify(false));
          setProfile(null);
        } else if (result) {
          localStorage.setItem("userId", JSON.stringify(result._id));
          localStorage.setItem("id", JSON.stringify(true));
          setProfile(result);
        }
      } catch (err) {
        if (err?.message?.includes("404") || err?.message?.includes("not found")) {
          setProfile(null);
        } else {
          setError(err.message || "Failed to load profile");
        }
      }
    };

    loadProfile();
  }, [dispatch, user?.id]);

  return (
    <div className="relative py-10 md:py-20 px-4 overflow-hidden bg-gradient-to-br from-marriageHotPink m-5 to-marriagePink text-white rounded-2xl">
      {/* Floating hearts */}
      <div className="absolute inset-0 overflow-hidden z-0">
        {Array.from({ length: 8 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-pink-200 dark:text-pink-500 opacity-30"
            initial={{ y: -50 }}
            animate={{
              y: [0, 1000],
              rotate: Math.random() * 360,
            }}
            transition={{
              duration: 15 + Math.random() * 10,
              repeat: Infinity,
              ease: "linear",
            }}
            style={{
              left: `${Math.random() * 100}%`,
              fontSize: `${20 + Math.random() * 20}px`,
            }}
          >
            <Heart />
          </motion.div>
        ))}
      </div>

      {/* Content */}
      <div className="container mx-auto text-center relative z-10">
        <motion.h1
          className="text-4xl md:text-6xl font-bold mb-4 font-serif"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Find your{" "}
          <span className="relative inline-block">
            <span className="relative z-10 dark:text-marriageRed  text-yellow-400">
              Perfect Life Partner
            </span>
            <Sparkles className="absolute md:top-[-4] bottom-10 md:right-[-6] -right-1 dark:text-marriageRed animate-spin-slow  text-yellow-400" size={32} />
          </span>
        </motion.h1>

        <motion.h2
          className="text-2xl md:text-3xl font-medium mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          Your <span className="dark:text-marriageHotPink font-bold  text-yellow-400">Perfect Partner</span> a few clicks away!
        </motion.h2>

        {!profile && (
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-block"
          >
            <button
              onClick={handleCreateProfile}
              className="bg-gradient-to-r from-marriageRed to-marriageHotPink hover:marriageRed hover:to-marriagePink text-white font-bold px-10 py-4 rounded-full text-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center mx-auto"
            >
              <Heart className="mr-2" fill="currentColor" />
              Create Profile
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};


const MatchmakingHome = () => {
  return (
    <div className="bg-white min-h-screen transition-colors duration-500">
      <HeroSection />
      
      {/* Features Section with Modern Cards */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-purple-50/50"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Why Choose <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">Niqah</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Experience the difference with our comprehensive approach to finding your ideal life partner through cutting-edge technology and personalized service.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {MatchFeatures.map(({ title, icon, description, gradient }, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                whileHover={{ y: -10 }}
                className="group bg-white p-8 rounded-3xl shadow-lg border border-gray-100 hover:shadow-2xl hover:border-purple-200 transition-all duration-500 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-transparent to-purple-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <div className="flex justify-center mb-6">
                    <div className={`bg-gradient-to-r ${gradient} text-white p-4 rounded-2xl group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                      {icon}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4 text-center group-hover:text-purple-700 transition-colors duration-300">
                    {title}
                  </h3>
                  <p className="text-gray-600 text-center leading-relaxed text-sm">
                    {description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Success Stories with Enhanced Design */}
      <section className="py-24 bg-gradient-to-br from-purple-50 to-pink-50 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/5 to-pink-900/5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Love Stories That Inspire
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Real couples who found their perfect match and started their beautiful journey together
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {successStories.map(({ names, story, location, date }, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2, duration: 0.6 }}
                className="bg-white/80 backdrop-blur-md rounded-3xl p-8 shadow-xl border border-white/50 hover:shadow-2xl transition-all duration-500 group"
              >
                <div className="text-center mb-6">
                  <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg">
                    <FaHeart className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{names}</h3>
                  <div className="flex items-center justify-center text-sm text-gray-500 space-x-4">
                    <span>{location}</span>
                    <span>•</span>
                    <span>{date}</span>
                  </div>
                </div>
                <blockquote className="text-gray-600 italic text-center leading-relaxed">
                  "{story}"
                </blockquote>
                <div className="flex justify-center mt-4">
                  <div className="flex space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <FaStar key={i} className="w-4 h-4 text-yellow-400" />
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Your Journey to <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">Love</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Simple, secure, and personalized approach to finding your life partner
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            {/* Connection Lines */}
            <div className="hidden md:block absolute top-1/2 left-1/3 right-1/3 h-0.5 bg-gradient-to-r from-purple-200 to-pink-200 transform -translate-y-1/2"></div>
            
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center group relative"
            >
              <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-full w-20 h-20 flex items-center justify-center text-2xl font-bold mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg relative z-10">
                1
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-purple-600 transition-colors duration-300">
                Create Your Profile
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Build a comprehensive profile with photos, preferences, and life goals. Our verification team ensures authenticity.
              </p>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-center group relative"
            >
              <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full w-20 h-20 flex items-center justify-center text-2xl font-bold mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg relative z-10">
                2
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-pink-600 transition-colors duration-300">
                Discover Matches
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Our AI algorithm analyzes compatibility factors and presents you with highly compatible verified profiles.
              </p>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-center group relative"
            >
              <div className="bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-full w-20 h-20 flex items-center justify-center text-2xl font-bold mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg relative z-10">
                3
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-purple-600 transition-colors duration-300">
                Start Your Journey
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Connect with your matches through secure messaging and video calls. Begin your beautiful love story.
              </p>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default MatchmakingHome;
