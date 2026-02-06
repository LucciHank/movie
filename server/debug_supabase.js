import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

console.log("URL:", supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseKey);

const testFetch = async () => {
    console.log("Attempting to fetch analytics...");
    const { data, error } = await supabase
        .from('analytics')
        .select('*')
        .limit(1);

    if (error) {
        console.error("Error fetching analytics:", error);
    } else {
        console.log("Analytics table exists. Rows:", data?.length);
    }
}

testFetch();
