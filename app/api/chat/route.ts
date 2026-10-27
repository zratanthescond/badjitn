import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createOpenAI } from '@ai-sdk/openai';
import { streamText, convertToModelMessages } from 'ai';

import { BADGI_KNOWLEDGE } from '@/lib/ai/badgi-knowledge';
import { buildChatUserContext } from '@/lib/ai/chat-context';

// Keep the request small (Groq free tier limits tokens per minute) by only
// sending the most recent turns of the conversation.
const MAX_HISTORY_MESSAGES = 12;

const SYSTEM_RULES = `Tu es "badgi AI", l'assistant officiel de la plateforme badgi.net. Tu aides les visiteurs, participants, organisateurs et administrateurs à utiliser la plateforme.

Règles absolues :
- Tu ne réponds QU'AUX questions liées à badgi : la plateforme, ses fonctionnalités, les événements qu'elle héberge, les inscriptions, les organisations, les certificats, les travaux scientifiques, les offres et le support. Pour tout autre sujet, refuse poliment et ramène la conversation vers badgi.
- Tu t'appuies UNIQUEMENT sur le guide ci-dessous. N'invente JAMAIS une fonctionnalité, un bouton, un menu, une page, un délai ou une règle qui n'y figure pas. Si l'information n'est pas dans le guide, dis-le clairement et oriente vers support@badgi.net ou vers l'organisateur de l'événement.
- Pour les détails d'un événement précis (programme, prix, dates), renvoie l'utilisateur à la page de l'événement ou à son organisateur : tu n'as pas accès au contenu des événements.
- Donne les chemins des pages tels qu'ils apparaissent dans le guide (ex. /events/create, /profile). Ne fabrique pas d'URL.
- Adapte la réponse au rôle et à la situation de l'utilisateur décrits dans la section "Contexte de l'utilisateur".
- Réponds dans la langue de l'interface indiquée, sauf si l'utilisateur écrit clairement dans une autre langue : dans ce cas, réponds dans sa langue.
- Sois concis et concret : étapes numérotées quand il s'agit d'une procédure, phrases courtes. Utilise le Markdown léger (gras, listes).
- Tu es l'assistant de badgi, pas une IA généraliste : ne parle pas de ton modèle ni de ton fournisseur.`;

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

    const recentMessages = cleanedMessages.slice(-MAX_HISTORY_MESSAGES);
    const [modelMessages, userContext] = await Promise.all([
      convertToModelMessages(recentMessages),
      buildChatUserContext(),
    ]);

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
      // Llama 3.x models were retired by Groq on 2026-08-16; these are the
      // official replacements (see console.groq.com/docs/deprecations).
      ? groq.chat(advanced ? 'openai/gpt-oss-120b' : 'openai/gpt-oss-20b')
      : googleProvider(advanced ? 'gemini-2.5-pro' : 'gemini-2.5-flash');

    const result = streamText({
      model,
      messages: modelMessages,
      onError: ({ error }) => {
        console.error('Chat API stream error:', error);
      },
      system: `${SYSTEM_RULES}

## Contexte de l'utilisateur
${userContext.prompt}

## Guide de la plateforme (source unique de vérité)
${BADGI_KNOWLEDGE}`,
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
