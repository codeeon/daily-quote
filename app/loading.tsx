import { NavigationLoading } from '@/components/NavigationLoading';
import { QuoteCard } from '@/components/QuoteCard';

export default function Loading() {
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
          <div className='space-y-6 sm:space-y-8'>
            <NavigationLoading />
            <QuoteCard quote={null} loading={true} />
          </div>
        </main>
      </div>
    </div>
  );
}