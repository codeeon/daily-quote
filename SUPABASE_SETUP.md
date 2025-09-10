# Supabase 설정 가이드

## 🗄️ 데이터베이스 테이블 생성

Supabase 대시보드에서 다음 SQL을 실행하세요:

```sql
-- 1. daily_quotes 테이블 생성
CREATE TABLE IF NOT EXISTS daily_quotes (
  id SERIAL PRIMARY KEY,
  date DATE UNIQUE NOT NULL,
  message TEXT NOT NULL,
  author TEXT NOT NULL,
  author_profile TEXT DEFAULT '',
  quote_data JSONB,
  api_source TEXT DEFAULT 'korean-advice-api',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 인덱스 생성 (성능 향상)
CREATE INDEX IF NOT EXISTS idx_daily_quotes_date ON daily_quotes(date);

-- 3. RLS (Row Level Security) 활성화
ALTER TABLE daily_quotes ENABLE ROW LEVEL SECURITY;

-- 4. 읽기 권한 정책 (누구나 읽기 가능)
CREATE POLICY "Anyone can read quotes" 
ON daily_quotes FOR SELECT 
USING (true);

-- 5. 쓰기 권한 정책 (인증된 사용자만 쓰기 가능)
CREATE POLICY "Authenticated users can insert" 
ON daily_quotes FOR INSERT 
WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'anon');

-- 6. 업데이트 권한 정책 (인증된 사용자만 업데이트 가능)
CREATE POLICY "Authenticated users can update" 
ON daily_quotes FOR UPDATE 
USING (auth.role() = 'authenticated' OR auth.role() = 'anon');
```

## 🔑 환경변수 설정

### 1. Supabase 대시보드에서 키 복사
- **Settings** → **API** 페이지로 이동
- **Project URL** 복사
- **anon public** 키 복사 (⚠️ service_role 키가 아님!)

### 2. 환경변수 파일 생성

#### `.env.local` (로컬 개발용):
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
CRON_SECRET=your-secure-random-string
```

#### Vercel 환경변수 (배포용):
```bash
# Vercel 대시보드 또는 CLI로 설정
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY  
vercel env add CRON_SECRET
```

## 🧪 연결 테스트

앱을 실행하고 콘솔 로그를 확인하세요:

```bash
npm run dev
```

**성공시 로그:**
```
✅ Saving quote to Supabase: { supabaseUrl: 'configured', supabaseKey: 'configured' }
✅ Table access test passed, proceeding with upsert
✅ Successfully saved quote to Supabase: [...]
```

**실패시 로그:**
```
❌ Table access test failed: { message: '...', code: '...' }
```

## 🚨 일반적인 문제들

### 1. 테이블이 없는 경우
```
code: "42P01", message: "relation \"daily_quotes\" does not exist"
```
**해결책**: 위의 SQL 스크립트로 테이블 생성

### 2. RLS 권한 문제
```
code: "42501", message: "permission denied"
```
**해결책**: RLS 정책 확인 및 수정

### 3. 환경변수 누락
```
supabaseUrl: 'missing', supabaseKey: 'missing'
```
**해결책**: `.env.local` 파일 확인

## 📝 참고사항

- **Supabase 없이도 앱 작동**: DB 연결 실패시 API 직접 호출
- **anon 키는 공개 가능**: 클라이언트 사이드용으로 설계됨
- **service_role 키는 비공개**: 절대 클라이언트에 노출 금지