const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://wjjewbltlwvsqljeazlz.supabase.co';
const supabaseKey = 'sb_publishable_fwPCvQxIIcxJR2yNV0GOPg_oujdfjj5';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testUpload() {
  const { data, error } = await supabase
    .storage
    .from('uploads')
    .upload('test.txt', 'Hello World', {
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
