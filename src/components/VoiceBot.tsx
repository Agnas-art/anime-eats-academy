import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Volume2, X, MessageCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

// Web Speech API types
interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
  }
}

// Platform detection utilities
const isMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

const isAndroid = () => {
  return /Android/i.test(navigator.userAgent);
};

const isIOS = () => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
};

const isChrome = () => {
  return /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
};

const isSafari = () => {
  return /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
};

const isFirefox = () => {
  return /Firefox/.test(navigator.userAgent);
};

const getSpeechRecognitionSupport = () => {
  const hasAPI = !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  const platform = isAndroid() ? 'Android' : isIOS() ? 'iOS' : 'Desktop';
  const browser = isChrome() ? 'Chrome' : isSafari() ? 'Safari' : isFirefox() ? 'Firefox' : 'Other';
  
  return {
    hasAPI,
    platform,
    browser,
    isSupported: hasAPI && (isChrome() || (isAndroid() && isChrome())),
    requiresHTTPS: true
  };
};

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: number;
}

interface ConversationContext {
  messages: Message[];
  summary?: string;
  lastActiveTime: number;
}

const VoiceBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentResponse, setCurrentResponse] = useState('');
  const [conversationSummary, setConversationSummary] = useState<string>('');
  const [speechSupport, setSpeechSupport] = useState(getSpeechRecognitionSupport());
  const [micPermissionGranted, setMicPermissionGranted] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null);
  const { toast } = useToast();

  // Storage key for conversation persistence
  const STORAGE_KEY = 'voicebot_conversation';
  const MAX_STORED_MESSAGES = 50;
  const CONTEXT_WINDOW = 20; // Increased from 10

  // Load conversation from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const context: ConversationContext = JSON.parse(stored);
        // Only load if conversation is recent (within last 24 hours)
        if (Date.now() - context.lastActiveTime < 24 * 60 * 60 * 1000) {
          setMessages(context.messages || []);
          setConversationSummary(context.summary || '');
        }
      }
    } catch (error) {
      console.error('Failed to load conversation history:', error);
    }
  }, []);

  // Save conversation to localStorage
  useEffect(() => {
    if (messages.length > 0) {
      try {
        const context: ConversationContext = {
          messages: messages.slice(-MAX_STORED_MESSAGES),
          summary: conversationSummary,
          lastActiveTime: Date.now()
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(context));
      } catch (error) {
        console.error('Failed to save conversation history:', error);
      }
    }
  }, [messages, conversationSummary]);

  // Local fallback response generator with enhanced context awareness
  const generateLocalResponse = useCallback(async (userInput: string, messageHistory: Message[]): Promise<string> => {
    const input = userInput.toLowerCase().trim();
    
    // Analyze conversation history for context
    const recentMessages = messageHistory.slice(-10); // Look at more recent context
    const allTopics = messageHistory.map(m => m.content.toLowerCase()).join(' ');
    const userPreferences = {
      food: allTopics.includes('food') || allTopics.includes('cook') || allTopics.includes('recipe'),
      anime: allTopics.includes('anime') || allTopics.includes('manga') || allTopics.includes('naruto') || allTopics.includes('tanjiro'),
      gaming: allTopics.includes('game') || allTopics.includes('play') || allTopics.includes('gaming'),
    };
    
    // Extract user's name if mentioned in conversation
    const nameMatch = allTopics.match(/my name is (\w+)|i'm (\w+)|call me (\w+)/);
    const userName = nameMatch ? (nameMatch[1] || nameMatch[2] || nameMatch[3]) : '';
    
    // Check for repeated questions or similar topics
    const isRepeatedQuestion = recentMessages.some(m => 
      m.role === 'user' && 
      m.content.toLowerCase().includes(input.substring(0, 20)) && 
      m.content !== userInput
    );
    
    // Find previous discussions about similar topics
    const previousUserMessages = recentMessages.filter(m => m.role === 'user').slice(-3);
    const previousAssistantMessages = recentMessages.filter(m => m.role === 'assistant').slice(-3);
    
    // Handle repeated or follow-up questions with context
    if (isRepeatedQuestion && previousAssistantMessages.length > 0) {
      return `${userName ? `${userName}, ` : ''}I think we talked about something similar before. To build on our previous discussion, what specific aspect would you like to explore further?`;
    }
    
    // Context-aware responses based on conversation flow
    if (input.includes('food') || input.includes('cook') || input.includes('recipe') || input.includes('eat')) {
      if (userPreferences.anime && userPreferences.food) {
        return `${userName ? `${userName}, ` : ''}Since we've been talking about both food and anime, have you noticed how beautifully food is portrayed in anime? What's your favorite food scene from an anime?`;
      }
      const responses = [
        `${userName ? `Great question, ${userName}! ` : ''}That sounds delicious! Based on our chat, what's your favorite cuisine?`,
        "Cooking is such a wonderful skill! Are you looking for recipe suggestions?",
        "Food brings people together! What are you in the mood to cook today?",
        `${userName ? `${userName}, ` : ''}I'd love to help you with cooking tips! What dish are you thinking about?`,
        "There's nothing better than a good meal! Tell me more about what you're craving."
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }
    
    // Anime related responses with context
    if (input.includes('anime') || input.includes('manga') || input.includes('naruto') || input.includes('tanjiro') || input.includes('deku')) {
      if (userPreferences.food && userPreferences.anime) {
        return `${userName ? `${userName}, ` : ''}I love how we've been discussing both anime and food! Have you ever tried making dishes from your favorite anime series?`;
      }
      const responses = [
        `${userName ? `${userName}, ` : ''}anime is amazing! Which series are you watching right now?`,
        "I love anime too! The storytelling and animation are incredible.",
        "That's a great anime choice! What did you think of the latest episodes?",
        "Anime characters are so inspiring! Who's your favorite character?",
        `${userName ? `Based on our chat, ${userName}, ` : ''}the anime world has so many amazing stories! What genre do you prefer?`
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }
    
    // Gaming related responses with context
    if (input.includes('game') || input.includes('play') || input.includes('gaming')) {
      const responses = [
        `${userName ? `${userName}, ` : ''}games are so much fun! What type of games do you enjoy playing?`,
        "I'd love to hear about your gaming adventures! What's your current favorite?",
        "Gaming is a great way to relax and have fun! Any recommendations for me?",
        "That sounds like an exciting game! How long have you been playing it?",
        "Games can be so immersive! What draws you to that particular game?"
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }
    
    // Greeting responses with context awareness
    if (input.includes('hello') || input.includes('hi') || input.includes('hey')) {
      if (messageHistory.length > 5) {
        return `${userName ? `Hello again, ${userName}! ` : 'Hello again! '}It's great to continue our conversation. What would you like to talk about next?`;
      }
      return `${userName ? `Hello, ${userName}! ` : 'Hello! '}I'm so happy to chat with you today! What would you like to talk about?`;
    }
    
    if (input.includes('how are you') || input.includes('how\'s it going')) {
      return `${userName ? `${userName}, ` : ''}I'm doing great, thank you for asking! I'm really enjoying our conversation. How are you doing today?`;
    }
    
    if (input.includes('thank you') || input.includes('thanks')) {
      return `${userName ? `You're very welcome, ${userName}! ` : 'You\'re very welcome! '}I'm here to help whenever you need it. Is there anything else you'd like to chat about?`;
    }
    
    if (input.includes('help') || input.includes('support')) {
      const topics = [];
      if (userPreferences.food) topics.push('food and cooking');
      if (userPreferences.anime) topics.push('anime');
      if (userPreferences.gaming) topics.push('games');
      
      if (topics.length > 0) {
        return `${userName ? `${userName}, ` : ''}I'm here to help! I see we've been chatting about ${topics.join(', ')}. Feel free to ask me more about these topics or anything else on your mind!`;
      }
      return "I'm here to help! You can ask me about food, cooking, anime, games, or just chat about anything on your mind!";
    }
    
    // Contextual responses based on conversation history
    const recentTopics = recentMessages.slice(-5).map(m => m.content.toLowerCase());
    const hasFood = recentTopics.some(t => t.includes('food') || t.includes('cook'));
    const hasAnime = recentTopics.some(t => t.includes('anime') || t.includes('manga'));
    const hasGaming = recentTopics.some(t => t.includes('game') || t.includes('play'));
    
    if (hasFood && hasAnime) {
      return `${userName ? `${userName}, ` : ''}that's interesting! I love how anime often features amazing food scenes. Have you seen any cooking anime like Shokugeki no Soma?`;
    } else if (hasFood && hasGaming) {
      return `${userName ? `${userName}, ` : ''}I notice you enjoy both food and gaming! Have you played any cooking games or food-themed games?`;
    } else if (hasAnime && hasGaming) {
      return `${userName ? `${userName}, ` : ''}anime and gaming - great combination! Have you played any games based on anime series?`;
    } else if (hasFood) {
      return `${userName ? `${userName}, ` : ''}I love our food conversation! Cooking is such a creative and rewarding activity. What's your next culinary adventure?`;
    } else if (hasAnime) {
      return `${userName ? `${userName}, ` : ''}anime discussions are the best! There are so many incredible series with unique stories and characters.`;
    } else if (hasGaming) {
      return `${userName ? `${userName}, ` : ''}gaming is such an amazing hobby! What draws you to the games you play?`;
    }
    
    // Context-aware generic responses
    const contextualResponses = [
      `${userName ? `${userName}, ` : ''}that's really interesting! Based on our chat, tell me more about that.`,
      `${userName ? `I appreciate you sharing that with me, ${userName}! ` : 'I appreciate you sharing that with me! '}What's your thoughts on it?`,
      "That sounds fascinating! I'd love to hear your perspective.",
      `${userName ? `Thanks for chatting with me, ${userName}! ` : 'Thanks for chatting with me! '}What else is on your mind today?`,
      "That's a great point! I enjoy our conversations so much.",
      `${userName ? `${userName}, ` : ''}I'm here to listen and chat! What would you like to explore next?`
    ];
    
    return contextualResponses[Math.floor(Math.random() * contextualResponses.length)];
  }, []);

  // Generate conversation summary for long conversations with better context
  const generateSummary = useCallback(async (allMessages: Message[]): Promise<string> => {
    if (allMessages.length < 8) return ''; // Reduced threshold for better context
    
    try {
      // Extract key information from conversation
      const userMessages = allMessages.filter(m => m.role === 'user');
      const assistantMessages = allMessages.filter(m => m.role === 'assistant');
      
      // Find user's name if mentioned
      const nameMatch = allMessages.map(m => m.content.toLowerCase()).join(' ').match(/my name is (\w+)|i'm (\w+)|call me (\w+)/);
      const userName = nameMatch ? (nameMatch[1] || nameMatch[2] || nameMatch[3]) : '';
      
      // Identify main topics discussed
      const allContent = allMessages.map(m => m.content.toLowerCase()).join(' ');
      const topics = [];
      if (allContent.includes('food') || allContent.includes('cook') || allContent.includes('recipe')) topics.push('food/cooking');
      if (allContent.includes('anime') || allContent.includes('manga')) topics.push('anime');
      if (allContent.includes('game') || allContent.includes('play') || allContent.includes('gaming')) topics.push('gaming');
      
      // Create context-rich summary prompt
      let summaryPrompt = `Create a brief summary of this conversation to maintain context for future messages. Include:
1. User's name if mentioned: ${userName || 'not provided'}
2. Main topics discussed: ${topics.join(', ') || 'general conversation'}
3. Any specific preferences or interests mentioned
4. Ongoing themes or questions

Recent conversation context:\n`;
      
      // Include more context for better summarization
      const contextMessages = [
        ...allMessages.slice(0, 4),  // First few messages for introduction context
        ...allMessages.slice(-8)    // Recent messages for current context
      ];
      
      summaryPrompt += contextMessages.map(m => `${m.role}: ${m.content}`).join('\n');
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/voice-chat`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            message: summaryPrompt,
            conversationHistory: [],
            isInternalSummary: true
          }),
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        console.log('Generated conversation summary:', data.reply);
        return data.reply || '';
      }
    } catch (error) {
      console.error('Failed to generate summary:', error);
      
      // Create a basic local summary as fallback
      const userMessages = allMessages.filter(m => m.role === 'user');
      const allContent = allMessages.map(m => m.content.toLowerCase()).join(' ');
      const topics = [];
      if (allContent.includes('food') || allContent.includes('cook')) topics.push('food/cooking');
      if (allContent.includes('anime') || allContent.includes('manga')) topics.push('anime');
      if (allContent.includes('game') || allContent.includes('gaming')) topics.push('gaming');
      
      const nameMatch = allContent.match(/my name is (\w+)|i'm (\w+)|call me (\w+)/);
      const userName = nameMatch ? (nameMatch[1] || nameMatch[2] || nameMatch[3]) : '';
      
      return `Conversation with ${userName || 'user'} about ${topics.length > 0 ? topics.join(', ') : 'various topics'}. ${userMessages.length} user messages exchanged.`;
    }
    
    return '';
  }, []);

  // Initialize speech recognition with platform-specific optimizations
  useEffect(() => {
    const initializeSpeechRecognition = () => {
      const support = getSpeechRecognitionSupport();
      setSpeechSupport(support);
      
      console.log('=== Speech Recognition Support Debug ===');
      console.log('Platform:', support.platform);
      console.log('Browser:', support.browser);
      console.log('Has API:', support.hasAPI);
      console.log('Is Supported:', support.isSupported);
      console.log('Is Mobile:', isMobile());
      console.log('Is Android:', isAndroid());
      console.log('Is HTTPS:', location.protocol === 'https:');
      
      if (!support.hasAPI) {
        console.error('Speech Recognition API not available');
        return;
      }
      
      if (!support.isSupported) {
        console.warn('Speech Recognition not fully supported on this platform/browser');
      }
      
      const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (SpeechRecognitionClass) {
        try {
          recognitionRef.current = new SpeechRecognitionClass();
          
          // Platform-specific configuration
          if (isAndroid()) {
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = false; // More reliable on Android
          } else {
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = true;
          }
          
          recognitionRef.current.lang = 'en-US';
          
          recognitionRef.current.onstart = () => {
            console.log('Speech recognition started');
            setIsListening(true);
            setRetryCount(0);
          };

          recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
            console.log('Speech recognition result:', event);
            
            try {
              const current = event.resultIndex;
              if (event.results && event.results[current] && event.results[current][0]) {
                const result = event.results[current][0];
                const transcriptText = result.transcript?.trim() || '';
                
                console.log('Transcript:', transcriptText, 'Confidence:', result.confidence, 'isFinal:', event.results[current].isFinal);
                
                if (transcriptText) {
                  setTranscript(transcriptText);
                  
                  // On Android, process immediately due to different behavior
                  if (isAndroid() || event.results[current].isFinal) {
                    handleSendMessage(transcriptText);
                  }
                }
              }
            } catch (error) {
              console.error('Error processing speech result:', error);
            }
          };

          recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
            console.error('Speech recognition error:', event.error, event);
            setIsListening(false);
            
            switch (event.error) {
              case 'not-allowed':
                setMicPermissionGranted(false);
                toast({
                  title: "Microphone Access Denied",
                  description: isAndroid() 
                    ? "Please enable microphone access in your browser settings and refresh the page." 
                    : "Please enable microphone access to use voice features.",
                  variant: "destructive",
                });
                break;
              case 'no-speech':
                toast({
                  title: "No Speech Detected",
                  description: "Please try speaking again. Make sure you're close to the microphone.",
                  variant: "default",
                });
                break;
              case 'audio-capture':
                toast({
                  title: "Microphone Error",
                  description: "Could not access microphone. Please check your device settings.",
                  variant: "destructive",
                });
                break;
              case 'network':
                toast({
                  title: "Network Error",
                  description: "Speech recognition requires an internet connection.",
                  variant: "destructive",
                });
                break;
              case 'aborted':
                // Silent - user stopped manually
                break;
              default:
                toast({
                  title: "Speech Recognition Error",
                  description: `Error: ${event.error}. Please try again.`,
                  variant: "destructive",
                });
            }
          };

          recognitionRef.current.onend = () => {
            console.log('Speech recognition ended');
            setIsListening(false);
          };
          
        } catch (error) {
          console.error('Failed to initialize speech recognition:', error);
        }
      }
    };
    
    // Initialize with delay for mobile browsers
    const timeoutId = setTimeout(initializeSpeechRecognition, isMobile() ? 500 : 100);
    
    return () => {
      clearTimeout(timeoutId);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (error) {
          console.error('Error aborting speech recognition:', error);
        }
      }
      window.speechSynthesis.cancel();
    };
  }, []);

  const startListening = useCallback(async () => {
    console.log('=== Starting Speech Recognition ===');
    console.log('Recognition ref:', !!recognitionRef.current);
    console.log('Is listening:', isListening);
    console.log('Speech support:', speechSupport);
    
    if (!speechSupport.hasAPI || !recognitionRef.current) {
      const message = !speechSupport.hasAPI 
        ? `Speech recognition is not supported in ${speechSupport.browser} on ${speechSupport.platform}.`
        : "Speech recognition failed to initialize. Please refresh the page.";
      
      toast({
        title: "Not Supported",
        description: isAndroid() 
          ? "Please use Chrome browser for voice features on Android." 
          : message,
        variant: "destructive",
      });
      return;
    }
    
    if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
      toast({
        title: "HTTPS Required",
        description: "Voice features require a secure connection (HTTPS).",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('Requesting microphone access...');
      
      // Request microphone permission first
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          ...(isAndroid() ? {
            sampleRate: 16000,
            channelCount: 1
          } : {})
        }
      });
      
      // Stop the stream immediately after getting permission
      stream.getTracks().forEach(track => track.stop());
      setMicPermissionGranted(true);
      
      console.log('Microphone permission granted, starting recognition...');
      
      // Clear previous transcript
      setTranscript('');
      
      // Ensure recognition is not already running
      if (isListening && recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          console.log('Recognition abort failed (expected):', e);
        }
      }
      
      // Add delay for mobile browsers
      setTimeout(() => {
        if (recognitionRef.current) {
          try {
            console.log('Attempting to start speech recognition...');
            recognitionRef.current.start();
            setIsListening(true);
          } catch (error) {
            console.error('Failed to start recognition:', error);
            setIsListening(false);
            
            if (retryCount < 2) {
              console.log('Retrying speech recognition...', retryCount + 1);
              setRetryCount(prev => prev + 1);
              setTimeout(() => startListening(), 1000);
            } else {
              toast({
                title: "Speech Recognition Error",
                description: "Failed to start voice recognition. Please try again.",
                variant: "destructive",
              });
            }
          }
        }
      }, isAndroid() ? 300 : 100);
      
    } catch (error) {
      console.error('Microphone access error:', error);
      setMicPermissionGranted(false);
      setIsListening(false);
      
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      if (errorMessage.includes('Permission denied') || errorMessage.includes('NotAllowedError')) {
        toast({
          title: "Microphone Access Denied",
          description: isAndroid() 
            ? "Please enable microphone access in your browser settings, then refresh the page." 
            : "Please enable microphone access and try again.",
          variant: "destructive",
        });
      } else if (errorMessage.includes('NotFoundError')) {
        toast({
          title: "No Microphone Found",
          description: "Please connect a microphone and try again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Microphone Error",
          description: `Could not access microphone: ${errorMessage}`,
          variant: "destructive",
        });
      }
    }
  }, [toast, speechSupport, isListening, retryCount]);

  const stopListening = useCallback(() => {
    console.log('Stopping speech recognition...');
    
    if (recognitionRef.current && isListening) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.error('Error stopping recognition:', error);
        try {
          recognitionRef.current.abort();
        } catch (abortError) {
          console.error('Error aborting recognition:', abortError);
        }
      }
    }
    
    setIsListening(false);
    setTranscript('');
  }, [isListening]);

  const speakText = useCallback((text: string) => {
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = 1;
    
    // Try to use a good voice
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => 
      v.name.includes('Google') || v.name.includes('Samantha') || v.lang === 'en-US'
    );
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    synthRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, []);

  const handleSendMessage = useCallback(async (text: string) => {
    if (!text.trim()) return;

    // Debug: Check configuration
    console.log('=== VoiceBot Configuration Debug ===');
    console.log('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL);
    console.log('VITE_SUPABASE_PUBLISHABLE_KEY:', import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ? 'SET' : 'MISSING');
    
    // Debug: Conversation context
    console.log('=== Conversation Context Debug ===');
    console.log('Current message count:', updatedMessages.length);
    console.log('Has conversation summary:', !!conversationSummary);
    console.log('Recent messages for context:', recentMessages.length);
    console.log('Last 3 messages:', updatedMessages.slice(-3).map(m => ({ role: m.role, content: m.content.substring(0, 50) + '...' })));
    console.log('Conversation summary:', conversationSummary ? conversationSummary.substring(0, 100) + '...' : 'None');
    
    // Validate configuration
    if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY) {
      const missing = [];
      if (!import.meta.env.VITE_SUPABASE_URL) missing.push('VITE_SUPABASE_URL');
      if (!import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY) missing.push('VITE_SUPABASE_PUBLISHABLE_KEY');
      
      toast({
        title: "Configuration Error",
        description: `Missing environment variables: ${missing.join(', ')}. Please check your .env file.`,
        variant: "destructive",
      });
      setIsProcessing(false);
      return;
    }

    const userMessage: Message = { 
      role: 'user', 
      content: text,
      timestamp: Date.now()
    };
    
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setTranscript('');
    setIsProcessing(true);
    setCurrentResponse('');

    try {
      // Prepare enhanced context with conversation analysis
      const recentMessages = updatedMessages.slice(-CONTEXT_WINDOW);
      
      // Analyze conversation for better context
      const allContent = updatedMessages.map(m => m.content.toLowerCase()).join(' ');
      const userName = allContent.match(/my name is (\w+)|i'm (\w+)|call me (\w+)/);
      const userNameExtracted = userName ? (userName[1] || userName[2] || userName[3]) : '';
      
      let contextPayload: any = {
        message: text,
        conversationHistory: recentMessages.slice(0, -1), // Exclude current message
        conversationMetadata: {
          messageCount: updatedMessages.length,
          userName: userNameExtracted,
          hasLongHistory: updatedMessages.length > 10
        }
      };
      
      // Add conversation summary for better context if available and conversation is substantial
      if (conversationSummary && updatedMessages.length > 10) {
        contextPayload.conversationSummary = conversationSummary;
        console.log('Including conversation summary in context:', conversationSummary);
      }
      
      // Generate new summary periodically for long conversations
      if (updatedMessages.length > 0 && updatedMessages.length % 20 === 0) { // Reduced frequency
        console.log('Generating conversation summary at message', updatedMessages.length);
        const newSummary = await generateSummary(updatedMessages);
        if (newSummary) {
          setConversationSummary(newSummary);
          contextPayload.conversationSummary = newSummary;
          console.log('Updated conversation summary:', newSummary);
        }
      }

      // Try Supabase edge function first, fallback to local implementation
      let response;
      try {
        response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/voice-chat`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            },
            body: JSON.stringify(contextPayload),
          }
        );

        console.log('API Response Status:', response.status);
        console.log('API Response Headers:', Object.fromEntries(response.headers.entries()));

        if (!response.ok) {
          const errorText = await response.text();
          console.error('API Error Response:', errorText);
          
          // If the error is configuration-related, fall back to local response
          if (response.status === 500 || errorText.includes('LOVABLE_API_KEY')) {
            throw new Error('FALLBACK_TO_LOCAL');
          }
          
          let errorData;
          try {
            errorData = JSON.parse(errorText);
          } catch {
            errorData = { error: errorText };
          }
          
          throw new Error(errorData.error || `Request failed: ${response.status} - ${errorText}`);
        }
      } catch (fetchError) {
        console.warn('Supabase edge function not available, using local fallback:', fetchError);
        
        // Show a one-time notification about fallback mode
        if (!localStorage.getItem('voicebot_fallback_notified')) {
          toast({
            title: "Local Mode",
            description: "Using local responses. Configure Supabase for AI-powered chat.",
            variant: "default",
          });
          localStorage.setItem('voicebot_fallback_notified', 'true');
        }
        
        // Local fallback response
        const localResponse = await generateLocalResponse(text, recentMessages);
        const assistantMessage: Message = { 
          role: 'assistant', 
          content: localResponse,
          timestamp: Date.now()
        };
        
        setMessages(prev => [...prev, assistantMessage]);
        setCurrentResponse(localResponse);
        speakText(localResponse);
        setIsProcessing(false);
        return;
      }

      const data = await response.json();
      const assistantMessage: Message = { 
        role: 'assistant', 
        content: data.reply,
        timestamp: Date.now()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      setCurrentResponse(data.reply);
      speakText(data.reply);
    } catch (error) {
      console.error('Voice chat error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to get response",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  }, [messages, conversationSummary, generateSummary, speakText, toast]);

  const stopSpeaking = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

  return (
    <>
      {/* Floating button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-r from-primary to-accent shadow-lg flex items-center justify-center text-primary-foreground hover:scale-110 transition-transform"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        initial={{ scale: 0 }}
        animate={{ scale: isOpen ? 0 : 1 }}
      >
        <MessageCircle className="w-6 h-6" />
      </motion.button>

      {/* Voice bot panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            className="fixed bottom-24 right-6 z-50 w-80 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-primary to-accent p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <Volume2 className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-bold text-primary-foreground text-sm">AI Voice Assistant</h3>
                  <p className="text-xs text-primary-foreground/80">Tap the mic to speak</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="text-primary-foreground hover:bg-white/20"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Messages area */}
            <div className="h-64 overflow-y-auto p-4 space-y-3 bg-background">
              {messages.length === 0 && (
                <div className="text-center text-muted-foreground text-sm py-8">
                  <p>👋 Hi! I'm your AI assistant.</p>
                  <p className="mt-2">Tap the microphone and ask me anything!</p>
                  {conversationSummary && (
                    <p className="mt-2 text-xs opacity-70">Continuing our previous conversation...</p>
                  )}
                  {!speechSupport.isSupported && (
                    <div className="mt-4 p-3 bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-800 rounded-lg">
                      <p className="text-xs text-yellow-800 dark:text-yellow-200">
                        ⚠️ Voice features work best in Chrome browser
                        {isAndroid() && " on Android devices"}
                      </p>
                    </div>
                  )}
                  {!micPermissionGranted && speechSupport.hasAPI && (
                    <div className="mt-2 p-2 bg-blue-100 dark:bg-blue-900/20 border border-blue-300 dark:border-blue-800 rounded-lg">
                      <p className="text-xs text-blue-800 dark:text-blue-200">
                        🎤 Microphone access required for voice chat
                      </p>
                    </div>
                  )}
                </div>
              )}
              {conversationSummary && messages.length > 0 && (
                <div className="text-xs text-muted-foreground bg-muted/30 p-2 rounded-lg border-l-2 border-primary/30">
                  <span className="font-medium">Previous context:</span> {conversationSummary.substring(0, 100)}{conversationSummary.length > 100 && '...'}
                </div>
              )}
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm ${
                      msg.role === 'user'
                        ? 'bg-primary text-primary-foreground rounded-br-md'
                        : 'bg-muted text-foreground rounded-bl-md'
                    }`}
                  >
                    {msg.content}
                  </div>
                </motion.div>
              ))}
              {isProcessing && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-muted px-4 py-2 rounded-2xl rounded-bl-md flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm text-muted-foreground">Thinking...</span>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Transcript display */}
            {transcript && (
              <div className="px-4 py-2 bg-muted/50 border-t border-border">
                <p className="text-xs text-muted-foreground">Hearing: "{transcript}"</p>
              </div>
            )}

            {/* Controls */}
            <div className="p-4 border-t border-border bg-card flex items-center justify-center gap-4">
              {isSpeaking && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={stopSpeaking}
                  className="text-xs"
                >
                  Stop Speaking
                </Button>
              )}
              
              <motion.button
                onClick={isListening ? stopListening : startListening}
                disabled={isProcessing || isSpeaking || !speechSupport.hasAPI}
                className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                  !speechSupport.hasAPI
                    ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                    : isListening
                    ? 'bg-destructive text-destructive-foreground animate-pulse'
                    : isProcessing || isSpeaking
                    ? 'bg-muted text-muted-foreground cursor-not-allowed'
                    : 'bg-primary text-primary-foreground hover:bg-primary/90'
                }`}
                whileHover={!isProcessing && !isSpeaking && speechSupport.hasAPI ? { scale: 1.05 } : {}}
                whileTap={!isProcessing && !isSpeaking && speechSupport.hasAPI ? { scale: 0.95 } : {}}
                title={
                  !speechSupport.hasAPI 
                    ? `Voice not supported in ${speechSupport.browser} on ${speechSupport.platform}` 
                    : isListening 
                    ? "Stop listening" 
                    : "Start voice input"
                }
              >
                {!speechSupport.hasAPI ? (
                  <MicOff className="w-6 h-6" />
                ) : isListening ? (
                  <MicOff className="w-6 h-6" />
                ) : (
                  <Mic className="w-6 h-6" />
                )}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default VoiceBot;
