import { Suspense } from 'react';
import { getQuoteForDate } from '@/lib/actions';
import { formatDate, isBeforeMinDate, isFutureDate } from '@/lib/utils';
import { QuoteDisplay } from '@/components/QuoteDisplay';
import { QuoteCard } from '@/components/QuoteCard';
import { ErrorDisplay } from '@/components/ErrorDisplay';

interface SearchParams {
  date?: string;
}

interface Props {
  searchParams: Promise<SearchParams>;
}

function getValidDate(dateParam?: string): string {
  const today = new Date();
  const minDate = new Date('2025-09-01');
  
  if (dateParam) {
    const requestedDate = new Date(dateParam + 'T00:00:00');
    if (!isNaN(requestedDate.getTime()) && 
        !isFutureDate(requestedDate) && 
        !isBeforeMinDate(requestedDate)) {
      return dateParam;
    }
  }
  
  // Return today or min date, whichever is later
  return formatDate(today < minDate ? minDate : today);
}

export default async function Home({ searchParams }: Props) {
  const params = await searchParams;
  const currentDateString = getValidDate(params.date);
  
  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'>
      <div className='container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 sm:space-y-12'>
        {/* Header */}
        <header className='text-center space-y-4 sm:space-y-6'>
          <div className='fade-in space-y-2 sm:space-y-3'>
            <h1 className='text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent leading-tight'>
              매일의 명언
            </h1>
            <p className='text-base sm:text-lg text-muted-foreground max-w-xs sm:max-w-md mx-auto px-4 sm:px-0'>
              매일 새로운 지혜와 영감을 만나보세요
            </p>
          </div>
        </header>

        {/* Main Content */}
        <main className='w-full max-w-5xl mx-auto'>
          <Suspense fallback={
            <div className="space-y-6 sm:space-y-8">
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-600"></div>
              </div>
              <QuoteCard quote={null} loading={true} />
            </div>
          }>
            <QuoteDisplay currentDate={currentDateString} />
          </Suspense>
        </main>
      </div>
    </div>
  );
}