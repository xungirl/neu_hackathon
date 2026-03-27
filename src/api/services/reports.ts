import client from '../client';
import { ApiResponse } from '../../types/api';

export interface Report {
    id: number;
    user_id: string;
    lat: number | null;
    lng: number | null;
    type: 'lost' | 'stray';
    pet_name: string | null;
    description: string | null;
    color: string | null;
    size: string | null;
    photo_url: string | null;
    created_at: string;
}

export interface ReportCreatePayload {
    lat?: number;
    lng?: number;
    type: 'lost' | 'stray';
    pet_name?: string;
    description?: string;
    color?: string;
    size?: string;
    photo_url?: string;
}

export const reportsService = {
    getReports: (params?: { limit?: number; offset?: number }) =>
        client.get<ApiResponse<{ items: Report[]; total: number; limit: number; offset: number }>>('/reports', { params }),
    createReport: (data: ReportCreatePayload) =>
        client.post<ApiResponse<Report>>('/reports', data),
};
