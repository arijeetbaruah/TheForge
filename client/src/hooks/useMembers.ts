//http://localhost:5173/api/members
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { Member } from '../types/member.ts';


export const useMembers = () => {
    return useQuery<Member[]>({
        queryKey: ['members'],
        queryFn: async () => {
            const response = await api.get('/members');
            return response.data.members;
        },
    });
};
