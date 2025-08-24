import type { Quote, ApiResponse, AppError } from '@/types';
import { ErrorType } from '@/types';
import { getDeterministicIndex } from '@/lib/utils';

// Next.js API routes 사용
const API_BASE_URL = '/api/advice';
const CACHE_KEY_PREFIX = 'quote_cache_';
const CACHE_METADATA_KEY = 'quote_cache_metadata';
const QUOTE_MAPPING_KEY = 'quote_date_mapping';

// Fallback quotes in case API is unavailable
const FALLBACK_QUOTES: Quote[] = [
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
    message: "오늘의 나를 만든 것은 어제의 선택이다.",
    author: "현대 명언",
    authorProfile: "자기계발"
  },
  {
    message: "꿈을 꾸지 않으면 현실을 바꿀 수 없다.",
    author: "현대 명언",
    authorProfile: "영감"
  },
  {
    message: "가장 어두운 밤이 지나면 새벽이 온다.",
    author: "한국 속담",
    authorProfile: "전통 지혜"
  },
  {
    message: "물방울이 바위를 뚫는다.",
    author: "한국 속담",
    authorProfile: "전통 지혜"
  },
  {
    message: "행복은 선택이다.",
    author: "현대 명언",
    authorProfile: "긍정적 사고"
  },
  {
    message: "지금 이 순간이 가장 중요하다.",
    author: "현대 명언",
    authorProfile: "현재에 집중"
  },
  {
    message: "노력하는 자에게 길은 열린다.",
    author: "한국 속담",
    authorProfile: "전통 지혜"
  },
  {
    message: "작은 변화가 큰 결과를 만든다.",
    author: "현대 명언",
    authorProfile: "성장 마인드셋"
  },
  {
    message: "실패는 성공의 어머니다.",
    author: "한국 속담",
    authorProfile: "전통 지혜"
  },
  {
    message: "감사하는 마음이 행복을 부른다.",
    author: "현대 명언",
    authorProfile: "감사"
  },
  {
    message: "인내는 쓰지만 그 열매는 달다.",
    author: "한국 속담",
    authorProfile: "전통 지혜"
  },
  {
    message: "오늘 하루를 최선을 다해 살아보자.",
    author: "현대 명언",
    authorProfile: "일상의 지혜"
  },
  {
    message: "마음이 바뀌면 행동이 바뀐다.",
    author: "현대 명언",
    authorProfile: "변화"
  },
  {
    message: "고생 끝에 낙이 온다.",
    author: "한국 속담",
    authorProfile: "전통 지혜"
  },
  {
    message: "배움에는 끝이 없다.",
    author: "현대 명언",
    authorProfile: "평생학습"
  },
  {
    message: "희망을 잃지 말고 꿈을 향해 나아가자.",
    author: "현대 명언",
    authorProfile: "희망"
  },
  {
    message: "내일의 성공은 오늘의 준비에 달려있다.",
    author: "현대 명언",
    authorProfile: "준비"
  }
];

class QuoteCache {
  private getMetadata() {
    try {
      const metadata = localStorage.getItem(CACHE_METADATA_KEY);
      return metadata ? JSON.parse(metadata) : { size: 0, lastCleared: Date.now(), entries: [] };
    } catch {
      return { size: 0, lastCleared: Date.now(), entries: [] };
    }
  }

  private setMetadata(metadata: { size: number; lastCleared: number; entries: string[] }) {
    try {
      localStorage.setItem(CACHE_METADATA_KEY, JSON.stringify(metadata));
    } catch {
      // Handle storage quota exceeded
    }
  }

