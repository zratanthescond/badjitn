import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createOpenAI } from '@ai-sdk/openai';
import { streamText } from 'ai';

// Initialize providers with explicit API keys
// Using default v1beta API which supports systemInstruction
const googleProvider = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

const groq = createOpenAI({
  baseURL: 'https://api.groq.com/openai/v1',
  apiKey: process.env.GROQ_API_KEY,
});

// Convert UI messages to standard API format (with plain string content)
function convertUIMessagesToAPIFormat(uiMessages: any[]) {
  return uiMessages.map((msg: any) => {
    // If message already has plain string content, return as is
    if (typeof msg.content === 'string') {
      return msg;
    }
    
    // If content is an array (with input_text/output_text/text types), extract text
    if (Array.isArray(msg.content)) {
      const textContent = msg.content
        .map((p: any) => {
          if (p.type === 'input_text' || p.type === 'output_text' || p.type === 'text') {
            return p.text || '';
          }
          return '';
        })
        .join('');
      
      return {
        role: msg.role,
        content: textContent
      };
    }
    
    // Extract text from parts array (alternative format)
    if (msg.parts && Array.isArray(msg.parts)) {
      const textContent = msg.parts
        .filter((p: any) => p.type === 'text')
        .map((p: any) => p.text || '')
        .join('');
      
      return {
        role: msg.role,
        content: textContent
      };
    }
    
    // Fallback: return message with empty content
    return {
      role: msg.role,
      content: ''
    };
  });
}

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const { messages, toolId }: { messages: any[], toolId: string } = await req.json();

    if (!messages) {
      return new Response(JSON.stringify({ error: 'Messages are required' }), { status: 400 });
    }

    // Convert UI messages to standard API format
    const apiMessages = convertUIMessagesToAPIFormat(messages);

    let model;
    if (toolId === 'googleIA') {
      // Use .chat() for consistent chat API format
      model = googleProvider.chat('gemini-2.5-flash');
    } else if (toolId === 'chatgpt') {
      // Use .chat() to force Chat Completions API (Groq doesn't support Responses API)
      model = groq.chat('llama-3.3-70b-versatile');
    } else {
      model = googleProvider.chat('gemini-2.5-flash');
    }

    const result = await streamText({
      model,
      messages: apiMessages,
      system: 'You are a helpful AI assistant integrated into the Badji platform. Provide concise and accurate answers.', // System prompt
    });

    return result.toTextStreamResponse();
  } catch (error: any) {
    console.error('Chat API Error Details:', {
      message: error.message,
      stack: error.stack,
      cause: error.cause
    });
    
    return new Response(JSON.stringify({ 
      error: 'Failed to process chat request',
      details: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
