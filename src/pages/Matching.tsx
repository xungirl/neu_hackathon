import React, { useState, useMemo } from 'react';
import { Heart, X, Star, MapPin, BadgeCheck, ChevronDown, Activity, Users, ShieldCheck, Ruler, AlertCircle } from 'lucide-react';
import { mockPets } from '../services/mockData';

const activityLabel = (v: number) => v >= 80 ? 'Very High' : v >= 60 ? 'High' : v >= 40 ? 'Moderate' : 'Low';
const sociabilityLabel = (v: number) => v >= 80 ? 'Loves Everyone' : v >= 60 ? 'Sociable' : v >= 40 ? 'Selective' : 'Shy';

const tagColors: Record<string, { bg: string; text: string }> = {
  Playful:   { bg: 'bg-yellow-100', text: 'text-yellow-700' },
  Calm:      { bg: 'bg-blue-100',   text: 'text-blue-700' },
  Energetic: { bg: 'bg-red-100',    text: 'text-red-700' },
  Friendly:  { bg: 'bg-green-100',  text: 'text-green-700' },
};

const Matching = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [gender, setGender] = useState<'Male' | 'Female'>('Female');
  const [distance, setDistance] = useState(25);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const allTags = ['Playful', 'Calm', 'Energetic', 'Friendly'];

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  const resetFilters = () => {
    setGender('Female');
    setDistance(25);
    setSelectedTags([]);
    setCurrentIndex(0);
  };

  const filteredPets = useMemo(() => {
    return mockPets.filter(p => {
      if (p.gender !== gender) return false;
      if (p.distanceMi > distance) return false;
      if (selectedTags.length > 0 && !selectedTags.some(t => p.personality.includes(t))) return false;
      return true;
    });
  }, [gender, distance, selectedTags]);

  const pet = filteredPets.length > 0 ? filteredPets[currentIndex % filteredPets.length] : null;

  const handleNext = () => setCurrentIndex(prev => prev + 1);

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row gap-8 bg-gray-50 min-h-[calc(100vh-64px)]">
      {/* Sidebar Filters */}
      <aside className="w-full md:w-1/4 hidden md:flex flex-col gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm sticky top-24 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-display font-bold text-gray-900">Filters</h2>
            <button onClick={resetFilters} className="text-sm text-primary font-semibold hover:text-primary-hover">Reset</button>
          </div>
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">Maximum Distance</label>
              <span className="text-sm font-bold text-primary">{distance} mi</span>
            </div>
            <input type="range" min="1" max="100" value={distance} onChange={e => setDistance(Number(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary" />
            <div className="flex justify-between mt-1 text-xs text-gray-500">
                <span>1mi</span>
                <span>100mi</span>
            </div>
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
            <div className="flex gap-2">
                <button onClick={() => { setGender('Male'); setCurrentIndex(0); }} className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-colors ${gender === 'Male' ? 'border-2 border-primary bg-primary/10 text-primary font-bold' : 'border border-gray-200 text-gray-600 hover:border-primary hover:text-primary'}`}>Male</button>
                <button onClick={() => { setGender('Female'); setCurrentIndex(0); }} className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-colors ${gender === 'Female' ? 'border-2 border-primary bg-primary/10 text-primary font-bold' : 'border border-gray-200 text-gray-600 hover:border-primary hover:text-primary'}`}>Female</button>
            </div>
          </div>
          <div className="mb-6">
             <label className="block text-sm font-medium text-gray-700 mb-2">Personality</label>
             <div className="flex flex-wrap gap-2">
                 {allTags.map(tag => (
                     <span key={tag} onClick={() => { toggleTag(tag); setCurrentIndex(0); }} className={`px-3 py-1 rounded-full text-xs font-medium cursor-pointer border transition-colors ${selectedTags.includes(tag) ? 'bg-primary text-white border-primary' : 'bg-gray-100 text-gray-600 border-transparent hover:border-primary hover:text-primary'}`}>
                         {tag}
                     </span>
                 ))}
             </div>
          </div>
          <div className="text-xs text-gray-400 text-center pt-4 border-t border-gray-100">
            {filteredPets.length} pet{filteredPets.length !== 1 ? 's' : ''} match your filters
          </div>
        </div>
      </aside>

      {/* Main Card Area */}
      <main className="w-full md:w-2/4 flex flex-col items-center justify-center">
        {pet ? (
          <>
            <div className="w-full max-w-md relative aspect-[3/4] md:aspect-[4/5] group">
                <div className="absolute inset-0 bg-white rounded-3xl overflow-hidden shadow-2xl border border-gray-100 transition-transform duration-300">
                    <div className="relative h-3/5 w-full">
                        <img src={pet.image} alt={pet.name} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>

                        <div className="absolute top-4 left-4 flex gap-2">
                            <span className="bg-black/30 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                                <MapPin size={12} /> {pet.distance} away
                            </span>
                            <span className="bg-primary text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 shadow-lg">
                                <BadgeCheck size={12} /> Verified
                            </span>
                        </div>

                        <div className="absolute bottom-0 left-0 w-full p-6 text-white">
                            <div className="flex items-end gap-3 mb-1">
                                <h1 className="text-4xl font-display font-bold">{pet.name}</h1>
                                <span className="text-xl font-medium mb-1.5 opacity-90">{pet.age}</span>
                            </div>
                            <p className="text-sm font-medium opacity-90">{pet.breed}</p>
                        </div>
                    </div>

                    <div className="h-2/5 p-5 flex flex-col justify-between bg-white relative overflow-y-auto">
                        {/* Gender / Size / Distance */}
                        <div className="flex gap-2 mb-2">
                            <span className="px-2.5 py-1 bg-purple-100 text-purple-700 rounded-lg text-xs font-bold">{pet.gender}</span>
                            <span className="px-2.5 py-1 bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold">{pet.size}</span>
                            <span className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-bold">{pet.location}</span>
                        </div>

                        {/* Personality tags */}
                        <div className="flex flex-wrap gap-1.5 mb-2">
                            {pet.personality.map(tag => {
                              const c = tagColors[tag] || { bg: 'bg-gray-100', text: 'text-gray-700' };
                              return (
                                <span key={tag} className={`px-2.5 py-1 ${c.bg} ${c.text} rounded-lg text-xs font-bold`}>
                                  {tag}
                                </span>
                              );
                            })}
                            {pet.tags.slice(0, 2).map(tag => (
                              <span key={tag} className="px-2.5 py-1 bg-orange-100 text-orange-700 rounded-lg text-xs font-bold">{tag}</span>
                            ))}
                        </div>

                        <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed mb-2">
                            {pet.description}
                        </p>

                        {/* Health badges */}
                        <div className="flex gap-2">
                            {pet.health?.vaccinated && <span className="text-green-600 text-[10px] font-bold flex items-center gap-0.5"><ShieldCheck size={12} /> Vaccinated</span>}
                            {pet.health?.neutered && <span className="text-blue-600 text-[10px] font-bold flex items-center gap-0.5"><ShieldCheck size={12} /> Neutered</span>}
                            {pet.health?.dewormed && <span className="text-purple-600 text-[10px] font-bold flex items-center gap-0.5"><ShieldCheck size={12} /> Dewormed</span>}
                        </div>

                        <div className="w-full flex justify-center mt-1">
                            <button className="text-gray-400 hover:text-gray-600 transition-colors">
                                <ChevronDown size={20} className="animate-bounce" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="absolute -bottom-8 left-0 right-0 flex justify-center items-center gap-6 z-20">
                    <button onClick={handleNext} className="w-16 h-16 rounded-full bg-white shadow-xl text-red-500 hover:bg-red-50 hover:scale-110 transition-all duration-300 flex items-center justify-center border border-gray-100">
                        <X size={32} />
                    </button>
                    <button className="w-12 h-12 rounded-full bg-white shadow-lg text-blue-400 hover:bg-blue-50 hover:scale-110 transition-all duration-300 flex items-center justify-center border border-gray-100">
                        <Star size={24} />
                    </button>
                    <button onClick={handleNext} className="w-16 h-16 rounded-full bg-primary shadow-xl shadow-primary/40 text-white hover:bg-red-500 hover:scale-110 transition-all duration-300 flex items-center justify-center">
                        <Heart size={32} fill="currentColor" />
                    </button>
                </div>
            </div>

            <p className="mt-16 text-gray-400 text-sm font-medium flex items-center gap-2">
                <span className="w-4 h-4 border border-gray-300 rounded flex items-center justify-center text-[10px]">←</span>
                Pass <span className="mx-2">|</span> Like
                <span className="w-4 h-4 border border-gray-300 rounded flex items-center justify-center text-[10px]">→</span>
            </p>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center text-center py-20">
            <AlertCircle size={48} className="text-gray-300 mb-4" />
            <h3 className="text-xl font-bold text-gray-700 mb-2">No pets found</h3>
            <p className="text-gray-400 text-sm mb-4">Try adjusting your filters to see more results</p>
            <button onClick={resetFilters} className="text-primary font-semibold text-sm hover:underline">Reset Filters</button>
          </div>
        )}
      </main>

       {/* Right Sidebar - Info */}
       <aside className="w-full md:w-1/4 hidden lg:block">
        {pet && (
        <div className="flex flex-col gap-6 sticky top-24">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="font-display font-bold text-lg text-gray-900 mb-4">About {pet.name}</h3>
                <div className="space-y-4">
                    <div className="flex items-start gap-3">
                        <div className="bg-purple-100 p-2 rounded-lg text-purple-600">
                            <Activity size={18} />
                        </div>
                        <div className="flex-1">
                            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Activity Level</p>
                            <div className="w-full bg-gray-200 h-1.5 rounded-full mt-1.5">
                                <div className="bg-purple-500 h-1.5 rounded-full" style={{width: `${pet.activityLevel}%`}}></div>
                            </div>
                            <p className="text-xs text-gray-900 mt-1 font-semibold">{activityLabel(pet.activityLevel)}</p>
                        </div>
                    </div>
                     <div className="flex items-start gap-3">
                        <div className="bg-orange-100 p-2 rounded-lg text-orange-600">
                            <Users size={18} />
                        </div>
                        <div className="flex-1">
                            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Sociability</p>
                            <div className="w-full bg-gray-200 h-1.5 rounded-full mt-1.5">
                                <div className="bg-orange-500 h-1.5 rounded-full" style={{width: `${pet.sociability}%`}}></div>
                            </div>
                            <p className="text-xs text-gray-900 mt-1 font-semibold">{sociabilityLabel(pet.sociability)}</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                            <Ruler size={18} />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Size</p>
                            <p className="text-xs text-gray-900 mt-1 font-semibold">{pet.size}</p>
                        </div>
                    </div>
                    <div className="border-t border-gray-100 pt-4 mt-2">
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-2">Health Status</p>
                        <div className="space-y-1.5">
                          <div className={`flex items-center gap-2 text-sm font-bold ${pet.health?.vaccinated ? 'text-green-600' : 'text-gray-400'}`}>
                              <ShieldCheck size={16} /> Vaccinated {pet.health?.vaccinated ? '✓' : '✗'}
                          </div>
                          <div className={`flex items-center gap-2 text-sm font-bold ${pet.health?.neutered ? 'text-green-600' : 'text-gray-400'}`}>
                              <ShieldCheck size={16} /> Neutered {pet.health?.neutered ? '✓' : '✗'}
                          </div>
                          <div className={`flex items-center gap-2 text-sm font-bold ${pet.health?.dewormed ? 'text-green-600' : 'text-gray-400'}`}>
                              <ShieldCheck size={16} /> Dewormed {pet.health?.dewormed ? '✓' : '✗'}
                          </div>
                        </div>
                    </div>
                    {pet.ownerName && (
                      <div className="border-t border-gray-100 pt-4 mt-2">
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-2">Owner</p>
                        <div className="flex items-center gap-2">
                          {pet.ownerImage && <img src={pet.ownerImage} alt={pet.ownerName} className="w-8 h-8 rounded-full object-cover" />}
                          <span className="text-sm font-semibold text-gray-900">{pet.ownerName}</span>
                        </div>
                      </div>
                    )}
                </div>
            </div>
        </div>
        )}
      </aside>
    </div>
  );
};

export default Matching;
