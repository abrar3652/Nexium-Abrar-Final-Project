import { createClient } from '@supabase/supabase-js';
    import { connectToDatabase } from './mongodb';

    export const getSupabase = () => {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.SUPABASE_KEY;

      console.log('Supabase URL:', supabaseUrl);
      console.log('Supabase Key:', supabaseKey ? supabaseKey.slice(0, 10) + '...' : 'undefined');

      if (!supabaseUrl || !supabaseKey) {
        throw new Error('Supabase URL or Key is missing in environment variables');
      }

      return createClient(supabaseUrl, supabaseKey);
    };

    export async function testDatabase() {
      await connectToDatabase();
    }