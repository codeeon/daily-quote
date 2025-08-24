import { createClient } from '@supabase/supabase-js';
import type { Quote, QuoteHistory } from '@/types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

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
      const { error } = await supabase!
        .from('daily_quotes')
        .upsert({
          date,
          quote_data: quote,
          message: quote.message,
          author: quote.author,
          author_profile: quote.authorProfile || '',
          api_source: 'korean-advice-api',
        }, {
          onConflict: 'date'
        });

      if (error) {
        console.error('Error saving quote history:', error);
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