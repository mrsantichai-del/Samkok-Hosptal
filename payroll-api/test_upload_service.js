const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://wjjewbltlwvsqljeazlz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndqamV3Ymx0bHd2c3FsamVhemx6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NzczOTkxNCwiZXhwIjoyMTAzMzE1OTE0fQ.j2TyaPGhFOIvoO7RhO7i6CKJspjMoia4gMPJ5VVMKH4';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testUpload() {
  const { data, error } = await supabase
    .storage
    .from('uploads')
    .upload('test.txt', 'Hello World from service role', {
      upsert: true,
      contentType: 'text/plain'
    });

  if (error) {
    console.error('Upload failed:', error.message);
  } else {
    console.log('Upload successful:', data);
  }
}

testUpload();
