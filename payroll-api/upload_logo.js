const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function uploadLogo() {
  const filePath = 'C:/Users/admin/.gemini/antigravity/brain/918fa735-e0e1-40c5-8911-e988cdf32577/.user_uploaded/media_1788344993999.jpg';
  const fileBuffer = fs.readFileSync(filePath);
  
  const { data, error } = await supabase
    .storage
    .from('uploads')
    .upload('system/logo.jpg', fileBuffer, {
      contentType: 'image/jpeg',
      upsert: true
    });
    
  if (error) {
    console.error('Error uploading to Supabase:', error.message);
  } else {
    console.log('Successfully uploaded to Supabase:', data);
    
    // Get public URL
    const { data: publicUrlData } = supabase.storage.from('uploads').getPublicUrl('system/logo.jpg');
    console.log('Public URL:', publicUrlData.publicUrl);
  }
}

uploadLogo();
