import React, { useState } from 'react';
import { NavBar } from '../Components/Layout/navbar';
import landingImage from "../assets/landing.png";
import { Button } from '../Components/Layout/Button';
import { Footer } from '../Components/Layout/Footer';
import { LoginModal } from '../Components/loginModal';
import { useNavigate } from 'react-router-dom';
import CoverPage from './CoverPage';
import { Features } from '../utils';

export default function Home () {
  const [showLogin, setShowLogin] = useState(false);

  const navigate=useNavigate()
  
 
  const [search, setSearch] = useState({ name: '', location: '' });

  const handleInputChange = (e) => {
    setSearch({ ...search, [e.target.name]: e.target.value });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/search-results?name=${encodeURIComponent(search.name)}&location=${encodeURIComponent(search.location)}`);
  };

  return (
    <div className="font-sans text-gray-800 bg-white min-h-screen flex flex-col">
      {/* Navigation Bar */}
      <NavBar onLoginClick={() => setShowLogin(true)} />
      {/* Main Content */}
      <div className="flex-1">
        <section className="flex flex-col md:flex-row items-center justify-between max-w-6xl mx-auto px-6 py-16 md:py-24">
          {/* Left: Text and Buttons */}
          <div className="flex-1 space-y-6 md:pr-5">
            <h1 className="text-4xl md:text-6xl font-extrabold text-[#00185f] font-mono leading-tight mb-2">
              Your Perfect Partner a few <br className="hidden md:block" /> clicks away !
            </h1>
            <p className="text-lg text-gray-700 mb-4">
              Download Our App, Browse Member Profiles And Find Your Life Partner!
            </p>
            {/* Search Form */}
            <form className="flex flex-col md:flex-row gap-4 mb-4" onSubmit={handleSearch}>
              <input
                type="text"
                name="name"
                value={search.name}
                onChange={handleInputChange}
                placeholder="Hall Name"
                className="px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-marriageHotPink focus:outline-none w-full md:w-56"
              />
              <input
                type="text"
                name="location"
                value={search.location}
                onChange={handleInputChange}
                placeholder="Location"
                className="px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-marriageHotPink focus:outline-none w-full md:w-56"
              />
              <Button
                btnText={"Search"}
                btnColor={"marriageHotPink"}
                padding="px-8 py-3"
                type="submit"
              />
            </form>
          {/**  <div className="flex gap-4 mb-4">
              <Button btnText={"Register"} btnColor={"marriageHotPink"} />
              <Button btnText={"Rishta Dhondo"} btnColor={"marriageHotPink"}  onClick={()=>handleRedirect()}/>

            </div>*/} 
          </div>
          {/* Right: Illustration */}
          <div className="flex-1 flex justify-center md:justify-end mt-10 md:mt-0">
            <img 
              src={landingImage}
              alt="Marriage Illustration" 
              className="w-full h-full bg-white"
            />
          </div>
        </section>
     
      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Why Choose Us?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We provide a comprehensive platform designed to help you find meaningful connections with complete security and trust.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {Features.map((feature, index) => (
              <div
                key={index}
                className="group bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-2xl hover:border-marriageHotPink/30 transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className="flex justify-center mb-6">
                  <div className="bg-gradient-to-r from-marriageHotPink to-marriageRed text-white rounded-2xl p-4 group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-center leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
  {/* Stats Section */}
  <section className="py-20 bg-gradient-to-r from-marriagePink to-pink-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg">
              <div className="text-4xl font-bold text-marriageRed mb-2">10,000+</div>
              <div className="text-gray-700 font-semibold">Happy Couples</div>
            </div>
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg">
              <div className="text-4xl font-bold text-marriageRed mb-2">50,000+</div>
              <div className="text-gray-700 font-semibold">Verified Profiles</div>
            </div>
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg">
              <div className="text-4xl font-bold text-marriageRed mb-2">95%</div>
              <div className="text-gray-700 font-semibold">Success Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Simple steps to find your perfect match
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="bg-gradient-to-r from-marriageHotPink to-marriageRed text-white rounded-full w-20 h-20 flex items-center justify-center text-2xl font-bold mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                1
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Create Profile</h3>
              <p className="text-gray-600">Sign up and create your detailed profile with photos and preferences</p>
            </div>
            
            <div className="text-center group">
              <div className="bg-gradient-to-r from-marriageHotPink to-marriageRed text-white rounded-full w-20 h-20 flex items-center justify-center text-2xl font-bold mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                2
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Find Matches</h3>
              <p className="text-gray-600">Browse through verified profiles and find your compatible matches</p>
            </div>
            
            <div className="text-center group">
              <div className="bg-gradient-to-r from-marriageHotPink to-marriageRed text-white rounded-full w-20 h-20 flex items-center justify-center text-2xl font-bold mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                3
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Start Connection</h3>
              <p className="text-gray-600">Connect with your matches and start meaningful conversations</p>
            </div>
          </div>
        </div>
      </section>
      </div>
      <CoverPage/>
      {/* Footer */}
      <Footer />
      {/* Login Modal */}
      {showLogin && (
        <LoginModal onClose={() => setShowLogin(false)} />
      )}
    </div>
  );
};
