import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { videosApi } from '../api/client';

export function useVideos() {
  return useQuery({
    queryKey: ['videos'],
    queryFn: videosApi.list,
  });
}

export function useVideo(id: string) {
  return useQuery({
    queryKey: ['videos', id],
    queryFn: () => videosApi.get(id),
    enabled: !!id,
  });
}

export function useAddVideo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (url: string) => videosApi.add(url),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['videos'] });
    },
  });
}

export function useDeleteVideo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => videosApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['videos'] });
    },
  });
}
