const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://sxsfqvcxikdsahhidrdx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN4c2ZxdmN4aWtkc2FoaGlkcmR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzMjg3NTQsImV4cCI6MjA4ODkwNDc1NH0.5ftyFtzmIlvNX-Oj5p-0JwwJEBHajUn5XBAVjkLC82Y';
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    const handlers = [
        { name: 'Aline' },
        { name: 'Claudio' },
        { name: 'João' },
        { name: 'Júnior' },
        { name: 'Natália' },
        { name: 'Vinícius' }
    ];

    console.log('Inserting handlers...');
    
    // We can insert them all at once since we are just adding
    for (const h of handlers) {
        const { data, error } = await supabase.from('handlers').insert([h]);
        if (error) {
            console.error('Error inserting', h.name, error.message);
        } else {
            console.log('Inserted', h.name);
        }
    }
    console.log('Done.');
}

main();
