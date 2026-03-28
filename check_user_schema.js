const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://sxsfqvcxikdsahhidrdx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN4c2ZxdmN4aWtkc2FoaGlkcmR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzMjg3NTQsImV4cCI6MjA4ODkwNDc1NH0.5ftyFtzmIlvNX-Oj5p-0JwwJEBHajUn5XBAVjkLC82Y';
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    const { data, error } = await supabase.from('user_profiles').select('*').limit(1);
    if (error) {
        console.error("Error:", error);
        return;
    }
    if (data && data.length > 0) {
        console.log("User Profile Columns:", JSON.stringify(Object.keys(data[0])));
    } else {
        console.log("No user profiles found.");
    }
}
main();
