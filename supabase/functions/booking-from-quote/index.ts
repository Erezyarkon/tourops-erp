import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function ok(d:unknown,s=200){return new Response(JSON.stringify(d),{status:s,headers:{...cors,'Content-Type':'application/json'}})}
function err(m:string,s=500){return ok({error:m},s)}

function freeHotelPax(groupSize:number){ return Math.floor(groupSize/20); }

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return err('Method not allowed', 405);

  try {
    const { quoteId } = await req.json().catch(()=>({}));
    if (!quoteId) return err('quoteId required', 400);

    const { data: quote, error: qerr } = await supabase
      .from('quotes').select('*, customers(*), quote_items(*)').eq('id', quoteId).single();
    if (qerr || !quote) return err('Quote not found', 404);

    const group = Number(quote.group_size||0);
    const items = quote.quote_items||[];

    const { data: booking, error: berr } = await supabase.from('bookings').insert({
      quote_id: quote.id, customer_id: quote.customer_id, title: quote.title,
      start_date: quote.start_date, end_date: quote.end_date, pax: group, status: 'pending'
    }).select().single();
    if (berr) return err(berr.message, 400);

    const fh = freeHotelPax(group);
    for (const it of items){
      const isHotel = it.service_type==='hotel';
      const payingPax = isHotel ? Math.max(group - fh, 0) : group;
      const totalNet = Number(it.cost_per_group||0) + Number(it.cost_per_person||0)*payingPax;
      await supabase.from('booking_items').insert({
        booking_id: booking.id, supplier_id: it.supplier_id, service_type: it.service_type,
        title: it.title, quantity: 1, unit_price: totalNet, total_price: totalNet, currency: 'USD'
      });
    }

    return ok({ ok:true, bookingId: booking.id });
  } catch (e) { return err((e as Error).message, 500); }
});