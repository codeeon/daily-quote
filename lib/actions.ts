'use server';

import { SupabaseService } from '@/lib/supabase';
import { isBeforeMinDate, getDeterministicIndex } from '@/lib/utils';
import type { Quote } from '@/types';

interface KoreanAdviceResponse {
  message: string;
  author: string;
  authorProfile: string;
}

// Emergency fallback quotes for when both API and DB fail
const EMERGENCY_FALLBACK_QUOTES: Omit<Quote, 'date' | 'source'>[] = [
  {
    message: "성공은 실패를 거듭한 끝에 찾아온다.",
    author: "한국 속담",
    authorProfile: "전통 지혜"
  },
  {
    message: "시작이 반이다.",
    author: "한국 속담", 
    authorProfile: "전통 지혜"
  },
  {
    message: "천 리 길도 한 걸음부터.",
    author: "한국 속담",
    authorProfile: "전통 지혜"
  },
  {
    message: "노력하는 자에게 길은 열린다.",
    author: "한국 속담",
    authorProfile: "전통 지혜"
  },
  {
    message: "오늘의 나를 만든 것은 어제의 선택이다.",
    author: "현대 명언",
    authorProfile: "자기계발"
  }
];

export async function getQuoteForDate(date: string): Promise<Quote> {
  // Check for future dates - reject if date is in the future
  const inputDate = new Date(date + 'T00:00:00');
  const today = new Date();
  today.setHours(23, 59, 59, 999); // End of today
  
  if (inputDate > today) {
    throw new Error('미래 날짜의 명언은 아직 공개되지 않았습니다.');
  }

  // Check for dates before minimum date (2025-09-01)
  if (isBeforeMinDate(inputDate)) {
    throw new Error('2025년 9월 1일 이후의 명언만 제공됩니다.');
  }

  console.log(`Fetching quote from database for date: ${date}`);
  
  const supabaseService = new SupabaseService();
  
  try {
    // Try to fetch from database first
    console.log(`Checking database for quote on date: ${date}`);
    const dbQuote = await supabaseService.getQuoteForDate(date);
    
    if (dbQuote) {
      console.log('✅ Quote found in database, using cached version:', {
        message: dbQuote.message.substring(0, 50) + '...',
        author: dbQuote.author,
        date: dbQuote.date
      });
      return {
        ...dbQuote,
        source: 'database' as const
      };
    }
    
    console.log('❌ No quote found in database, fetching from API and saving');
    
    try {
      // Fetch from Korean Advice API
      const response = await fetch('https://korean-advice-open-api.vercel.app/api/advice', {
        method: 'GET',
        headers: {
          'User-Agent': 'Daily-Quotes-App/1.0',
        },
        cache: 'no-cache',
        next: {
          tags: ['quote', `quote-${date}`],
        },
      });

      if (!response.ok) {
        console.error('Korean Advice API error:', response.status);
        throw new Error(`API responded with status: ${response.status}`);
      }

      const data: KoreanAdviceResponse = await response.json();

      if (!data.message || !data.author) {
        console.error('Invalid API response:', data);
        throw new Error('Invalid response format');
      }

      const quote: Quote = {
        message: data.message.trim(),
        author: data.author.trim(),
        authorProfile: data.authorProfile?.trim() || '',
        date,
        source: 'api' as const
      };

      console.log('Korean Advice API success, saving to database');
      
      // Save to database for future requests
      await supabaseService.saveQuoteHistory(date, quote);
      
      return quote;
      
    } catch (apiError) {
      console.error('API failed, using emergency fallback:', apiError);
      
      // Use emergency fallback when both DB and API fail
      const index = getDeterministicIndex(date, EMERGENCY_FALLBACK_QUOTES.length);
      const fallbackQuote = EMERGENCY_FALLBACK_QUOTES[index];
      
      return {
        ...fallbackQuote,
        date,
        source: 'fallback' as const
      };
    }
    
  } catch (error) {
    console.error('Error fetching quote:', error);
    
    // Last resort fallback
    const index = getDeterministicIndex(date, EMERGENCY_FALLBACK_QUOTES.length);
    const fallbackQuote = EMERGENCY_FALLBACK_QUOTES[index];
    
    return {
      ...fallbackQuote,
      date,
      source: 'fallback' as const
    };
  }
}

export async function getQuoteHistory(dates: string[]): Promise<Quote[]> {
  const quotes = await Promise.allSettled(
    dates.map(date => getQuoteForDate(date))
  );

  return quotes
    .filter((result): result is PromiseFulfilledResult<Quote> => 
      result.status === 'fulfilled'
    )
    .map(result => result.value);
}

export async function getRecentQuotes(days: number = 30): Promise<Quote[]> {
  const today = new Date();
  const dates: string[] = [];

  // Generate dates from today backwards (only past dates)
  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    // Additional safety check for future dates
    const dateString = date.toISOString().split('T')[0];
    const checkDate = new Date(dateString + 'T00:00:00');
    const todayCheck = new Date();
    todayCheck.setHours(23, 59, 59, 999);
    
    if (checkDate <= todayCheck) {
      dates.push(dateString);
    }
  }

  return getQuoteHistory(dates);
}