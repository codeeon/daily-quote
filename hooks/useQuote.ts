import { useState, useEffect, useCallback } from 'react';
import type { Quote, LoadingState, AppError } from '@/types';
import { ErrorType } from '@/types';
import { ApiService } from '@/services/api';
import { SupabaseService } from '@/lib/supabase';
import { formatDate, addDays } from '@/lib/utils';

const apiService = new ApiService();
const supabaseService = new SupabaseService();

export function useQuote(date: Date) {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState<LoadingState>({
    isLoading: false,
    error: null,
  });

  const dateString = formatDate(date);

  const fetchQuote = useCallback(async (retryCount = 0) => {
    if (loading.isLoading) return;

    setLoading({ isLoading: true, error: null });

    try {
      // First try to get from Supabase (for historical consistency)
      const supabaseQuote = await supabaseService.getQuoteForDate(dateString);
      if (supabaseQuote) {
        setQuote(supabaseQuote);
        setLoading({ isLoading: false, error: null });
        return;
      }

      // If not in Supabase, get from API service
      const apiQuote = await apiService.getQuoteForDate(dateString);
      setQuote(apiQuote);

      // Save to Supabase for future reference (if available)
      if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        await supabaseService.saveQuoteHistory(dateString, apiQuote);
      }

      setLoading({ isLoading: false, error: null });
    } catch (error) {
      console.error(`명언 로딩 실패 (시도 ${retryCount + 1}/3):`, error);

      const appError: AppError = {
        type: ErrorType.NETWORK_ERROR,
        message: '명언을 불러오는데 실패했습니다.',
        retryable: retryCount < 2 // 3회 제한 (0, 1, 2)
      };

      if (error instanceof Error) {
        switch (error.message) {
          case ErrorType.RATE_LIMIT:
            appError.type = ErrorType.RATE_LIMIT;
            appError.message = '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.';
            break;
          case ErrorType.API_UNAVAILABLE:
            appError.type = ErrorType.API_UNAVAILABLE;
            appError.message = 'API 서비스를 사용할 수 없습니다.';
            break;
          case ErrorType.INVALID_RESPONSE:
            appError.type = ErrorType.INVALID_RESPONSE;
            appError.message = '잘못된 응답을 받았습니다.';
            break;
        }
      }

      // 재시도 제한: 최대 3회
      if (appError.retryable && retryCount < 2) {
        console.log(`${1000 * (retryCount + 1)}ms 후 재시도... (${retryCount + 1}/3)`);
        setTimeout(() => {
          fetchQuote(retryCount + 1);
        }, 1000 * (retryCount + 1));
      } else {
        console.log('최대 재시도 횟수 도달 또는 재시도 불가능한 오류');
        setLoading({ isLoading: false, error: appError });
      }
    }
  }, [dateString, loading.isLoading]);

  const retry = useCallback(() => {
    fetchQuote(0);
  }, [fetchQuote]);

  const prefetchAdjacentQuotes = useCallback(async () => {
    const yesterday = addDays(date, -1);
    const tomorrow = addDays(date, 1);
    
    // Don't prefetch future dates
    const datesToPrefetch = [formatDate(yesterday)];
    if (!isFutureDate(tomorrow)) {
      datesToPrefetch.push(formatDate(tomorrow));
    }

    await apiService.prefetchQuotes(datesToPrefetch);
  }, [date]);

  useEffect(() => {
    fetchQuote();
  }, [fetchQuote]);

  useEffect(() => {
    // Prefetch adjacent dates after a short delay
    const timer = setTimeout(() => {
      prefetchAdjacentQuotes();
    }, 500);

    return () => clearTimeout(timer);
  }, [prefetchAdjacentQuotes]);

  return {
    quote,
    loading: loading.isLoading,
    error: loading.error,
    retry,
    refetch: () => fetchQuote(0),
  };
}

function isFutureDate(date: Date): boolean {
  const today = new Date();
  today.setHours(23, 59, 59, 999); // End of today
  return date > today;
}