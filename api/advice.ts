import type { VercelRequest, VercelResponse } from '@vercel/node';

interface KoreanAdviceResponse {
  message: string;
  author: string;
  authorProfile: string;
}

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  // CORS 헤더 설정
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }

  if (request.method !== 'GET') {
    return response.status(405).json({ error: 'Method not allowed' });
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
    response.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate');
    
    return response.status(200).json({
      message: data.message,
      author: data.author,
      authorProfile: data.authorProfile || '',
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('API 호출 실패:', error);
    
    // 에러 시 fallback 응답
    const fallbackQuotes = [
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
      }
    ];
    
    // 간단한 해시로 fallback 선택
    const hash = Date.now() % fallbackQuotes.length;
    const fallbackQuote = fallbackQuotes[hash];
    
    return response.status(200).json({
      ...fallbackQuote,
      timestamp: new Date().toISOString(),
      fallback: true,
    });
  }
}