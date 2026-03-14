const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://sxsfqvcxikdsahhidrdx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN4c2ZxdmN4aWtkc2FoaGlkcmR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzMjg3NTQsImV4cCI6MjA4ODkwNDc1NH0.5ftyFtzmIlvNX-Oj5p-0JwwJEBHajUn5XBAVjkLC82Y';
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    const { data, error } = await supabase.from('statuses').insert([{ name: 'Tratando' }]);
    if (error) console.error('Error inserting Tratando:', error);
    else console.log('Successfully inserted Tratando into statuses!');
}
main();
