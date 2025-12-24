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

  // Local fallback response generator
  const generateLocalResponse = useCallback(async (userInput: string, messageHistory: Message[]): Promise<string> => {
    const input = userInput.toLowerCase().trim();
    
    // Food and cooking related responses
    if (input.includes('food') || input.includes('cook') || input.includes('recipe') || input.includes('eat')) {
      const responses = [
        "That sounds delicious! I love talking about food. What's your favorite cuisine?",
        "Cooking is such a wonderful skill! Are you looking for recipe suggestions?",
        "Food brings people together! What are you in the mood to cook today?",
        "I'd love to help you with cooking tips! What dish are you thinking about?",
        "There's nothing better than a good meal! Tell me more about what you're craving."
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }
    
    // Anime related responses
    if (input.includes('anime') || input.includes('manga') || input.includes('naruto') || input.includes('tanjiro') || input.includes('deku')) {
      const responses = [
        "Anime is amazing! Which series are you watching right now?",
        "I love anime too! The storytelling and animation are incredible.",
        "That's a great anime choice! What did you think of the latest episodes?",
        "Anime characters are so inspiring! Who's your favorite character?",
        "The anime world has so many amazing stories! What genre do you prefer?"
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }
    
    // Gaming related responses
    if (input.includes('game') || input.includes('play') || input.includes('gaming')) {
      const responses = [
        "Games are so much fun! What type of games do you enjoy playing?",
        "I'd love to hear about your gaming adventures! What's your current favorite?",
        "Gaming is a great way to relax and have fun! Any recommendations for me?",
        "That sounds like an exciting game! How long have you been playing it?",
        "Games can be so immersive! What draws you to that particular game?"
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }
    
    // General conversation responses
    if (input.includes('hello') || input.includes('hi') || input.includes('hey')) {
      return "Hello! I'm so happy to chat with you today! What would you like to talk about?";
    }
    
    if (input.includes('how are you') || input.includes('how\'s it going')) {
      return "I'm doing great, thank you for asking! I'm excited to be here chatting with you. How are you doing today?";
    }
    
    if (input.includes('thank you') || input.includes('thanks')) {
      return "You're very welcome! I'm here to help whenever you need it. Is there anything else you'd like to chat about?";
    }
    
    if (input.includes('help') || input.includes('support')) {
      return "I'm here to help! You can ask me about food, cooking, anime, games, or just chat about anything on your mind!";
    }
    
    // Default responses based on conversation context
    const recentTopics = messageHistory.slice(-5).map(m => m.content.toLowerCase());
    const hasFood = recentTopics.some(t => t.includes('food') || t.includes('cook'));
    const hasAnime = recentTopics.some(t => t.includes('anime') || t.includes('manga'));
    
    if (hasFood && hasAnime) {
      return "That's interesting! I love how anime often features amazing food scenes. Have you seen any cooking anime?";
    } else if (hasFood) {
      return "I love our food conversation! Cooking is such a creative and rewarding activity. What's your next culinary adventure?";
    } else if (hasAnime) {
      return "Anime discussions are the best! There are so many incredible series with unique stories and characters.";
    }
    
    // Generic friendly responses
    const genericResponses = [
      "That's really interesting! Tell me more about that.",
      "I appreciate you sharing that with me! What's your thoughts on it?",
      "That sounds fascinating! I'd love to hear your perspective.",
      "Thanks for chatting with me! What else is on your mind today?",
      "That's a great point! I enjoy our conversations so much.",
      "I'm here to listen and chat! What would you like to explore next?"
    ];
    
    return genericResponses[Math.floor(Math.random() * genericResponses.length)];
  }, []);

  // Generate conversation summary for long conversations
  const generateSummary = useCallback(async (allMessages: Message[]): Promise<string> => {
    if (allMessages.length < 10) return '';
    
    try {
      // Take first few messages and last few messages for context
      const contextMessages = [
        ...allMessages.slice(0, 3),
        ...allMessages.slice(-5)
      ];
      
      const summaryPrompt = `Please provide a brief summary of this conversation to maintain context:\n\n${contextMessages.map(m => `${m.role}: ${m.content}`).join('\n')}`;
      
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
        return data.reply || '';
      }
    } catch (error) {
      console.error('Failed to generate summary:', error);
    }
    
    return '';
  }, []);

  // Initialize speech recognition
  useEffect(() => {
    const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognitionClass) {
      recognitionRef.current = new SpeechRecognitionClass();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
        const current = event.resultIndex;
        const transcriptText = event.results[current][0].transcript;
        setTranscript(transcriptText);
        
        if (event.results[current].isFinal) {
          handleSendMessage(transcriptText);
        }
      };

      recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          toast({
            title: "Microphone Access Denied",
            description: "Please enable microphone access to use voice features.",
            variant: "destructive",
          });
        }
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      window.speechSynthesis.cancel();
    };
  }, []);

  const startListening = useCallback(async () => {
    if (!recognitionRef.current) {
      toast({
        title: "Not Supported",
        description: "Speech recognition is not supported in your browser.",
        variant: "destructive",
      });
      return;
    }

    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      setTranscript('');
      setIsListening(true);
      recognitionRef.current.start();
    } catch (error) {
      console.error('Microphone access error:', error);
      toast({
        title: "Microphone Error",
        description: "Could not access microphone. Please check permissions.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  }, []);

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
      // Prepare context with recent messages and summary
      const recentMessages = updatedMessages.slice(-CONTEXT_WINDOW);
      let contextPayload: any = {
        message: text,
        conversationHistory: recentMessages.slice(0, -1), // Exclude current message
      };
      
      // Add conversation summary for better context if available
      if (conversationSummary && updatedMessages.length > 15) {
        contextPayload.conversationSummary = conversationSummary;
      }
      
      // Generate new summary if conversation is getting long
      if (updatedMessages.length > 0 && updatedMessages.length % 25 === 0) {
        const newSummary = await generateSummary(updatedMessages);
        if (newSummary) {
          setConversationSummary(newSummary);
          contextPayload.conversationSummary = newSummary;
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
                disabled={isProcessing || isSpeaking}
                className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                  isListening
                    ? 'bg-destructive text-destructive-foreground animate-pulse'
                    : isProcessing || isSpeaking
                    ? 'bg-muted text-muted-foreground cursor-not-allowed'
                    : 'bg-primary text-primary-foreground hover:bg-primary/90'
                }`}
                whileHover={!isProcessing && !isSpeaking ? { scale: 1.05 } : {}}
                whileTap={!isProcessing && !isSpeaking ? { scale: 0.95 } : {}}
              >
                {isListening ? (
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
