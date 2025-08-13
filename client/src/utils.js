import { FaHeart, FaShieldAlt, FaGlobeAmericas, FaUserCheck,  } from 'react-icons/fa';

// Radio button options
export const genderOptions = [
    { value: "Male", label: "Male" },
    { value: "Female", label: "Female" },
  ];

  export const maritalStatusOptions = [
    { value: "Single", label: "Single" },
    { value: "Divorced", label: "Divorced" },
    { value: "Widowed", label: "Widowed" },
  ];


export  const Features = [
    {
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: "Global Matrimonial Platform",
      description: "Connect with potential matches from around the world with our comprehensive global network and advanced matching algorithms."
    },
    {
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3-1.343-3-3-3z" />
          <path d="M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.746 3.746 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
        </svg>
      ),
      title: "Free Registration",
      description: "Join our platform without any registration fees. Start your journey to find your perfect match today at no cost."
    },
    {
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      title: "Screening and Validation",
      description: "Our comprehensive verification process ensures authentic profiles and a safe, trustworthy environment for all members."
    },
    {
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
      title: "Data Security and Privacy",
      description: "Your personal information is protected with industry-leading security measures and strict privacy controls."
    }
  ];


export  const successStories = [
    {
      names: "Sarah & Ahmed",
      image: "/api/placeholder/80/80",
      story: "We found each other through this amazing platform and couldn't be happier. The matching algorithm is incredibly accurate!",
      location: "Dubai, UAE",
      date: "Married 2023"
    },
    {
      names: "Fatima & Hassan",
      image: "/api/placeholder/80/80", 
      story: "The verification process gave us complete confidence. We're now blessed with a beautiful family and couldn't be more grateful.",
      location: "London, UK",
      date: "Married 2022"
    },
    {
      names: "Aisha & Omar",
      image: "/api/placeholder/80/80",
      story: "From first conversation to wedding day - this platform made our love story possible. Highly recommended for serious seekers!",
      location: "Toronto, Canada", 
      date: "Married 2024"
    }
  ];

export  const MatchFeatures = [
    {
      title: "Smart Matching Algorithm",
      icon: <FaHeart className="w-8 h-8" />,
      description: "Our AI-powered matching system connects you with highly compatible partners based on deep personality analysis and preferences.",
      gradient: "from-pink-500 to-rose-500"
    },
    {
      title: "100% Verified Profiles",
      icon: <FaUserCheck className="w-8 h-8" />,
      description: "Every profile undergoes rigorous verification including ID, education, and employment verification for complete authenticity.",
      gradient: "from-blue-500 to-indigo-500"
    },
    {
      title: "Global Network",
      icon: <FaGlobeAmericas className="w-8 h-8" />,
      description: "Connect with premium matches across 50+ countries through our expansive international matrimonial network.",
      gradient: "from-emerald-500 to-teal-500"
    },
    {
      title: "Advanced Privacy",
      icon: <FaShieldAlt className="w-8 h-8" />,
      description: "Bank-level security with customizable privacy controls. Your information is protected with end-to-end encryption.",
      gradient: "from-purple-500 to-violet-500"
    }
  ];