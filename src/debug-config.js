// Configuration validation script
const config = {
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
  supabaseKey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
  projectId: import.meta.env.VITE_SUPABASE_PROJECT_ID,
  lovableUrl: import.meta.env.VITE_LOVABLE_AI_GATEWAY_URL
};

console.log('=== Supabase Configuration Check ===');
console.log('VITE_SUPABASE_URL:', config.supabaseUrl);
console.log('VITE_SUPABASE_PUBLISHABLE_KEY:', config.supabaseKey ? 'SET' : 'MISSING');
console.log('VITE_SUPABASE_PROJECT_ID:', config.projectId);
console.log('VITE_LOVABLE_AI_GATEWAY_URL:', config.lovableUrl);

// Validation
const missing = [];
if (!config.supabaseUrl) missing.push('VITE_SUPABASE_URL');
if (!config.supabaseKey) missing.push('VITE_SUPABASE_PUBLISHABLE_KEY');
if (!config.projectId) missing.push('VITE_SUPABASE_PROJECT_ID');

if (missing.length > 0) {
  console.error('❌ Missing environment variables:', missing);
} else {
  console.log('✅ All required environment variables are set');
}

// Test API endpoint
if (config.supabaseUrl && config.supabaseKey) {
  const endpoint = `${config.supabaseUrl}/functions/v1/voice-chat`;
  console.log('📡 API Endpoint:', endpoint);
  
  // Test basic connectivity
  fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.supabaseKey}`,
    },
    body: JSON.stringify({ message: 'test', conversationHistory: [] }),
  })
  .then(response => {
    console.log('🔗 API Response Status:', response.status);
    return response.text();
  })
  .then(text => {
    console.log('📄 API Response:', text);
  })
  .catch(error => {
    console.error('❌ API Error:', error.message);
  });
}