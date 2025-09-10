import { getQuoteForDate } from '@/lib/actions';
import { Navigation } from '@/components/Navigation';
import { QuoteCard } from '@/components/QuoteCard';
import { ErrorDisplay } from '@/components/ErrorDisplay';
import type { Quote } from '@/types';

interface QuoteDisplayProps {
  currentDate: string;
}

export async function QuoteDisplay({ currentDate }: QuoteDisplayProps) {
  let quote: Quote | null = null;
  let error: string | null = null;

  try {
    quote = await getQuoteForDate(currentDate);
  } catch (err) {
    error = err instanceof Error ? err.message : '명언을 불러오는데 실패했습니다.';
    console.error('Error loading quote:', err);
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Navigation */}
      <div>
        <Navigation currentDate={currentDate} />
      </div>

      {/* Quote Display */}
      <div className="fade-in">
        {error ? (
          <ErrorDisplay 
            error={{ 
              type: 'network_error' as const, 
              message: error, 
              retryable: false 
            }} 
          />
        ) : (
          <QuoteCard quote={quote} loading={false} />
        )}
      </div>
    </div>
  );
}