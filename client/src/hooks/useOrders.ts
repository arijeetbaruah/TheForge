import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { Order, OrderStatus, Category } from '../types/order';
import { ForgeUser } from '../types/user';

export const useOrders = () => {
  return useQuery<Order[]>({
    queryKey: ['orders'],
    queryFn: async () => {
      const response = await api.get('/orders/list');
      return response.data.data;
    },
  });
};

export const useOrder = (id: string) => {
  return useQuery<Order>({
    queryKey: ['orders', id],
    queryFn: async () => {
      const response = await api.get(`/orders/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};

export interface CreateOrderInput {
  category: Category;
  itemName: string;
  description: string;
  quantity: number;
  specialRequests: string | null;
}

export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, CreateOrderInput>({
    mutationFn: async (data: CreateOrderInput) => {
      const response = await api.post('/orders', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};

export interface UpdateOrderInput {
  id: string;
  status: OrderStatus;
  assignee: string | null;
  adminNote: string | null;
  internalNote: string | null;
}

export const useUpdateOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: UpdateOrderInput) => {
      const response = await api.patch(`/orders/${id}`, data);
      return response.data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['orders', variables.id] });
    },
  });
};

export const useDeleteOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/orders/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};

export const useUsers = () => {
  return useQuery<ForgeUser[]>({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await api.get('/users');
      return response.data;
    },
  });
};

export interface UpdateUserRoleInput {
  uid: string;
  role: 'USER' | 'MEMBER' | 'ADMIN';
}

export const useUpdateUserRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ uid, role }: UpdateUserRoleInput) => {
      const response = await api.patch(`/users/${uid}/role`, { role });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};
