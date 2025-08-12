import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders, preflight } from '../_shared/cors.ts';

const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

serve(async (req) => {
  const pf = preflight(req); if (pf) return pf;
  const url = new URL(req.url);
  try {
    if (req.method === 'GET') {
      const supplier = url.searchParams.get('supplier_id');
      let q = supabase.from('rate_cards').select('*, suppliers(*), products(*)').order('created_at', { ascending: false });
      if (supplier) q = q.eq('supplier_id', supplier);
      const { data, error } = await q;
      if (error) return err(error.message, 400);
      return ok(data);
    }
    if (req.method === 'POST') {
      const body = await req.json();
      const { data, error } = await supabase.from('rate_cards').insert(body).select().single();
      if (error) return err(error.message, 400);
      return ok(data);
    }
    if (req.method === 'PUT') {
      const body = await req.json(); const { id, ...fields } = body;
      const { data, error } = await supabase.from('rate_cards').update(fields).eq('id', id).select().single();
      if (error) return err(error.message, 400);
      return ok(data);
    }
    if (req.method === 'DELETE') {
      const id = url.searchParams.get('id'); if (!id) return err('Missing id', 400);
      const { error } = await supabase.from('rate_cards').delete().eq('id', id);
      if (error) return err(error.message, 400);
      return ok({ ok: true });
    }
    return err('Method not allowed', 405);
  } catch (e) { return err((e as Error).message, 500); }
});

function ok(d:unknown,s=200){return new Response(JSON.stringify(d),{status:s,headers:{...corsHeaders,'Content-Type':'application/json'}})}
function err(m:string,s=500){return ok({error:m},s)}