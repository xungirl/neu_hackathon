import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Heart, Share, CheckCircle, Activity, Shield, Calendar, MessageCircle, Info, Loader2, ArrowLeft, MapPin, Ruler, Users } from 'lucide-react';
import { petsService } from '../api/services/pets';
import { mockPets } from '../services/mockData';

interface PetData {
  name: string;
  breed: string;
  size: string;
  gender: string;
  age: string;
  bio: string;
  image: string;
  photos: string[];
  personality_tags: string[];
  vaccinated: boolean;
  neutered: boolean;
  dewormed: boolean;
  location?: string;
  ownerName?: string;
  ownerImage?: string;
  activityLevel?: number;
  sociability?: number;
  distance?: string;
  tags?: string[];
}

const activityLabel = (v: number) => v >= 80 ? 'Very High' : v >= 60 ? 'High' : v >= 40 ? 'Moderate' : 'Low';
const sociabilityLabel = (v: number) => v >= 80 ? 'Loves Everyone' : v >= 60 ? 'Sociable' : v >= 40 ? 'Selective' : 'Shy';

const PetDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [pet, setPet] = useState<PetData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState(0);

  useEffect(() => {
    if (!id) return;

    // Check if it's a mock pet
    if (id.startsWith('mock-')) {
      const mockId = id.replace('mock-', '');
      const found = mockPets.find(p => p.id === mockId);
      if (found) {
        setPet({
          name: found.name,
          breed: found.breed,
          size: found.size,
          gender: found.gender,
          age: found.age,
          bio: found.description,
          image: found.image,
          photos: found.images,
          personality_tags: found.personality,
          vaccinated: found.health?.vaccinated || false,
          neutered: found.health?.neutered || false,
          dewormed: found.health?.dewormed || false,
          location: found.location,
          ownerName: found.ownerName,
          ownerImage: found.ownerImage,
          activityLevel: found.activityLevel,
          sociability: found.sociability,
          distance: found.distance,
          tags: found.tags,
        });
      }
      setLoading(false);
      return;
    }

    // API pet
    petsService.getPetById(id)
      .then((res: any) => {
        const p = res.data;
        setPet({
          name: p.name,
          breed: p.breed,
          size: p.size,
          gender: p.gender,
          age: p.age ? `${p.age} yrs` : 'Unknown',
          bio: p.bio,
          image: p.photos?.[0] || '',
          photos: p.photos || [],
          personality_tags: p.personality_tags || [],
          vaccinated: p.vaccinated,
          neutered: p.neutered,
          dewormed: false,
          tags: [],
        });
      })
      .catch(() => navigate('/adoption'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="flex justify-center items-center py-24">
      <Loader2 className="animate-spin text-primary" size={40} />
    </div>
  );

  if (!pet) return null;

  const photos = pet.photos?.length ? pet.photos : pet.image ? [pet.image] : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button onClick={() => navigate('/adoption')} className="flex items-center gap-1 text-sm text-gray-500 hover:text-primary mb-6 transition-colors">
        <ArrowLeft size={16} /> Back to Adoption
      </button>

      <div className="lg:grid lg:grid-cols-2 lg:gap-x-12 lg:items-start">
        {/* Image Gallery */}
        <div className="flex flex-col gap-4">
          <div className="w-full rounded-2xl overflow-hidden shadow-lg bg-gray-100 relative">
            {photos[selectedPhoto] ? (
              <img src={photos[selectedPhoto]} alt={pet.name} className="w-full h-96 object-cover" />
            ) : (
              <div className="w-full h-96 flex items-center justify-center text-gray-300 text-8xl">🐾</div>
            )}
            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-primary shadow-sm">
              Available for Adoption
            </div>
            {pet.distance && (
              <div className="absolute top-4 left-4 bg-black/40 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-white flex items-center gap-1">
                <MapPin size={12} /> {pet.distance} away
              </div>
            )}
          </div>
          {photos.length > 1 && (
            <div className="grid grid-cols-4 gap-3">
              {photos.slice(0, 4).map((img, idx) => (
                <button key={idx} onClick={() => setSelectedPhoto(idx)}
                  className={`relative aspect-square rounded-lg overflow-hidden ${idx === selectedPhoto ? 'ring-2 ring-primary ring-offset-2' : 'hover:opacity-75 transition-opacity'}`}>
                  <img src={img} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="mt-10 px-2 sm:px-0 sm:mt-16 lg:mt-0">
          <div className="mb-8 border-b border-gray-200 pb-8">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">{pet.name}</h1>
                <p className="mt-2 text-lg text-primary font-medium">{pet.breed}</p>
                {pet.location && (
                  <p className="mt-1 text-sm text-gray-500 flex items-center gap-1">
                    <MapPin size={14} /> {pet.location}
                  </p>
                )}
              </div>
              <div className="flex space-x-2">
                <button className="p-2 rounded-full bg-gray-100 text-gray-400 hover:text-red-500 transition-colors">
                  <Heart size={24} />
                </button>
                <button className="p-2 rounded-full bg-gray-100 text-gray-400 hover:text-blue-500 transition-colors">
                  <Share size={24} />
                </button>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-4">
              <div className="bg-white border border-gray-200 rounded-xl p-4 text-center shadow-sm">
                <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">Age</span>
                <span className="block mt-1 text-xl font-bold text-gray-900">{pet.age}</span>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl p-4 text-center shadow-sm">
                <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">Gender</span>
                <span className="block mt-1 text-xl font-bold text-gray-900">{pet.gender}</span>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl p-4 text-center shadow-sm">
                <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">Size</span>
                <span className="block mt-1 text-xl font-bold text-gray-900 capitalize">{pet.size}</span>
              </div>
            </div>
          </div>

          {/* About */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Info className="text-primary" size={24} /> About {pet.name}
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              {pet.bio || 'No description provided.'}
            </p>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-8">
            {pet.personality_tags.map(tag => (
              <span key={tag} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                {tag}
              </span>
            ))}
            {(pet.tags || []).map(tag => (
              <span key={tag} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                {tag}
              </span>
            ))}
          </div>

          {/* Activity & Sociability */}
          {(pet.activityLevel !== undefined || pet.sociability !== undefined) && (
            <div className="mb-8 grid grid-cols-2 gap-4">
              {pet.activityLevel !== undefined && (
                <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity size={16} className="text-purple-500" />
                    <span className="text-xs font-bold text-gray-500 uppercase">Activity</span>
                  </div>
                  <div className="w-full bg-gray-200 h-2 rounded-full">
                    <div className="bg-purple-500 h-2 rounded-full" style={{width: `${pet.activityLevel}%`}}></div>
                  </div>
                  <p className="text-sm font-semibold text-gray-900 mt-1">{activityLabel(pet.activityLevel)}</p>
                </div>
              )}
              {pet.sociability !== undefined && (
                <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <Users size={16} className="text-orange-500" />
                    <span className="text-xs font-bold text-gray-500 uppercase">Sociability</span>
                  </div>
                  <div className="w-full bg-gray-200 h-2 rounded-full">
                    <div className="bg-orange-500 h-2 rounded-full" style={{width: `${pet.sociability}%`}}></div>
                  </div>
                  <p className="text-sm font-semibold text-gray-900 mt-1">{sociabilityLabel(pet.sociability)}</p>
                </div>
              )}
            </div>
          )}

          {/* Health */}
          <div className="mb-8 p-5 bg-green-50 border border-green-100 rounded-xl">
            <h3 className="text-lg font-bold text-green-800 mb-3 flex items-center gap-2">
              <Shield size={20} /> Health Status
            </h3>
            <div className="flex flex-wrap gap-3">
              <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold ${pet.vaccinated ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-400'}`}>
                <CheckCircle size={14} className="mr-1"/> Vaccinated {pet.vaccinated ? '✓' : '✗'}
              </span>
              <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold ${pet.neutered ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-400'}`}>
                <Shield size={14} className="mr-1"/> Neutered {pet.neutered ? '✓' : '✗'}
              </span>
              <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold ${pet.dewormed ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-400'}`}>
                <CheckCircle size={14} className="mr-1"/> Dewormed {pet.dewormed ? '✓' : '✗'}
              </span>
            </div>
          </div>

          {/* Owner */}
          {pet.ownerName && (
            <div className="mb-8 flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
              {pet.ownerImage && <img src={pet.ownerImage} alt={pet.ownerName} className="w-12 h-12 rounded-full object-cover border-2 border-white shadow" />}
              <div>
                <p className="text-xs text-gray-500 font-medium">Owner</p>
                <p className="text-sm font-bold text-gray-900">{pet.ownerName}</p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-gray-200">
            <button className="flex-1 bg-primary hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-xl shadow-md transition transform active:scale-95 flex items-center justify-center gap-2">
              <MessageCircle size={20} /> Contact Owner
            </button>
            <button className="flex-1 bg-white border-2 border-primary text-primary hover:bg-orange-50 font-bold py-3 px-6 rounded-xl transition transform active:scale-95 flex items-center justify-center gap-2">
              <Calendar size={20} /> Meet & Greet
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PetDetails;
