import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Heart, Share, CheckCircle, Activity, Shield, Calendar, MessageCircle, Info, Loader2, ArrowLeft } from 'lucide-react';
import { petsService } from '../api/services/pets';

interface ApiPet {
  id: number;
  name: string;
  breed: string;
  size: string;
  gender: string;
  age: number;
  bio: string;
  photos: string[];
  personality_tags: string[];
  vaccinated: boolean;
  neutered: boolean;
  looking_for: string;
  owner_id: number;
}

const ageLabel = (age: number) => {
  if (age <= 1) return 'Puppy';
  if (age <= 3) return 'Young';
  if (age <= 8) return 'Adult';
  return 'Senior';
};

const PetDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [pet, setPet] = useState<ApiPet | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState(0);

  useEffect(() => {
    if (!id) return;
    petsService.getPetById(id)
      .then((res: any) => setPet(res.data))
      .catch(() => navigate('/adoption'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="flex justify-center items-center py-24">
      <Loader2 className="animate-spin text-primary" size={40} />
    </div>
  );

  if (!pet) return null;

  const photos = pet.photos?.length ? pet.photos : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button onClick={() => navigate('/adoption')} className="flex items-center gap-1 text-sm text-gray-500 hover:text-primary mb-6 transition-colors">
        <ArrowLeft size={16} /> Back to Adoption
      </button>

      <div className="lg:grid lg:grid-cols-2 lg:gap-x-12 lg:items-start">
        {/* Image Gallery */}
        <div className="flex flex-col gap-4">
          <div className="aspect-w-4 aspect-h-3 w-full rounded-2xl overflow-hidden shadow-lg bg-gray-100 relative">
            {photos[selectedPhoto] ? (
              <img src={photos[selectedPhoto]} alt={pet.name} className="w-full h-96 object-cover" />
            ) : (
              <div className="w-full h-96 flex items-center justify-center text-gray-300 text-8xl">🐾</div>
            )}
            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-primary shadow-sm">
              Available for Adoption
            </div>
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
                <span className="block mt-1 text-xl font-bold text-gray-900">{ageLabel(pet.age)}</span>
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

          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Info className="text-primary" size={24} /> About Me
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              {pet.bio || 'No description provided.'}
            </p>
            <div className="flex flex-wrap gap-2 mt-4">
              {pet.vaccinated && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <CheckCircle size={14} className="mr-1"/> Vaccinated
                </span>
              )}
              {pet.neutered && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  <Shield size={14} className="mr-1"/> Neutered
                </span>
              )}
              {(pet.personality_tags || []).map(tag => (
                <span key={tag} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  <Activity size={14} className="mr-1"/> {tag}
                </span>
              ))}
            </div>
          </div>

          {pet.looking_for && (
            <div className="mb-8 p-5 bg-orange-50 border border-orange-100 rounded-xl">
              <h3 className="text-lg font-bold text-orange-800 mb-2 flex items-center gap-2">
                <Shield size={20} /> Looking For
              </h3>
              <p className="text-sm text-gray-700">{pet.looking_for}</p>
            </div>
          )}

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
