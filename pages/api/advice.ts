import type { NextApiRequest, NextApiResponse } from 'next';

interface KoreanAdviceResponse {
  message: string;
  author: string;
  authorProfile: string;
}

interface ApiResponse {
  message: string;
  author: string;
  authorProfile: string;
  timestamp: string;
  fallback?: boolean;
}

const FALLBACK_QUOTES = [
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
    message: "성공은 실패를 거듭한 끝에 찾아온다.",
    author: "한국 속담",
    authorProfile: "전통 지혜"
  },
  {
    message: "오늘의 나를 만든 것은 어제의 선택이다.",
    author: "현대 명언",
    authorProfile: "자기계발"
  }
];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
): Promise<void> {
  // CORS 헤더 설정
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({
      message: 'Method not allowed',
      author: 'System',
      authorProfile: 'Error',
      timestamp: new Date().toISOString(),
    });
    return;
  }

  try {
    console.log('Korean Advice API 호출 시작');
    
    // Korean Advice API 호출
    const apiResponse = await fetch('https://korean-advice-open-api.vercel.app/api/advice', {
      method: 'GET',
      headers: {
        'User-Agent': 'Daily-Quotes-App/1.0',
      },
    });

    if (!apiResponse.ok) {
      console.error('Korean Advice API 오류:', apiResponse.status);
      throw new Error(`API responded with status: ${apiResponse.status}`);
    }

    const data: KoreanAdviceResponse = await apiResponse.json();

    if (!data.message || !data.author) {
      console.error('Invalid API response:', data);
      throw new Error('Invalid response format');
    }

    console.log('Korean Advice API 호출 성공');
    
    // 캐시 헤더 설정 (5분)
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate');
    
    res.status(200).json({
      message: data.message,
      author: data.author,
      authorProfile: data.authorProfile || '',
      timestamp: new Date().toISOString(),
    });
    return;

  } catch (error) {
    console.error('API 호출 실패:', error);
    
    // 에러 시 fallback 응답
    const hash = Date.now() % FALLBACK_QUOTES.length;
    const fallbackQuote = FALLBACK_QUOTES[hash];
    
    res.status(200).json({
      ...fallbackQuote,
      timestamp: new Date().toISOString(),
      fallback: true,
    });
    return;
  }
}