  get(key: string): Quote | null {
    try {
      const data = localStorage.getItem(CACHE_KEY_PREFIX + key);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  set(key: string, value: Quote): void {
    try {
      localStorage.setItem(CACHE_KEY_PREFIX + key, JSON.stringify(value));
      const metadata = this.getMetadata();
      if (!metadata.entries.includes(key)) {
        metadata.entries.push(key);
        metadata.size++;
        this.setMetadata(metadata);
      }
    } catch {
      // Handle storage quota exceeded - could implement LRU eviction here
    }
  }

  clear(): void {
    const metadata = this.getMetadata();
    metadata.entries.forEach((key: string) => {
      try {
        localStorage.removeItem(CACHE_KEY_PREFIX + key);
      } catch {
        // Ignore errors
      }
    });
    this.setMetadata({ size: 0, lastCleared: Date.now(), entries: [] });
  }

  getInfo() {
    return this.getMetadata();
  }
}

class QuoteDateMapping {
  private getMappings(): Record<string, string> {
    try {
      const data = localStorage.getItem(QUOTE_MAPPING_KEY);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  }

  private setMappings(mappings: Record<string, string>): void {
    try {
      localStorage.setItem(QUOTE_MAPPING_KEY, JSON.stringify(mappings));
    } catch {
      // Handle storage quota exceeded
    }
  }

  getQuoteId(date: string): string | null {
    const mappings = this.getMappings();
    return mappings[date] || null;
  }

  setQuoteId(date: string, quoteId: string): void {
    const mappings = this.getMappings();
    // Only set if not already exists (preserve historical consistency)
    if (!mappings[date]) {
      mappings[date] = quoteId;
      this.setMappings(mappings);
    }
  }
}

export class ApiService {
  private cache = new QuoteCache();
  private mapping = new QuoteDateMapping();
  private requestMap = new Map<string, Promise<Quote>>();

  async fetchQuoteFromApi(): Promise<Quote> {
    console.log(`API 호출 시작: ${API_BASE_URL}`);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch(API_BASE_URL, {
        signal: controller.signal,
        method: 'GET',
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.error('서버 액션 응답 오류:', response.status);
        throw new Error(ErrorType.API_UNAVAILABLE);
      }

      const data: ApiResponse = await response.json();
      
      if (!data.message || !data.author) {
        console.error('잘못된 응답 형식:', data);
        throw new Error(ErrorType.INVALID_RESPONSE);
      }

      console.log('Next.js API 호출 성공:', data.fallback ? '(fallback)' : '(실제 API)');
      
      return {
        message: data.message,
        author: data.author,
        authorProfile: data.authorProfile || '',
      };
    } catch (error) {
      clearTimeout(timeoutId);
      
      console.error('서버 액션 호출 실패:', error);
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error(ErrorType.NETWORK_ERROR);
        }
        throw error;
      }
      throw new Error(ErrorType.NETWORK_ERROR);
    }
  }

  getFallbackQuote(date: string): Quote {
    const index = getDeterministicIndex(date, FALLBACK_QUOTES.length);
    return { ...FALLBACK_QUOTES[index], date };
  }

  async getQuoteForDate(date: string): Promise<Quote> {
    // Check if we have a pending request for this date
    if (this.requestMap.has(date)) {
      console.log(`${date} 날짜의 요청이 이미 진행 중입니다.`);
      return this.requestMap.get(date)!;
    }

    console.log(`${date} 날짜의 명언 요청 시작`);
    const promise = this.fetchQuoteForDateInternal(date);
    this.requestMap.set(date, promise);
    
    try {
      const result = await promise;
      console.log(`${date} 날짜의 명언 요청 완료`);
      return result;
    } finally {
      this.requestMap.delete(date);
    }
  }

  private async fetchQuoteForDateInternal(date: string): Promise<Quote> {
    // Check if we already have a consistent mapping for this date
    const existingQuoteId = this.mapping.getQuoteId(date);
    if (existingQuoteId) {
      const cachedQuote = this.cache.get(existingQuoteId);
      if (cachedQuote) {
        console.log(`${date} 날짜의 캐시된 명언 반환`);
        return { ...cachedQuote, date };
      }
    }

    try {
      // 서버 액션을 통한 API 호출
      const quote = await this.fetchQuoteFromApi();
      
      // Create a unique ID for this quote
      const quoteId = `${date}-${Date.now()}`;
      
      // Store in cache and mapping
      this.cache.set(quoteId, quote);
      this.mapping.setQuoteId(date, quoteId);
      
      return { ...quote, date };
    } catch (error) {
      console.warn(`${date} 날짜 API 호출 실패, fallback 사용:`, error);
      
      // If we have an existing mapping but no cache, use fallback
      if (existingQuoteId) {
        const fallback = this.getFallbackQuote(date);
        this.cache.set(existingQuoteId, fallback);
        return fallback;
      }
      
      // Create new fallback mapping
      const fallback = this.getFallbackQuote(date);
      const fallbackId = `fallback-${date}`;
      this.cache.set(fallbackId, fallback);
      this.mapping.setQuoteId(date, fallbackId);
      
      return fallback;
    }
  }

  async prefetchQuotes(dates: string[]): Promise<void> {
    const promises = dates.map(date => 
      this.getQuoteForDate(date).catch(() => null) // Ignore errors in prefetch
    );
    await Promise.allSettled(promises);
  }

  clearCache(): void {
    this.cache.clear();
  }

  getCacheStatus() {
    return this.cache.getInfo();
  }

  createError(type: ErrorType, message: string, retryable: boolean = true): AppError {
    return { type, message, retryable };
  }
}