import { useQuery } from '@tanstack/react-query';
import { progressApi } from '../api/client';

export function useProgressOverview() {
  return useQuery({
    queryKey: ['progress-overview'],
    queryFn: progressApi.getOverview,
  });
}

export function useStreak() {
  return useQuery({
    queryKey: ['streak'],
    queryFn: progressApi.getStreak,
  });
}

export function useDailyStats() {
  return useQuery({
    queryKey: ['daily-stats'],
    queryFn: progressApi.getDaily,
  });
}
