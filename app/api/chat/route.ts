import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createOpenAI } from '@ai-sdk/openai';
import { streamText, convertToModelMessages } from 'ai';

// Initialize providers with explicit API keys
// Using default v1beta API which supports systemInstruction
const googleProvider = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

const groq = createOpenAI({
  baseURL: 'https://api.groq.com/openai/v1',
  apiKey: process.env.GROQ_API_KEY,
});

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const { messages, toolId }: { messages: any[]; toolId?: string } = await req.json();

    if (!Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: 'Messages are required' }), { status: 400 });
    }

    const modelMessages = await convertToModelMessages(messages);

    const model =
      toolId === 'chatgpt'
        ? groq('llama-3.3-70b-versatile')
        : googleProvider('gemini-2.5-flash');

    const result = await streamText({
      model,
      messages: modelMessages,
      system: `You are "badgi chatBOT", a helpful and friendly AI assistant for the Badji events platform.
Your goal is to help users navigate the app, find events, understand how to buy tickets, and answer any general questions about the Badji platform.

Key Information about Badji:
- It is a full-stack platform for managing events (Next.js 14).
- Users can create, update, and delete events.
- Tickets can be purchased securely through Stripe integration.
- Authentication is handled via Clerk.
- Features include event categories, search & filtering, and a user profile to see organized events.

Guidelines:
- Respond in the same language as the user's question (e.g., Arabic, French, English).
- Be polite, concise, and professional.
- If you don't know something specific about a particular event, encourage the user to check the event details page.
- Focus on being a helpful guide for the Badji app ecosystem.`,
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
