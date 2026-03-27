import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Search, ArrowRight, Heart, Loader2 } from 'lucide-react';
import { petsService } from '../api/services/pets';
import { mockPets } from '../services/mockData';

const breedFallbackImages: Record<string, string> = {
  'ragdoll': 'https://cdn.pixabay.com/photo/2017/02/20/18/03/cat-2083492_1280.jpg',
  'cat': 'https://cdn.pixabay.com/photo/2017/02/20/18/03/cat-2083492_1280.jpg',
  'shiba': 'https://cdn.pixabay.com/photo/2019/07/23/13/51/dog-4357790_1280.jpg',
  'golden': 'https://cdn.pixabay.com/photo/2018/01/09/11/04/dog-3071334_1280.jpg',
  'husky': 'https://cdn.pixabay.com/photo/2016/02/19/15/46/dog-1210559_1280.jpg',
  'labrador': 'https://cdn.pixabay.com/photo/2016/12/13/05/15/puppy-1903313_1280.jpg',
  'pug': 'https://cdn.pixabay.com/photo/2015/03/26/09/47/pug-690566_1280.jpg',
  'beagle': 'https://cdn.pixabay.com/photo/2015/06/08/15/02/dog-801971_1280.jpg',
  'corgi': 'https://cdn.pixabay.com/photo/2019/08/19/07/45/corgi-4415649_1280.jpg',
  'bulldog': 'https://cdn.pixabay.com/photo/2015/11/17/13/13/bulldog-1047518_1280.jpg',
  'default': 'https://cdn.pixabay.com/photo/2016/02/19/15/46/dog-1210559_1280.jpg',
};

const getBreedImage = (breed: string): string => {
  const lower = breed.toLowerCase();
  for (const [key, url] of Object.entries(breedFallbackImages)) {
    if (lower.includes(key)) return url;
  }
  return breedFallbackImages['default'];
};

interface AdoptionPet {
  id: string;
  name: string;
  breed: string;
  size: string;
  gender: string;
  age: string;
  bio: string;
  image: string;
  personality_tags: string[];
  vaccinated: boolean;
  neutered: boolean;
  location?: string;
}

const Adoption = () => {
  const [apiPets, setApiPets] = useState<AdoptionPet[]>([]);
  const [loading, setLoading] = useState(true);

  const mockAdoptionPets: AdoptionPet[] = mockPets.map(p => ({
    id: `mock-${p.id}`,
    name: p.name,
    breed: p.breed,
    size: p.size,
    gender: p.gender,
    age: p.age,
    bio: p.description,
    image: p.image,
    personality_tags: p.personality,
    vaccinated: p.health?.vaccinated || false,
    neutered: p.health?.neutered || false,
    location: p.location,
  }));

  useEffect(() => {
    petsService.getPets({ limit: 50 })
      .then((res: any) => {
        const items = (res.data?.items || []).map((p: any) => ({
          id: p.id,
          name: p.name,
          breed: p.breed,
          size: p.size,
          gender: p.gender,
          age: p.age ? `${p.age} yrs` : 'Unknown',
          bio: p.bio,
          image: p.photos?.[0] || getBreedImage(p.breed || ''),
          personality_tags: p.personality_tags || [],
          vaccinated: p.vaccinated,
          neutered: p.neutered,
        }));
        setApiPets(items);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const pets = [...apiPets, ...mockAdoptionPets];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-10 text-center md:text-left">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl mb-4">
            Find Your New Best Friend
        </h1>
        <p className="mt-2 text-lg text-gray-500 max-w-2xl">
            Browse through loving pets waiting for their forever homes.
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm p-6 mb-10 border border-gray-100">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">
              <div className="lg:col-span-4 w-full">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Search by Name or Keyword</label>
                  <div className="relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Search className="text-gray-400" size={18} />
                      </div>
                      <input type="text" className="focus:ring-primary focus:border-primary block w-full pl-10 sm:text-sm border-gray-300 rounded-xl py-3" placeholder="e.g. 'Golden Retriever' or 'Playful'" />
                  </div>
              </div>
              <div className="lg:col-span-8 flex flex-col sm:flex-row gap-4 w-full">
                   <div className="w-full sm:w-1/3">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Breed</label>
                        <select className="block w-full pl-3 pr-10 py-3 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-xl">
                            <option>Any Breed</option>
                            <option>Mixed Breed</option>
                            <option>Golden Retriever</option>
                            <option>Labrador</option>
                        </select>
                   </div>
                   <div className="w-full sm:w-1/3">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
                        <select className="block w-full pl-3 pr-10 py-3 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-xl">
                            <option>Any Age</option>
                            <option>Puppy (0-1 yr)</option>
                            <option>Young (1-3 yrs)</option>
                            <option>Adult (3-8 yrs)</option>
                        </select>
                   </div>
                   <div className="w-full sm:w-auto sm:flex-shrink-0">
                        <label className="block text-sm font-medium text-transparent mb-2 select-none">Action</label>
                        <button className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-sm font-bold rounded-xl text-white bg-primary hover:bg-orange-600 transition-colors shadow-lg shadow-primary/30">
                            Apply Filters
                        </button>
                   </div>
              </div>
          </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-24">
          <Loader2 className="animate-spin text-primary" size={40} />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {pets.map((pet) => (
            <div key={pet.id} className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col h-full cursor-pointer">
              <div className="relative h-64 overflow-hidden bg-gray-100">
                {pet.image ? (
                  <img src={pet.image} alt={pet.name} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300 text-6xl">🐾</div>
                )}
                <div className="absolute bottom-3 left-3">
                  <span className="px-2 py-1 bg-green-500 text-white text-xs font-bold rounded-md shadow-sm">Available</span>
                </div>
              </div>
              <div className="p-5 flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary transition-colors">{pet.name}</h3>
                  <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded-md">{pet.breed}</span>
                </div>
                <div className="flex items-center gap-2 mb-3 text-xs text-gray-500 font-medium">
                  <span>{pet.age}</span> • <span>{pet.gender}</span> • <span className="capitalize">{pet.size}</span>
                </div>
                {pet.location && <p className="text-xs text-gray-400 mb-2">{pet.location}</p>}
                <p className="text-sm text-gray-600 line-clamp-2 mb-4 flex-grow">
                  {pet.bio || 'No description provided.'}
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {(pet.personality_tags || []).slice(0, 3).map(tag => (
                    <span key={tag} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800">
                      {tag}
                    </span>
                  ))}
                  {pet.vaccinated && <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">Vaccinated</span>}
                </div>
                <div className="mt-auto border-t border-gray-100 pt-4 flex items-center justify-end">
                  <span className="text-primary font-bold text-sm flex items-center gap-1 group-hover:translate-x-1 transition-transform duration-300">
                    Details <ArrowRight size={14} />
                  </span>
                </div>
              </div>
            </div>
          ))}

          {/* Promo Card */}
          <div className="bg-primary rounded-2xl overflow-hidden shadow-lg flex flex-col h-full justify-center items-center text-center p-8 relative">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10">
              <Heart size={64} className="text-white mb-4 mx-auto" />
              <h3 className="text-2xl font-bold text-white mb-2">Can't Adopt?</h3>
              <p className="text-white/90 mb-6">You can still help! Foster a pet or donate to support our local shelters.</p>
              <button className="bg-white text-primary font-bold py-3 px-6 rounded-xl hover:bg-gray-50 shadow-md transition-all transform hover:-translate-y-1">
                Learn How to Help
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Adoption;
