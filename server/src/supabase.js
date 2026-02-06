import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase environment variables');
    // process.exit(1); // Do not crash, allow health check to run
}

const supabase = (supabaseUrl && supabaseKey)
    ? createClient(supabaseUrl, supabaseKey)
    : {
        from: () => ({ select: () => ({ eq: () => ({ single: () => ({ data: null, error: 'Missing Supabase Keys' }) }) }) })
    };

console.log('✅ Supabase client initialized');

export default supabase;
