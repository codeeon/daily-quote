'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Calendar, Home, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';

dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

interface NavigationProps {
  currentDate: string;
  className?: string;
}

export function Navigation({ currentDate, className }: NavigationProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [loadingDirection, setLoadingDirection] = useState<'prev' | 'next' | 'today' | null>(null);
  
  const current = dayjs(currentDate);
  const today = dayjs();
  const minDate = dayjs('2025-09-01');

  const handlePrevDay = () => {
    const prevDate = current.subtract(1, 'day');
    
    if (prevDate.isAfter(minDate) || prevDate.isSame(minDate)) {
      setLoadingDirection('prev');
      startTransition(() => {
        router.replace(`/?date=${prevDate.format('YYYY-MM-DD')}`);
      });
    }
  };

  const handleNextDay = () => {
    const nextDate = current.add(1, 'day');
    
    if (nextDate.isBefore(today) || nextDate.isSame(today)) {
      setLoadingDirection('next');
      startTransition(() => {
        router.replace(`/?date=${nextDate.format('YYYY-MM-DD')}`);
      });
    }
  };

  const handleTodayClick = () => {
    const targetDate = today.isBefore(minDate) ? minDate : today;
    setLoadingDirection('today');
    startTransition(() => {
      router.replace(`/?date=${targetDate.format('YYYY-MM-DD')}`);
    });
  };

  // Reset loading state when navigation completes
  if (!isPending && loadingDirection) {
    setLoadingDirection(null);
  }

  const canGoNext = current.add(1, 'day').isSameOrBefore(today);
  const canGoPrev = current.subtract(1, 'day').isSameOrAfter(minDate);
  const showTodayButton = !current.isSame(today, 'day');

  return (
    <div
      className={cn(
        'flex flex-col sm:flex-row items-center justify-between w-full max-w-4xl mx-auto gap-4 sm:gap-0',
        className
      )}
    >
      {/* Mobile: Date display on top */}
      <div className='flex items-center justify-between w-full sm:hidden'>
        <Button
          variant='outline'
          size='default'
          onClick={handlePrevDay}
          disabled={!canGoPrev || isPending}
          className={cn(
            'shadow-sm hover:shadow-md transition-shadow duration-200 flex-shrink-0',
            (!canGoPrev || isPending) && 'opacity-50 cursor-not-allowed'
          )}
          aria-label='이전 날짜'
        >
          {isPending && loadingDirection === 'prev' ? (
            <Loader2 className='h-4 w-4 animate-spin' />
          ) : (
            <ChevronLeft className='h-4 w-4' />
          )}
        </Button>

        <div className='flex items-center gap-2 px-4 py-2 rounded-lg bg-white/70 backdrop-blur-sm border border-white/20 shadow-lg mx-3 flex-1 justify-center'>
          <Calendar className='h-4 w-4 text-blue-600 flex-shrink-0' />
          <span className='font-semibold text-sm text-center'>
            {current.format('YYYY년 M월 D일 ddd')}
          </span>
        </div>

        <Button
          variant='outline'
          size='default'
          onClick={handleNextDay}
          disabled={!canGoNext || isPending}
          className={cn(
            'shadow-sm hover:shadow-md transition-shadow duration-200 flex-shrink-0',
            (!canGoNext || isPending) && 'opacity-50 cursor-not-allowed'
          )}
          aria-label='다음 날짜'
        >
          {isPending && loadingDirection === 'next' ? (
            <Loader2 className='h-4 w-4 animate-spin' />
          ) : (
            <ChevronRight className='h-4 w-4' />
          )}
        </Button>
      </div>

      {/* Mobile: Today button below */}
      {showTodayButton && (
        <Button
          variant='outline'
          size='sm'
          onClick={handleTodayClick}
          disabled={isPending}
          className={cn(
            'text-sm font-medium text-blue-600 hover:text-blue-700 bg-blue-50/70 hover:bg-blue-100/70 border-blue-200 hover:border-blue-300 backdrop-blur-sm shadow-sm hover:shadow-md transition-colors duration-200 sm:hidden',
            isPending && 'opacity-50 cursor-not-allowed'
          )}
          aria-label='오늘로 이동'
        >
          {isPending && loadingDirection === 'today' ? (
            <Loader2 className='h-4 w-4 mr-2 animate-spin' />
          ) : (
            <Home className='h-4 w-4 mr-2' />
          )}
          오늘
        </Button>
      )}

      {/* Desktop: Original layout */}
      <Button
        variant='outline'
        size='lg'
        onClick={handlePrevDay}
        disabled={!canGoPrev || isPending}
        className={cn(
          'hidden sm:flex shadow-sm hover:shadow-md transition-shadow duration-200',
          (!canGoPrev || isPending) && 'opacity-50 cursor-not-allowed'
        )}
        aria-label='이전 날짜'
      >
        {isPending && loadingDirection === 'prev' ? (
          <Loader2 className='h-5 w-5 animate-spin' />
        ) : (
          <ChevronLeft className='h-5 w-5' />
        )}
      </Button>

      <div className='hidden sm:flex items-center gap-4'>
        <div className='flex items-center gap-3 px-6 py-3 rounded-xl bg-white/70 backdrop-blur-sm border border-white/20 shadow-lg'>
          <Calendar className='h-5 w-5 text-blue-600' />
          <span className='font-semibold text-lg'>
            {current.format('YYYY년 M월 D일 ddd')}
          </span>
        </div>

        {showTodayButton && (
          <Button
            variant='outline'
            size='sm'
            onClick={handleTodayClick}
            disabled={isPending}
            className={cn(
              'text-sm font-medium text-blue-600 hover:text-blue-700 bg-blue-50/70 hover:bg-blue-100/70 border-blue-200 hover:border-blue-300 backdrop-blur-sm shadow-sm hover:shadow-md transition-colors duration-200',
              isPending && 'opacity-50 cursor-not-allowed'
            )}
            aria-label='오늘로 이동'
          >
            {isPending && loadingDirection === 'today' ? (
              <Loader2 className='h-4 w-4 mr-2 animate-spin' />
            ) : (
              <Home className='h-4 w-4 mr-2' />
            )}
            오늘
          </Button>
        )}
      </div>

      <Button
        variant='outline'
        size='lg'
        onClick={handleNextDay}
        disabled={!canGoNext || isPending}
        className={cn(
          'hidden sm:flex shadow-sm hover:shadow-md transition-shadow duration-200',
          (!canGoNext || isPending) && 'opacity-50 cursor-not-allowed'
        )}
        aria-label='다음 날짜'
      >
        {isPending && loadingDirection === 'next' ? (
          <Loader2 className='h-5 w-5 animate-spin' />
        ) : (
          <ChevronRight className='h-5 w-5' />
        )}
      </Button>
    </div>
  );
}
