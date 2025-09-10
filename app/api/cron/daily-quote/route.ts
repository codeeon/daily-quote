import { NextResponse } from 'next/server';
import { SupabaseService } from '@/lib/supabase';
import type { Quote } from '@/types';

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
    message: "노력하는 자에게 길은 열린다.",
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
  }
];

interface KoreanAdviceResponse {
  message: string;
  author: string;
  authorProfile: string;
}

export async function POST(request: Request) {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Get today's date in KST
    const now = new Date();
    const kstOffset = 9 * 60; // KST is UTC+9
    const kst = new Date(now.getTime() + (kstOffset * 60 * 1000));
    const todayKST = kst.toISOString().split('T')[0];

    console.log(`Fetching daily quote for ${todayKST} (KST)`);

    const supabaseService = new SupabaseService();

    // Check if quote already exists for today
    const existingQuote = await supabaseService.getQuoteForDate(todayKST);
    if (existingQuote) {
      console.log('Quote already exists for today:', existingQuote);
      return NextResponse.json({ 
        success: true, 
        message: 'Quote already exists for today',
        quote: existingQuote 
      });
    }

    let quote: Quote;

    try {
      // Try fetching from Korean Advice API
      const response = await fetch('https://korean-advice-open-api.vercel.app/api/advice', {
        method: 'GET',
        headers: {
          'User-Agent': 'Daily-Quotes-Cron/1.0',
        },
        cache: 'no-cache',
      });

      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }

      const data: KoreanAdviceResponse = await response.json();

      if (!data.message || !data.author) {
        throw new Error('Invalid response format');
      }

      quote = {
        message: data.message.trim(),
        author: data.author.trim(),
        authorProfile: data.authorProfile?.trim() || '',
        date: todayKST,
      };

      console.log('Korean Advice API success');

    } catch (apiError) {
      console.error('Korean Advice API failed:', apiError);
      
      // Use deterministic fallback based on date
      const dateNum = new Date(todayKST).getTime();
      const index = Math.abs(dateNum) % FALLBACK_QUOTES.length;
      const fallbackQuote = FALLBACK_QUOTES[index];
      
      quote = {
        ...fallbackQuote,
        date: todayKST,
      };

      console.log('Using fallback quote:', quote);
    }

    // Save quote to database
    await supabaseService.saveQuoteHistory(todayKST, quote);

    console.log(`Successfully saved quote for ${todayKST}`);

    return NextResponse.json({ 
      success: true, 
      message: 'Daily quote saved successfully',
      quote 
    });

  } catch (error) {
    console.error('Cron job error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}