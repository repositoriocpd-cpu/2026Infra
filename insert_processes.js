const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = 'https://sxsfqvcxikdsahhidrdx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN4c2ZxdmN4aWtkc2FoaGlkcmR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzMjg3NTQsImV4cCI6MjA4ODkwNDc1NH0.5ftyFtzmIlvNX-Oj5p-0JwwJEBHajUn5XBAVjkLC82Y';
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    console.log('Reading data...');
    let dataStr = fs.readFileSync(path.join(__dirname, 'excel para json.json'), 'utf8');
    
    // The provided JSON is just a list of comma-separated objects. Wrap it in an array and remove trailing comma if present.
    dataStr = dataStr.trim();
    if (dataStr.endsWith(',')) {
        dataStr = dataStr.slice(0, -1);
    }
    if (!dataStr.startsWith('[')) {
        dataStr = `[${dataStr}]`;
    }
    
    const data = JSON.parse(dataStr);

    console.log(`Found ${data.length} records to process.`);

    const formattedData = data.map(item => {
        let deadline = null;
        if (item['DATA DE CONCLUSÃO']) {
            const parts = item['DATA DE CONCLUSÃO'].split('/');
            if (parts.length === 3) {
                // MM/DD/YYYY -> YYYY-MM-DD
                deadline = `${parts[2]}-${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}`;
            }
        }
        
        let location_date = null;
        if (item['Data Localização']) {
            const parts = item['Data Localização'].split('/');
            if (parts.length === 3) {
                // DD/MM/YYYY -> YYYY-MM-DD
                location_date = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
            }
        }

        return {
            pp_number: item['NÚMERO DO P.P.']?.toString(),
            exercise_year: item['ANO EXERCÍCIO OF']?.toString() || null,
            pp_ano: item['PP ANO ATUAL'],
            cover_value: item['VALOR DE CAPA']?.toString() || null,
            supplier_name: item['FORNECEDOR'] || null,
            object_name: item['OBJETO'] || null,
            deadline: deadline,
            treated_by: item['TRATADO POR'] || null,
            status: item['STATUS'] || null,
            location: item['Localização'] || null,
            location_date: location_date,
            situation: item['SITUAÇÃO'] || null,
            notes: item['OBSERVAÇÃO'] || null
        };
    });

    console.log('Inserting into database...');
    // We can insert in batches
    for (let i = 0; i < formattedData.length; i += 50) {
        const chunk = formattedData.slice(i, i + 50);
        const { error } = await supabase.from('processes').insert(chunk);
        if (error) {
            console.error('Error inserting chunk starting at index ' + i, error);
            return;
        } else {
            console.log(`Successfully inserted records ${i} to ${i + chunk.length - 1}`);
        }
    }
    console.log('All records inserted successfully!');
}

main().catch(console.error);
