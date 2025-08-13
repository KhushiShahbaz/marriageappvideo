import React, { useEffect, useState } from 'react';
import { useDispatch,  } from 'react-redux';
import {  fetchMiniCards, fetchSummary,  } from '../../slice/agencyDashboardSlice';
import { motion } from 'framer-motion';

import {
  FaUsers,
  FaMoneyBillWave,
  FaComments,
  FaClipboardList,
  FaHeart,
  FaChartLine,
  FaCheckCircle,
  // FaTrendingUp,
  // FaTrendingDown
} from 'react-icons/fa';

const iconMap = {
  FaUsers,
  FaClipboardList,
  FaCheckCircle,
  FaMoneyBillWave,
};

// Enhanced Progress Card Component
const ProgressCard = ({ title, value, target, color }) => {
  const percentage = Math.min(Math.round((value / target) * 100), 100);
  const colorClasses = {
    primary: 'from-blue-500 to-blue-600',
    secondary: 'from-purple-500 to-purple-600',
    success: 'from-green-500 to-green-600',
    warning: 'from-yellow-500 to-yellow-600',
    info: 'from-cyan-500 to-cyan-600'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 h-full border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300 group"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">{title}</h3>
        <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${colorClasses[color]}`}></div>
      </div>

      <div className="mb-6">
        <div className="flex items-baseline space-x-2">
          <span className="text-3xl font-bold text-gray-900 dark:text-white">{value}</span>
          <span className="text-lg text-gray-500 dark:text-gray-400">/ {target}</span>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{percentage}% Complete</p>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-300">Progress</span>
          <span className="font-medium text-gray-900 dark:text-white">{percentage}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 1, delay: 0.3 }}
            className={`h-full bg-gradient-to-r ${colorClasses[color]} rounded-full relative overflow-hidden`}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

// Enhanced Stats Card Component
const StatsCard = ({ title, value, icon: Icon, color, trend }) => {
  const colorClasses = {
    primary: 'from-blue-500 to-blue-600',
    secondary: 'from-purple-500 to-purple-600',
    success: 'from-green-500 to-green-600',
    warning: 'from-yellow-500 to-yellow-600',
    info: 'from-cyan-500 to-cyan-600'
  };

  const bgColorClasses = {
    primary: 'from-blue-50 to-blue-100',
    secondary: 'from-purple-50 to-purple-100',
    success: 'from-green-50 to-green-100',
    warning: 'from-yellow-50 to-yellow-100',
    info: 'from-cyan-50 to-cyan-100'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      whileHover={{ y: -5 }}
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 h-full border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300 group relative overflow-hidden"
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${bgColorClasses[color]} opacity-0 group-hover:opacity-50 transition-opacity duration-300`}></div>

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className={`rounded-xl w-14 h-14 flex items-center justify-center bg-gradient-to-r ${colorClasses[color]} shadow-lg`}>
            <Icon className="text-xl text-white" />
          </div>
          {trend && (
            <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${
              trend.value > 0
                ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
            }`}>
              {/* {trend.value > 0 ? (
                <FaTrendingUp className="w-3 h-3" />
              ) : (
                <FaTrendingDown className="w-3 h-3" />
              )} */}
              <span>{Math.abs(trend.value)}%</span>
            </div>
          )}
        </div>

        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">{title}</h3>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
          {trend && (
            <p className="text-xs text-gray-500 dark:text-gray-400">{trend.label}</p>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// Enhanced Mini Stats Card Component
const MiniStatsCard = ({ title, value, icon: Icon, color }) => {
  const colorClasses = {
    primary: 'from-blue-500 to-blue-600',
    secondary: 'from-purple-500 to-purple-600',
    success: 'from-green-500 to-green-600',
    warning: 'from-yellow-500 to-yellow-600',
    info: 'from-cyan-500 to-cyan-600'
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
      whileHover={{ scale: 1.05 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 h-full border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-all duration-300 group"
    >
      <div className="flex items-center space-x-3">
        <div className={`rounded-lg w-12 h-12 flex items-center justify-center bg-gradient-to-r ${colorClasses[color]} shadow-md group-hover:shadow-lg transition-shadow duration-300`}>
          <Icon className="text-lg text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide truncate">{title}</h3>
          <p className="text-xl font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
      </div>
    </motion.div>
  );
};

const AgencyDashboard = () => {
  const dispatch = useDispatch();
  const [summary, setSummary] = useState({});
  const [miniCards, setMiniCards] = useState([]);
  const [monthlyTarget, setMonthlyTarget] = useState({value: 0, target: 0});

  useEffect(() => {
    dispatch(fetchSummary()).unwrap().then((data) => {
      setSummary(data);
    });

    dispatch(fetchMiniCards()).unwrap().then((data) => {
      setMiniCards(data);
    });
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900 p-6">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Agency Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-300">Welcome back! Here's what's happening with your agency today.</p>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg px-4 py-2 shadow-sm border border-gray-200 dark:border-gray-700">
              <span className="text-sm text-gray-600 dark:text-gray-300">Today: </span>
              <span className="font-semibold text-gray-900 dark:text-white">{new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Top Row - Monthly Target + Mini Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
       

        {miniCards.map((card, idx) => {
          const IconComponent = iconMap[card.icon] || FaUsers;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 + idx * 0.1 }}
              className="col-span-1"
            >
              <MiniStatsCard
                title={card.title}
                value={card.value}
                icon={IconComponent}
                color={card.color}
              />
            </motion.div>
          );
        })}
      </div>

      {/* Main Stats Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <StatsCard
          title="Total Clients"
          value={summary.totalClients}
          icon={FaUsers}
          color="primary"
          trend={summary.trends?.clients}
        />

        <StatsCard
          title="Active Conversations"
          value={summary.activeConversations}
          icon={FaComments}
          color="info"
        />

        <StatsCard
          title="Pending Forms"
          value={summary.pendingForms}
          icon={FaClipboardList}
          color="warning"
        />

        <StatsCard
          title="Successful Matches"
          value={summary.successfulMatches}
          icon={FaHeart}
          color="success"
          trend={summary.trends?.matches}
        />

        <StatsCard
          title="Monthly Revenue"
          value={`Rs. ${typeof summary?.monthlyRevenue === 'number' ? summary.monthlyRevenue.toLocaleString() : '0'}`}
          icon={FaMoneyBillWave}
          color="secondary"
          trend={summary.trends?.revenue}
        />

        <StatsCard
          title="Conversion Rate"
          value={`${summary.conversionRate}%`}
          icon={FaChartLine}
          color="success"
        />
      </motion.div>
    </div>
  );
};

export default AgencyDashboard;