import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function check() {
    const { data: processes, error } = await supabase
        .from('processes')
        .select('id, pp_ano, location')
        .ilike('location', '%tesouraria%');
    
    if (error) {
        console.error('Error:', error);
        return;
    }
    
    console.log('Processes with tesouraria:', processes.length);
    processes.forEach(p => console.log(JSON.stringify(p)));
}

check();
