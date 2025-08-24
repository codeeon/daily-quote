# 매일의 명언 (Daily Quotes) MVP

한국어 명언 API를 사용하는 매일의 명언 웹 애플리케이션입니다.

## 🌟 주요 기능

- **매일 고정 명언**: 날짜별로 결정적으로 선택되는 명언 (과거 명언 불변성 보장)
- **날짜 네비게이션**: 이전/다음 날짜 이동 (미래 날짜 접근 차단)
- **오프라인 지원**: 로컬 캐싱 및 폴백 명언 시스템
- **반응형 디자인**: 모든 기기에서 최적화된 UI/UX
- **다크 모드**: 라이트/다크 테마 지원
- **즐겨찾기**: 마음에 드는 명언을 즐겨찾기로 저장
- **공유 기능**: 웹 공유 API 및 클립보드 복사 지원
- **접근성**: ARIA 레이블 및 키보드 내비게이션 지원

## 🚀 기술 스택

- **Frontend**: Vite + React + TypeScript
- **UI/UX**: Tailwind CSS + shadcn/ui
- **상태 관리**: React Hooks (useState, useEffect, useCallback)
- **캐싱**: localStorage 기반 클라이언트 캐싱
- **API**: Korean Advice Open API
- **데이터베이스**: Supabase (선택사항)
- **배포**: Vercel

## 📦 설치 및 실행

### 필수 요구사항
- Node.js 18+ 
- npm 또는 yarn

### 로컬 개발

```bash
# 프로젝트 클론
git clone <repository-url>
cd sean

# 의존성 설치
npm install

# 환경 변수 설정 (선택사항)
cp .env.example .env
# .env 파일에서 Supabase 설정 추가 (필요시)

# 개발 서버 실행
npm run dev
```

개발 서버는 `http://localhost:5173`에서 실행됩니다.

## 🏗️ 프로젝트 구조

```
src/
├── components/          # React 컴포넌트
│   ├── ui/             # 재사용 가능한 UI 컴포넌트
│   ├── QuoteCard.tsx   # 명언 카드 컴포넌트
│   ├── Navigation.tsx  # 날짜 네비게이션
│   ├── ErrorDisplay.tsx # 에러 표시 컴포넌트
│   └── Settings.tsx    # 설정 모달
├── hooks/              # 커스텀 React 훅
│   ├── useQuote.ts     # 명언 데이터 관리 훅
│   └── useLocalStorage.ts # 로컬 스토리지 훅
├── lib/                # 유틸리티 및 설정
│   ├── utils.ts        # 공통 유틸리티 함수
│   └── supabase.ts     # Supabase 클라이언트 설정
├── services/           # API 서비스
│   └── api.ts          # Korean Advice API 서비스
├── types/              # TypeScript 타입 정의
│   └── index.ts        # 공통 타입 정의
├── App.tsx             # 메인 앱 컴포넌트
└── main.tsx           # 앱 엔트리 포인트
```

## 🔧 환경 설정

### Supabase 설정 (선택사항)

Supabase를 사용하여 명언 히스토리를 저장하려면:

1. [Supabase](https://supabase.com)에서 새 프로젝트 생성
2. 다음 테이블을 생성:

```sql
CREATE TABLE daily_quotes (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  date DATE UNIQUE NOT NULL,
  quote_data JSONB NOT NULL,
  message TEXT NOT NULL,
  author TEXT NOT NULL,
  author_profile TEXT,
  api_source TEXT DEFAULT 'korean-advice-api',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_daily_quotes_date ON daily_quotes(date);
```

3. `.env` 파일에 Supabase 설정 추가:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_publishable_key
```

> **중요**: Supabase 대시보드에서 **"Publishable key"**를 사용하세요 (Secret key가 아님)

> **참고**: Supabase 설정 없이도 앱이 완전히 작동합니다. 로컬 캐싱만 사용됩니다.

## 📱 주요 기능 설명

### 1. 결정적 명언 선택
- 날짜별로 고정된 명언이 표시됩니다
- 과거 명언은 절대 변경되지 않습니다
- 해시 함수를 사용한 일관된 선택 알고리즘

### 2. 캐싱 시스템
- API 응답을 localStorage에 캐싱
- 네트워크 오류 시 폴백 명언 제공
- 중복 API 호출 방지

### 3. 에러 처리
- 네트워크 오류, API 한도 초과, 잘못된 응답 등 다양한 오류 상황 처리
- 사용자 친화적인 에러 메시지
- 자동 재시도 메커니즘

### 4. 접근성
- ARIA 레이블 제공
- 키보드 내비게이션 지원
- 스크린 리더 호환성
- 색상 대비 최적화

## 🚀 배포

### Vercel 배포

```bash
# Vercel CLI 설치
npm i -g vercel

# 배포
vercel

# 환경 변수 설정 (필요시)
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
```

### 환경 변수 (Vercel)
Vercel 대시보드에서 다음 환경 변수를 설정하세요:
- `VITE_SUPABASE_URL` (선택사항)
- `VITE_SUPABASE_ANON_KEY` (선택사항)

## 🧪 테스트

```bash
# 빌드 테스트
npm run build

# 미리보기
npm run preview

# 타입 체크
npm run type-check
```

## 📊 성능 최적화

- **코드 분할**: React.lazy를 사용한 지연 로딩
- **메모이제이션**: React.memo, useMemo, useCallback 활용
- **이미지 최적화**: lazy loading 및 압축
- **번들 최적화**: Vite의 트리 쉐이킹 활용

## 🔒 보안

- **API 키 보안**: 환경 변수로 민감 정보 관리
- **XSS 방지**: React의 기본 XSS 보호 활용
- **HTTPS 강제**: Vercel에서 자동 HTTPS 적용

## 🤝 기여하기

1. 이 저장소를 포크하세요
2. 새 브랜치를 만드세요 (`git checkout -b feature/amazing-feature`)
3. 변경 사항을 커밋하세요 (`git commit -m 'Add amazing feature'`)
4. 브랜치에 푸시하세요 (`git push origin feature/amazing-feature`)
5. Pull Request를 생성하세요

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 있습니다.

## 🙏 감사의 말

- [Korean Advice Open API](https://korean-advice-open-api.vercel.app) - 명언 데이터 제공
- [shadcn/ui](https://ui.shadcn.com) - UI 컴포넌트 라이브러리
- [Lucide React](https://lucide.dev) - 아이콘 라이브러리
- [Tailwind CSS](https://tailwindcss.com) - CSS 프레임워크