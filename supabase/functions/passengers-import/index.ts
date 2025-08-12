import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders, preflight } from '../_shared/cors.ts';

const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

serve(async (req) => {
  const pf = preflight(req); if (pf) return pf;

  try {
    if (req.method !== 'POST') return err('Method not allowed', 405);
    const { booking_id, rows } = await req.json();
    if (!booking_id || !Array.isArray(rows)) return err('booking_id and rows[] required', 400);

    for (const r of rows) {
      await supabase.from('passengers').insert({
        booking_id, first_name: r.first_name, last_name: r.last_name,
        email: r.email, phone: r.phone, role: r.role || 'pax'
      });
    }
    return ok({ ok: true, count: rows.length });
  } catch (e) {
    return err((e as Error).message, 500);
  }
});

function ok(d:unknown,s=200){return new Response(JSON.stringify(d),{status:s,headers:{...corsHeaders,'Content-Type':'application/json'}})}
function err(m:string,s=500){return ok({error:m},s)}