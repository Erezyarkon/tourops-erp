// frontend/src/components/BrandLogo.tsx
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export function BrandLogo({ className = "h-8 w-auto" }: { className?: string }) {
  const [dbLogo, setDbLogo] = useState<string | null>(null);
  const envLogo = (import.meta.env.VITE_APP_LOGO as string) || null;

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("company_settings")
        .select("logo_url")
        .limit(1)
        .maybeSingle();
      if (data?.logo_url) setDbLogo(data.logo_url);
    })();
  }, []);

  const src = dbLogo || envLogo || null;
  if (!src) return null;

  return <img src={src} alt="Logo" className={className} />;
}
