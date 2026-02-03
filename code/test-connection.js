import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs';
import * as path from 'path';

// Read .env manually since we might not have dotenv installed
const envPath = path.resolve(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
        env[key.trim()] = value.trim();
    }
});

const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseKey = env.VITE_SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_KEY in .env');
    process.exit(1);
}

console.log('Testing connection to:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
    console.log('1. Attempting to SELECT from "names"...');
    const { data: selectData, error: selectError } = await supabase.from('names').select('*').limit(1);

    if (selectError) {
        console.error('SELECT Failed:', selectError.message);
        if (selectError.code === '42P01') console.error('Hint: Table "names" might not exist.');
        if (selectError.code === '42501') console.error('Hint: RLS policy violation. You need to enable public access.');
    } else {
        console.log('SELECT Success. Data:', selectData);
    }

    console.log('\n2. Attempting to INSERT into "names"...');
    const { data: insertData, error: insertError } = await supabase.from('names').insert([{ name: 'Test Connection' }]).select();

    if (insertError) {
        console.error('INSERT Failed:', insertError.message);
        if (insertError.code === '42501') console.error('Hint: RLS policy violation. You need to enable public INSERT access.');
    } else {
        console.log('INSERT Success:', insertData);
    }
}

test();
