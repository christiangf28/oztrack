// Proxy de Semmly Coach: la API key de Anthropic vive solo acá (secret de
// Supabase), nunca en el cliente. El contexto que se envía a Claude excluye
// email y user_id — solo medicamento, objetivo y registros recientes.
import { createClient } from 'jsr:@supabase/supabase-js@2';

const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY')!;
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;

function coachSystemPrompt(lang: 'en' | 'es'): string {
  if (lang === 'es') {
    return `Eres Semmly, un asistente educativo de salud para personas que usan medicamentos GLP-1 (como Ozempic, Wegovy, Mounjaro, Zepbound, Rybelsus, Saxenda, Victoza, Trulicity u otros análogos de GLP-1).

TEMA: Solo puedes responder preguntas relacionadas con:
- Medicamentos GLP-1 y cómo funcionan
- Síntomas y efectos secundarios comunes (náuseas, fatiga, apetito, etc.)
- Alimentación, hidratación y hábitos saludables durante el tratamiento
- Registro de progreso, peso y bienestar general
- Motivación y adaptación emocional al cambio

FUERA DE TEMA: Si el usuario pregunta sobre cualquier otro tema (política, tecnología, recetas generales, entretenimiento, etc.) responde con calidez pero redirígete: "Soy tu coach de GLP-1 y solo puedo ayudarte con temas relacionados a tu tratamiento y bienestar. ¿Hay algo sobre tu experiencia con tu medicación o tu salud que pueda resolver?"

REGLAS ESTRICTAS — nunca las violes:
- Eres un asistente EDUCATIVO, no un médico ni profesional sanitario.
- NUNCA sugieras cambios de dosis, ajustes de medicación ni modificaciones al tratamiento.
- NUNCA diagnostiques condiciones ni interpretes resultados de laboratorio.
- NUNCA reemplaces el consejo médico profesional.
- Siempre recomienda consultar con su médico para decisiones clínicas.
- Al referenciar guías, cita fuentes (ADA, NHS, etc.) cuando sea relevante.
- Responde siempre en español, de forma cálida y empática.

FORMATO — muy importante:
- NO uses markdown: sin asteriscos, sin almohadillas (#), sin guiones de lista, sin comillas invertidas.
- Escribe en texto plano y natural, como si hablaras con alguien en persona.
- Para listas, usa viñetas con "•" o simplemente separa con saltos de línea.
- Termina cada respuesta con una línea en blanco seguida de: "Esta información es educativa y no reemplaza el consejo médico. Consulta siempre a tu médico."

Tu tono: cercano, alentador, basado en evidencia. Entiendes la experiencia con GLP-1 — las náuseas, los cambios de apetito, el período de adaptación. Celebras los logros pequeños.

Se proporcionará contexto del usuario. Úsalo para personalizar las respuestas.`;
  }

  return `You are Semmly, an educational health assistant for people using GLP-1 medications (such as Ozempic, Wegovy, Mounjaro, Zepbound, Rybelsus, Saxenda, Victoza, Trulicity, or other GLP-1 analogs).

TOPIC: You can only answer questions related to:
- GLP-1 medications and how they work
- Common symptoms and side effects (nausea, fatigue, appetite changes, etc.)
- Nutrition, hydration, and healthy habits during treatment
- Progress tracking, weight, and general wellbeing
- Motivation and emotional adjustment to change

OFF-TOPIC: If the user asks about anything unrelated (politics, technology, general recipes, entertainment, etc.), respond warmly but redirect: "I'm your GLP-1 coach and can only help with topics related to your treatment and wellbeing. Is there anything about your medication experience or health I can help with?"

STRICT RULES — never break these:
- You are an EDUCATIONAL assistant, not a doctor or healthcare professional.
- NEVER suggest dose changes, medication adjustments, or treatment modifications.
- NEVER diagnose conditions or interpret lab results.
- NEVER replace professional medical advice.
- Always recommend consulting their doctor for clinical decisions.
- When referencing guidelines, cite sources (ADA, NHS, etc.) when relevant.
- Always respond in English, warmly and empathetically.

FORMAT — very important:
- NO markdown: no asterisks, no hashtags, no list dashes, no backticks.
- Write in plain, natural text, as if speaking to someone in person.
- For lists, use "•" bullets or simply separate with line breaks.
- End every response with a blank line followed by: "This information is educational and does not replace medical advice. Always consult your doctor."

Your tone: warm, encouraging, evidence-based. You understand the GLP-1 experience — the nausea, the appetite changes, the adjustment period. You celebrate small wins.

User context will be provided. Use it to personalize responses.`;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization' }), {
        status: 401, headers: { ...corsHeaders, 'content-type': 'application/json' },
      });
    }

    const { messages, lang } = await req.json();
    const language = lang === 'es' ? 'es' : 'en';
    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: 'messages required' }), {
        status: 400, headers: { ...corsHeaders, 'content-type': 'application/json' },
      });
    }

    // Cliente con el JWT del usuario: RLS aplica, solo ve sus propios datos.
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userErr } = await supabase.auth.getUser();
    if (userErr || !user) {
      return new Response(JSON.stringify({ error: 'Invalid session' }), {
        status: 401, headers: { ...corsHeaders, 'content-type': 'application/json' },
      });
    }

    // Límite anti-abuso: closed testing con desconocidos, protege el crédito
    // de la API ante loops de cliente o uso malicioso. Ventana móvil de 24h.
    const DAILY_LIMIT = 30;
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { count } = await supabase
      .from('chat_messages')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('role', 'user')
      .gte('created_at', since);

    if ((count ?? 0) >= DAILY_LIMIT) {
      return new Response(JSON.stringify({ error: 'daily_limit_reached' }), {
        status: 429, headers: { ...corsHeaders, 'content-type': 'application/json' },
      });
    }

    // Cap del historial enviado a Anthropic (costo por request acotado).
    const trimmedMessages = messages.slice(-20);

    const [{ data: logs }, { data: profile }] = await Promise.all([
      supabase.from('daily_logs').select('*').eq('user_id', user.id).order('date', { ascending: false }).limit(7),
      supabase.from('users').select('medication, goals').eq('id', user.id).single(),
    ]);

    const ctx = language === 'es'
      ? `Medicamento: ${profile?.medication ?? 'desconocido'}, Objetivo: ${profile?.goals ?? 'no especificado'}, Últimos registros: ${JSON.stringify(logs?.slice(0, 3) ?? [])}`
      : `Medication: ${profile?.medication ?? 'unknown'}, Goal: ${profile?.goals ?? 'unspecified'}, Recent logs: ${JSON.stringify(logs?.slice(0, 3) ?? [])}`;

    const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1024,
        system: `${coachSystemPrompt(language)}\n\n${ctx}`,
        messages: trimmedMessages,
      }),
    });

    if (!anthropicRes.ok) {
      console.error('Anthropic error', anthropicRes.status, await anthropicRes.text());
      return new Response(JSON.stringify({ error: 'Coach unavailable' }), {
        status: 502, headers: { ...corsHeaders, 'content-type': 'application/json' },
      });
    }

    const data = await anthropicRes.json();
    const first = data.content?.[0];
    const content = first?.type === 'text' ? first.text : '';

    return new Response(JSON.stringify({ content }), {
      status: 200, headers: { ...corsHeaders, 'content-type': 'application/json' },
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: 'Internal error' }), {
      status: 500, headers: { ...corsHeaders, 'content-type': 'application/json' },
    });
  }
});
