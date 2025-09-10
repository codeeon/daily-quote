import { createClient } from '@supabase/supabase-js';
import type { Quote, QuoteHistory } from '@/types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export interface DailyQuoteRecord {
  id: number;
  date: string;
  quote_data: any;
  message: string;
  author: string;
  author_profile: string;
  api_source: string;
  created_at: string;
}

export class SupabaseService {
  private isAvailable(): boolean {
    return supabase !== null;
  }

  async saveQuoteHistory(date: string, quote: Quote): Promise<void> {
    if (!this.isAvailable()) {
      console.warn('Supabase not configured, skipping history save');
      return;
    }

    try {
      console.log('Saving quote to Supabase:', { 
        date, 
        quote,
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'configured' : 'missing',
        supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'configured' : 'missing'
      });
      
      // First, test if table exists by trying to read it
      const { error: testError } = await supabase!
        .from('daily_quotes')
        .select('id')
        .limit(1);
        
      if (testError) {
        console.error('Table access test failed:', {
          message: testError.message,
          details: testError.details,
          hint: testError.hint,
          code: testError.code
        });
        return;
      }
      
      console.log('Table access test passed, proceeding with upsert');
      
      const upsertData = {
        date,
        quote_data: quote,
        message: quote.message,
        author: quote.author,
        author_profile: quote.authorProfile || '',
        api_source: 'korean-advice-api',
      };
      
      console.log('Upsert data:', upsertData);
      
      const { data, error } = await supabase!
        .from('daily_quotes')
        .upsert(upsertData, {
          onConflict: 'date'
        })
        .select();

      if (error) {
        console.error('Error saving quote history:', {
          message: error.message || 'No message',
          details: error.details || 'No details',
          hint: error.hint || 'No hint',
          code: error.code || 'No code',
          fullError: error
        });
      } else {
        console.log('Successfully saved quote to Supabase:', data);
      }
    } catch (error) {
      console.error('Error connecting to Supabase:', error);
    }
  }

  async getQuoteHistory(startDate: string, endDate: string): Promise<QuoteHistory[]> {
    if (!this.isAvailable()) {
      return [];
    }

    try {
      const { data, error } = await supabase!
        .from('daily_quotes')
        .select('*')
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: false });

      if (error) {
        console.error('Error fetching quote history:', error);
        return [];
      }

      return (data || []).map((record: DailyQuoteRecord) => ({
        date: record.date,
        quoteId: record.id.toString(),
        message: record.message,
        author: record.author,
        authorProfile: record.author_profile,
        timestamp: new Date(record.created_at).getTime(),
      }));
    } catch (error) {
      console.error('Error connecting to Supabase:', error);
      return [];
    }
  }

  async getQuoteForDate(date: string): Promise<Quote | null> {
    if (!this.isAvailable()) {
      return null;
    }

    try {
      const { data, error } = await supabase!
        .from('daily_quotes')
        .select('*')
        .eq('date', date)
        .single();

      if (error || !data) {
        return null;
      }

      return {
        message: data.message,
        author: data.author,
        authorProfile: data.author_profile,
        date: data.date,
      };
    } catch (error) {
      console.error('Error fetching quote from Supabase:', error);
      return null;
    }
  }

  async getPopularQuotes(limit: number = 10): Promise<QuoteHistory[]> {
    if (!this.isAvailable()) {
      return [];
    }

    try {
      const { data, error } = await supabase!
        .from('daily_quotes')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching popular quotes:', error);
        return [];
      }

      return (data || []).map((record: DailyQuoteRecord) => ({
        date: record.date,
        quoteId: record.id.toString(),
        message: record.message,
        author: record.author,
        authorProfile: record.author_profile,
        timestamp: new Date(record.created_at).getTime(),
      }));
    } catch (error) {
      console.error('Error connecting to Supabase:', error);
      return [];
    }
  }
}