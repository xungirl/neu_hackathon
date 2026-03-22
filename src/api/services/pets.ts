import client from '../client';
import { ApiResponse, PaginatedResponse } from '../../types/api';
import { Pet } from '../../types';

export interface PetCreatePayload {
    name: string;
    breed: string;
    size: string;
    gender: string;
    age: number;
    vaccinated?: boolean;
    neutered?: boolean;
    personality_tags?: string[];
    activity_level?: number;
    sociability?: number;
    emotional_stability?: number;
    playfulness?: number;
    health_score?: number;
    photos?: string[];
    videos?: string[];
    looking_for?: string;
    bio?: string;
}

export const petsService = {
    getPets: (params?: any) => client.get<PaginatedResponse<Pet>>('/pets', { params }),
    getPetById: (id: string) => client.get<Pet>(`/pets/${id}`),
    createPet: (data: PetCreatePayload) => client.post<ApiResponse<Pet>>('/pets', data),
    updatePet: (id: string, data: Partial<PetCreatePayload>) => client.put<ApiResponse<Pet>>(`/pets/${id}`, data),
    deletePet: (id: string) => client.delete<void>(`/pets/${id}`),
};
