import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders, preflight } from '../_shared/cors.ts';

const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

serve(async (req) => {
  const pf = preflight(req); if (pf) return pf;
  const url = new URL(req.url);
  try {
    if (req.method === 'GET') {
      const id = url.searchParams.get('id');
      if (id) {
        const { data, error } = await supabase.from('tours_daily').select('*, pickup_points(*)').eq('id', id).single();
        if (error) return err(error.message, 400);
        return ok(data);
      }
      const { data, error } = await supabase.from('tours_daily').select('*').order('created_at', { ascending: false });
      if (error) return err(error.message, 400);
      return ok(data);
    }
    if (req.method === 'POST') {
      const body = await req.json();
      const { data, error } = await supabase.from('tours_daily').insert(body).select().single();
      if (error) return err(error.message, 400);
      return ok(data);
    }
    if (req.method === 'PUT') {
      const body = await req.json(); const { id, pickup_points, ...fields } = body;
      const { data, error } = await supabase.from('tours_daily').update(fields).eq('id', id).select().single();
      if (error) return err(error.message, 400);
      if (Array.isArray(pickup_points)) {
        await supabase.from('pickup_points').delete().eq('tour_daily_id', id);
        for (const p of pickup_points) {
          await supabase.from('pickup_points').insert({ tour_daily_id: id, name: p.name, time: p.time });
        }
      }
      return ok(data);
    }
    if (req.method === 'DELETE') {
      const id = url.searchParams.get('id'); if (!id) return err('Missing id', 400);
      await supabase.from('pickup_points').delete().eq('tour_daily_id', id);
      const { error } = await supabase.from('tours_daily').delete().eq('id', id);
      if (error) return err(error.message, 400);
      return ok({ ok: true });
    }
    return err('Method not allowed', 405);
  } catch (e) { return err((e as Error).message, 500); }
});

function ok(d:unknown,s=200){return new Response(JSON.stringify(d),{status:s,headers:{...corsHeaders,'Content-Type':'application/json'}})}
function err(m:string,s=500){return ok({error:m},s)}