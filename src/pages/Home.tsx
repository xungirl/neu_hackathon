import React, { useState, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Heart, MapPin, Home as HomeIcon, Video, Shield, Wand2, Upload, Loader2, Check, ArrowRight } from 'lucide-react';
import { aiService } from '../api/services/ai';
import { PhotoAnalysisResult } from '../types/ai';

const Home = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<PhotoAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setResult(null);
    setPreview(URL.createObjectURL(file));
    setAnalyzing(true);

    try {
      const tempPetId = `temp_${Date.now()}`;
      const res = await aiService.uploadAndAnalyzePhoto(tempPetId, file);
      setResult((res as any).data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Analysis failed. You can still create a profile manually.');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="flex-grow">
      <div className="relative bg-gradient-to-b from-orange-50 to-gray-50 py-12 sm:py-20 overflow-hidden">
        {/* Background blobs */}
        <div className="absolute top-0 left-0 -ml-20 -mt-20 w-64 h-64 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-primary rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h1 className="text-4xl sm:text-6xl font-display font-extrabold text-gray-900 mb-6 leading-tight">
              Find Friends, <span className="text-primary">Find Home</span>, <br /> Find Love.
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              The all-in-one platform for pet lovers. Match your furry friend, report lost pets, or adopt a new family member today.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <NavLink to="/match" className="bg-primary text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 hover:bg-orange-600 transition-all transform hover:-translate-y-1">
                Start Matching
              </NavLink>
              <NavLink to="/post" className="bg-white text-gray-800 px-8 py-4 rounded-xl font-bold text-lg shadow-md border border-gray-100 hover:border-primary/50 transition-all">
                Create Profile
              </NavLink>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <NavLink to="/match" className="group relative bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100 overflow-hidden cursor-pointer">
               <div className="absolute top-0 right-0 w-32 h-32 bg-red-100 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
               <div className="relative z-10">
                   <div className="w-14 h-14 bg-red-100 text-red-500 rounded-2xl flex items-center justify-center mb-6 group-hover:rotate-6 transition-transform">
                       <Heart size={28} fill="currentColor" />
                   </div>
                   <h3 className="text-2xl font-bold text-gray-900 mb-3">Pet Social</h3>
                   <p className="text-gray-500 mb-6">Swipe right to find playdates! AI-powered matching based on breed, energy level, and personality.</p>
               </div>
            </NavLink>

            <NavLink to="/lost-found" className="group relative bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100 overflow-hidden cursor-pointer">
               <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
               <div className="relative z-10">
                   <div className="w-14 h-14 bg-blue-100 text-secondary rounded-2xl flex items-center justify-center mb-6 group-hover:rotate-6 transition-transform">
                       <MapPin size={28} />
                   </div>
                   <h3 className="text-2xl font-bold text-gray-900 mb-3">Lost & Found</h3>
                   <p className="text-gray-500 mb-6">Report lost pets or sightings. Integrated maps with red/blue markers for quick identification.</p>
               </div>
            </NavLink>

            <NavLink to="/adoption" className="group relative bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100 overflow-hidden cursor-pointer">
               <div className="absolute top-0 right-0 w-32 h-32 bg-green-100 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
               <div className="relative z-10">
                   <div className="w-14 h-14 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center mb-6 group-hover:rotate-6 transition-transform">
                       <HomeIcon size={28} />
                   </div>
                   <h3 className="text-2xl font-bold text-gray-900 mb-3">Adoption Square</h3>
                   <p className="text-gray-500 mb-6">Browse pets looking for a forever home. Filter by breed, age, and health status.</p>
               </div>
            </NavLink>
          </div>
        </div>
      </div>

      <section className="py-16 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row items-center gap-12">
                <div className="w-full lg:w-1/2">
                    <div className="bg-gray-50 rounded-3xl p-8 border border-gray-200 relative">
                        <div className="absolute top-0 left-0 w-full h-2 bg-primary rounded-t-3xl"></div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Create Pet Profile</h2>

                        {/* Upload area */}
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleFileChange}
                        />

                        {!preview ? (
                          <div
                            onClick={() => fileInputRef.current?.click()}
                            className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center mb-6 bg-white cursor-pointer hover:bg-gray-50 hover:border-primary transition-colors group"
                          >
                            <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                                <Upload size={24} />
                            </div>
                            <p className="text-sm font-medium text-gray-700">Click to upload a pet photo</p>
                            <p className="text-xs text-gray-400 mt-1">AI will auto-detect breed, age & features</p>
                          </div>
                        ) : (
                          <div className="rounded-xl overflow-hidden mb-6 border border-gray-200 relative">
                            <img src={preview} alt="Pet" className="w-full h-56 object-cover" />

                            {analyzing && (
                              <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex flex-col items-center justify-center">
                                <Loader2 className="h-10 w-10 text-primary animate-spin mb-2" />
                                <p className="text-primary font-bold text-sm">Analyzing with AI...</p>
                              </div>
                            )}

                            {result && !analyzing && (
                              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                                <div className="flex flex-wrap gap-2">
                                  <span className="bg-green-500 text-white px-2 py-0.5 rounded-full text-xs font-bold flex items-center gap-1">
                                    <Check size={10} /> {result.breed || 'Unknown breed'}
                                  </span>
                                  <span className="bg-blue-500 text-white px-2 py-0.5 rounded-full text-xs font-bold">
                                    {result.age_group || 'Unknown age'}
                                  </span>
                                  <span className="bg-purple-500 text-white px-2 py-0.5 rounded-full text-xs font-bold">
                                    {result.size || 'Unknown size'}
                                  </span>
                                </div>
                              </div>
                            )}

                            {error && !analyzing && (
                              <div className="absolute bottom-0 inset-x-0 bg-red-500/90 p-3 text-white text-xs text-center">
                                {error}
                              </div>
                            )}
                          </div>
                        )}

                        {(result || error) && !analyzing && (
                          <button
                            onClick={() => navigate('/post')}
                            className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white font-bold py-3 px-6 rounded-xl shadow-md transition-all transform hover:-translate-y-0.5"
                          >
                            Continue to Create Profile <ArrowRight size={18} />
                          </button>
                        )}

                        {!preview && !result && (
                          <div className="flex flex-wrap gap-2">
                            <span className="bg-gray-200 text-gray-500 px-3 py-1 rounded-full text-xs">Breed Detection</span>
                            <span className="bg-gray-200 text-gray-500 px-3 py-1 rounded-full text-xs">Age Estimation</span>
                            <span className="bg-gray-200 text-gray-500 px-3 py-1 rounded-full text-xs">Size Classification</span>
                          </div>
                        )}
                    </div>
                </div>
                <div className="w-full lg:w-1/2">
                    <span className="text-primary font-bold tracking-wider uppercase text-sm">Easy Onboarding</span>
                    <h2 className="text-3xl sm:text-4xl font-display font-bold text-gray-900 mt-2 mb-6">
                        Let AI Help You Build<br/>The Perfect Profile
                    </h2>
                    <ul className="space-y-6">
                        <li className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-full bg-orange-100 text-primary flex items-center justify-center shrink-0">
                                <Wand2 size={20} />
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900 text-lg">AI Recognition</h4>
                                <p className="text-gray-600">Upload a photo and let our AI suggest the breed and color tags instantly.</p>
                            </div>
                        </li>
                         <li className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-full bg-blue-100 text-secondary flex items-center justify-center shrink-0">
                                <Video size={20} />
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900 text-lg">Video Moments</h4>
                                <p className="text-gray-600">Showcase your pet's personality with a 10s short video clip.</p>
                            </div>
                        </li>
                         <li className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0">
                                <Shield size={20} />
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900 text-lg">Privacy First</h4>
                                <p className="text-gray-600">You control what information is visible to the public.</p>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
