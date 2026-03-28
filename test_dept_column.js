const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://sxsfqvcxikdsahhidrdx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN4c2ZxdmN4aWtkc2FoaGlkcmR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzMjg3NTQsImV4cCI6MjA4ODkwNDc1NH0.5ftyFtzmIlvNX-Oj5p-0JwwJEBHajUn5XBAVjkLC82Y';
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    console.log("Testing if 'department' column exists...");
    // Try to update a profile with a department field
    const { data, error } = await supabase.from('user_profiles').select('id').limit(1).single();
    if (error) {
        console.error("Error fetching profile:", error);
        return;
    }
    
    console.log("Found profile with ID:", data.id);
    const { error: updateError } = await supabase.from('user_profiles').update({ department: 'TEST' }).eq('id', data.id);
    
    if (updateError) {
        console.error("Update failed (likely column missing):", updateError.message);
        if (updateError.message.includes('column "department" of relation "user_profiles" does not exist')) {
            console.log("CONFIRMED: Column 'department' is missing.");
        }
    } else {
        console.log("SUCCESS: Column 'department' exists and is writable!");
        // Clean up
        await supabase.from('user_profiles').update({ department: null }).eq('id', data.id);
    }
}
main();
