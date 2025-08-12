const ALLOW_ORIGIN = Deno.env.get('CORS_ORIGIN') ?? '*';

export const corsHeaders = {
  'Access-Control-Allow-Origin': ALLOW_ORIGIN,
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
};

export function preflight(req: Request) {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  return null;
}