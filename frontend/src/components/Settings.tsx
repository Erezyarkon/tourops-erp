import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useTranslation } from "react-i18next";
type CompanySettings = {
  id?: string; company_name?: string; company_email?: string; company_phone?: string; company_address?: string; logo_url?: string;
}
export function Settings(){
  const { t } = useTranslation();
  const [cfg, setCfg] = useState<CompanySettings>({});
  const [loading, setLoading] = useState(false);
  useEffect(()=>{ (async()=>{
    const { data } = await supabase.from("company_settings").select("*").limit(1).maybeSingle();
    if(data) setCfg(data as CompanySettings);
  })() },[])
  async function onFile(e: React.ChangeEvent<HTMLInputElement>){
    const file = e.target.files?.[0]; if(!file) return; setLoading(true);
    const bucket = "branding";
    await supabase.storage.createBucket(bucket, { public: true }).catch(()=>{});
    const path = `logo/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true });
    if(error){ alert(error.message); setLoading(false); return; }
    const { data:pub } = supabase.storage.from(bucket).getPublicUrl(path);
    const logo_url = pub.publicUrl;
    const { data:existing } = await supabase.from("company_settings").select("id").limit(1).maybeSingle();
    if(existing?.id){ await supabase.from("company_settings").update({ logo_url }).eq("id", existing.id); }
    else { await supabase.from("company_settings").insert({ logo_url }); }
    setCfg(prev=>({ ...prev, logo_url })); setLoading(false);
  }
  async function save(){
    setLoading(true);
    const { data:existing } = await supabase.from("company_settings").select("id").limit(1).maybeSingle();
    if(existing?.id){ await supabase.from("company_settings").update(cfg).eq("id", existing.id); }
    else { await supabase.from("company_settings").insert(cfg); }
    setLoading(false);
  }
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">{t("settings.company")}</h2>
      <div className="grid sm:grid-cols-2 gap-4">
        <label className="block"><span className="text-sm">Company name</span>
          <input className="mt-1 w-full border rounded px-3 py-2" value={cfg.company_name||""} onChange={e=>setCfg({...cfg, company_name:e.target.value})} />
        </label>
        <label className="block"><span className="text-sm">Email</span>
          <input className="mt-1 w-full border rounded px-3 py-2" value={cfg.company_email||""} onChange={e=>setCfg({...cfg, company_email:e.target.value})} />
        </label>
        <label className="block"><span className="text-sm">Phone</span>
          <input className="mt-1 w-full border rounded px-3 py-2" value={cfg.company_phone||""} onChange={e=>setCfg({...cfg, company_phone:e.target.value})} />
        </label>
        <label className="block"><span className="text-sm">Address</span>
          <input className="mt-1 w-full border rounded px-3 py-2" value={cfg.company_address||""} onChange={e=>setCfg({...cfg, company_address:e.target.value})} />
        </label>
      </div>
      <div>
        <span className="block text-sm mb-1">{t("settings.logo")}</span>
        {cfg.logo_url && <img src={cfg.logo_url} alt="logo" className="h-16 mb-2" />}
        <input type="file" accept="image/*" onChange={onFile} disabled={loading} />
      </div>
      <button onClick={save} disabled={loading} className="px-4 py-2 rounded bg-gray-900 text-white">{t("settings.save")}</button>
    </div>
  );
}
