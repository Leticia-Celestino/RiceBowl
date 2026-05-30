import { useQuery } from '@tanstack/react-query';
import { api } from '../../config/api';
import type { RiceDTO, PageResponse } from '../../types/rice';

export function useRices() {
    return useQuery({
        queryKey: ['rices', 'feed'], 
        queryFn: async () => {
            const response = await api.get<PageResponse<RiceDTO>>('/rices');
            return response.data.content;
        },
        staleTime: 1000 * 60 * 5, 
    });
}