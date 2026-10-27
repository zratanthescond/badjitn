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

// Node runtime: on self-hosted deployments (Coolify/Docker) the edge runtime
// does not see container environment variables at request time, so the API
// keys were always reported as missing.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { messages, toolId }: { messages: any[]; toolId?: string } = await req.json();

    if (!Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: 'Messages are required' }), { status: 400 });
    }

    // Drop messages without any text (e.g. empty assistant bubbles persisted in
    // localStorage after a failed request). Groq rejects empty content.
    const cleanedMessages = messages
      .map((m) => ({
        ...m,
        parts: Array.isArray(m.parts)
          ? m.parts.filter((p: any) => p?.type === 'text' && typeof p.text === 'string' && p.text.trim() !== '')
          : [],
      }))
      .filter((m) => m.parts.length > 0);

    if (cleanedMessages.length === 0) {
      return new Response(JSON.stringify({ error: 'Messages are required' }), { status: 400 });
    }

    const modelMessages = await convertToModelMessages(cleanedMessages);

    // Provider selection: Groq is the primary provider (free tier, fast).
    // Gemini is only used when GROQ_API_KEY is absent and a Google key exists.
    const hasGroq = !!process.env.GROQ_API_KEY;
    const hasGoogle = !!process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    const advanced = toolId === 'chatgpt';

    if (!hasGroq && !hasGoogle) {
      console.error('Chat API: missing GROQ_API_KEY (or GOOGLE_GENERATIVE_AI_API_KEY)');
      return new Response(
        JSON.stringify({ error: 'AI provider is not configured (GROQ_API_KEY is missing)' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const model = hasGroq
      ? groq.chat(advanced ? 'llama-3.3-70b-versatile' : 'llama-3.1-8b-instant')
      : googleProvider(advanced ? 'gemini-2.5-pro' : 'gemini-2.5-flash');

    const result = streamText({
      model,
      messages: modelMessages,
      onError: ({ error }) => {
        console.error('Chat API stream error:', error);
      },
      system: `You are "badgi Chat", a helpful and friendly AI assistant dedicated only to the badgi platform.

Your scope is strictly limited to:
- the badgi platform
- badgi offers and services
- event creation and event management on badgi
- registration, on-site access, and event participation
- information about events shown on the platform

Important rules:
- Reply in the same language as the user.
- Be concise, clear, and professional.
- If the user asks about something outside badgi, its offers, or its events, politely refuse and redirect them back to badgi-related topics.
- Do not answer broad general-knowledge questions unrelated to the platform.
- If you do not know a specific event detail, tell the user to open the event page or contact the organizer.
- Present yourself as badgi's platform assistant, not as a general-purpose AI.

Helpful product context:
- badgi is an event platform where users can discover, create, manage, and attend events.
- Users may browse events, filter them, and access event details.
- Registrations and participant access can be handled through the platform.
- The assistant should help users understand the platform experience and available offers only.`,
    });

    // UI message stream forwards provider errors to the client instead of
    // silently ending with an empty message.
    return result.toUIMessageStreamResponse({
      onError: (error) => {
        const message = error instanceof Error ? error.message : String(error);
        return `AI provider error: ${message}`;
      },
    });
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
