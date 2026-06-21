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

export const addMember = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: Member) => {
            const response = await api.post('/member', data);
            return response.data;
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['members'] });
        }
    })
}

export const updateMember = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: Member) => {
            const response = await api.patch(`/member/${data.Name}`, data);
            return response.data;
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['members'] });
            queryClient.invalidateQueries({ queryKey: ['members', variables.Name] });
        },
    })
}
