import { use } from 'react';
import { formatDate, isBeforeMinDate, isFutureDate } from '@/lib/utils';
import { QuoteDisplay } from '@/components/QuoteDisplay';

interface SearchParams {
  date?: string;
}

interface HomePageProps {
  searchParams: Promise<SearchParams>;
}

function getValidDate(dateParam?: string): string {
  const today = new Date();
  const minDate = new Date('2025-09-01');

  if (dateParam) {
    const requestedDate = new Date(dateParam + 'T00:00:00');
    if (
      !isNaN(requestedDate.getTime()) &&
      !isFutureDate(requestedDate) &&
      !isBeforeMinDate(requestedDate)
    ) {
      return dateParam;
    }
  }

  // Return today or min date, whichever is later
  return formatDate(today < minDate ? minDate : today);
}

export function HomePage({ searchParams }: HomePageProps) {
  const params = use(searchParams);
  const currentDateString = getValidDate(params.date) || formatDate(new Date());

  return <QuoteDisplay currentDate={currentDateString} />;
}