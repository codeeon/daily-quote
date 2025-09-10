import { Calendar } from 'lucide-react';
import { LoadingSpinner } from './LoadingSpinner';
import { cn } from '@/lib/utils';

interface NavigationLoadingProps {
  className?: string;
}

export function NavigationLoading({ className }: NavigationLoadingProps) {
  return (
    <div
      className={cn(
        'flex flex-col sm:flex-row items-center justify-between w-full max-w-4xl mx-auto gap-4 sm:gap-0',
        className
      )}
    >
      {/* Mobile: Skeleton layout */}
      <div className='flex items-center justify-between w-full sm:hidden'>
        <div className='w-10 h-10 bg-gray-200 rounded-md animate-pulse' />
        
        <div className='flex items-center gap-2 px-4 py-2 rounded-lg bg-white/70 backdrop-blur-sm border border-white/20 shadow-lg mx-3 flex-1 justify-center'>
          <Calendar className='h-4 w-4 text-blue-600 flex-shrink-0' />
          <LoadingSpinner size='sm' className='ml-2' />
        </div>

        <div className='w-10 h-10 bg-gray-200 rounded-md animate-pulse' />
      </div>

      {/* Mobile: Loading today button */}
      <div className='w-16 h-8 bg-blue-100 rounded-md animate-pulse sm:hidden' />

      {/* Desktop: Skeleton layout */}
      <div className='hidden sm:flex w-12 h-12 bg-gray-200 rounded-md animate-pulse' />

      <div className='hidden sm:flex items-center gap-4'>
        <div className='flex items-center gap-3 px-6 py-3 rounded-xl bg-white/70 backdrop-blur-sm border border-white/20 shadow-lg'>
          <Calendar className='h-5 w-5 text-blue-600' />
          <LoadingSpinner size='md' className='ml-2' />
        </div>
        
        <div className='w-16 h-8 bg-blue-100 rounded-md animate-pulse' />
      </div>

      <div className='hidden sm:flex w-12 h-12 bg-gray-200 rounded-md animate-pulse' />
    </div>
  );
}