// Cloudflare Pages Function: /api/feedback
// Runs on https://html-editor-bmj.pages.dev/api/feedback

interface Env {
  FEEDBACK_KV?: {
    get: (key: string) => Promise<string | null>;
    put: (key: string, value: string) => Promise<void>;
  };
}

interface EventContext {
  request: Request;
  env: Env;
}

export async function onRequestGet(context: EventContext): Promise<Response> {
  const corsHeaders = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  try {
    if (context.env?.FEEDBACK_KV) {
      const data = await context.env.FEEDBACK_KV.get('feedback_items');
      return new Response(data || '[]', { headers: corsHeaders });
    }

    return new Response(JSON.stringify([]), { headers: corsHeaders });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return new Response(JSON.stringify({ error: msg }), { status: 500, headers: corsHeaders });
  }
}

export async function onRequestPost(context: EventContext): Promise<Response> {
  const corsHeaders = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  try {
    const item = await context.request.json();

    if (context.env?.FEEDBACK_KV) {
      const existingRaw = await context.env.FEEDBACK_KV.get('feedback_items');
      let existing: unknown[] = [];
      try {
        existing = existingRaw ? JSON.parse(existingRaw) : [];
      } catch {
        existing = [];
      }

      existing.unshift(item);
      const trimmed = existing.slice(0, 200);
      await context.env.FEEDBACK_KV.put('feedback_items', JSON.stringify(trimmed));

      return new Response(JSON.stringify({ success: true, count: trimmed.length, source: 'kv' }), {
        headers: corsHeaders,
      });
    }

    return new Response(JSON.stringify({ success: true, source: 'local' }), {
      headers: corsHeaders,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return new Response(JSON.stringify({ error: msg }), { status: 500, headers: corsHeaders });
  }
}

export async function onRequestOptions(): Promise<Response> {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
