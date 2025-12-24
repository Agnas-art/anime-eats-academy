# Voice Chatbot Configuration

## Current Status
✅ **Local Fallback Mode**: The voice chatbot is now working with local responses
✅ **Environment Variables**: All Supabase variables are configured
⚠️ **AI Gateway**: Requires additional setup for AI-powered responses

## Configuration Files

### 1. Environment Variables (`.env`)
```env
VITE_SUPABASE_PROJECT_ID="qpwhlocugtqcuztuioka"
VITE_SUPABASE_PUBLISHABLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
VITE_SUPABASE_URL="https://qpwhlocugtqcuztuioka.supabase.co"
VITE_LOVABLE_AI_GATEWAY_URL="https://api.lovable.dev"
```

### 2. Supabase Edge Function
Location: `supabase/functions/voice-chat/index.ts`
- ✅ Function code is present
- ⚠️ Requires `LOVABLE_API_KEY` environment variable in Supabase project

## Current Behavior

### ✅ Working Features
- 🎤 **Voice Recognition**: Speech-to-text conversion
- 🔊 **Text-to-Speech**: Spoken responses
- 💬 **Local Chat**: Context-aware responses using local fallback
- 💾 **Conversation Persistence**: 24-hour conversation memory
- 🌐 **Global Floating UI**: Available on all pages

### 🔧 Fallback Mode
When the AI service is not available, the chatbot uses:
- Context-aware local responses
- Topic detection (food, anime, gaming)
- Conversation history awareness
- Friendly conversational tone

### 🚀 For Full AI Mode
To enable AI-powered responses:
1. Set up Lovable AI Gateway API key
2. Configure `LOVABLE_API_KEY` in Supabase project environment variables
3. Deploy the edge function to Supabase

## Usage Instructions

1. **Open Voice Chat**: Click the floating chat button (bottom right)
2. **Voice Input**: Click the microphone button and speak
3. **Text Input**: Type messages in the input field
4. **Stop Speaking**: Click the volume button to stop text-to-speech
5. **Close Chat**: Click the X button or click outside the modal

## Troubleshooting

### Common Issues
- **"Microphone Access Denied"**: Allow microphone permissions in browser
- **"Speech recognition not supported"**: Use Chrome/Edge for best compatibility
- **"Configuration Error"**: Check .env file for missing variables

### Browser Compatibility
- ✅ **Chrome/Edge**: Full support
- ⚠️ **Firefox**: Limited speech recognition support
- ⚠️ **Safari**: Basic support

The voice chatbot is now fully functional with local fallback responses!