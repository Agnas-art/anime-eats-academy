import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, conversationHistory, conversationSummary, isInternalSummary } = await req.json();
    
    console.log("Received message:", message);
    console.log("Conversation history length:", conversationHistory?.length || 0);
    console.log("Has conversation summary:", !!conversationSummary);
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build system prompt with enhanced context awareness
    let systemPrompt = `You are a friendly and helpful AI assistant in a voice conversation. Keep your responses concise and conversational since they will be spoken aloud. Be warm, engaging, and helpful. Limit responses to 2-3 sentences when possible.

IMPORTANT CONTEXT RULES:
1. Remember previous parts of this conversation - refer back to topics we've discussed
2. Don't ask questions that were already answered in our conversation
3. Build upon previous responses rather than starting fresh each time
4. If the user mentions their name, remember and use it appropriately
5. Reference shared interests and topics from our conversation history
6. Acknowledge when continuing a previous discussion topic

Be conversational and maintain context throughout our chat.`;
    
    if (isInternalSummary) {
      systemPrompt = "Create a brief 1-2 sentence summary of this conversation to maintain context for future messages. Focus on key topics, user preferences, and personal details (like names) discussed. Include any ongoing themes or interests.";
    } else if (conversationSummary) {
      systemPrompt += `\n\nPREVIOUS CONVERSATION SUMMARY: ${conversationSummary}\n\nUse this context to maintain conversation continuity and avoid repeating questions or topics already covered.`;
    }

    // Prepare messages with better context structure
    const contextMessages = [
      { 
        role: "system", 
        content: systemPrompt
      }
    ];

    // Add conversation history with better formatting
    if (conversationHistory && conversationHistory.length > 0) {
      // Take more context for better conversation flow
      const recentHistory = conversationHistory.slice(-15); // Increased from default
      contextMessages.push(...recentHistory);
    }

    // Add the current message
    contextMessages.push({ role: "user", content: message });

    console.log("Messages being sent to AI:", {
      totalMessages: contextMessages.length,
      hasHistory: conversationHistory?.length > 0,
      hasSummary: !!conversationSummary,
      systemPromptLength: systemPrompt.length
    });

    console.log("Calling Lovable AI Gateway...");
    
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: contextMessages,
        temperature: 0.7, // Add slight creativity while maintaining consistency
        max_tokens: 150,   // Limit response length for voice conversation
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Usage limit reached. Please add credits to continue." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "I'm sorry, I couldn't generate a response.";
    
    console.log("AI response:", reply);

    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Voice chat error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
