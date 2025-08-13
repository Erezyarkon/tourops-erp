import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "../components/LanguageSwitcher";
import { Quotes } from "../components/Quotes";
import { Suppliers } from "../components/Suppliers";
import { Settings } from "../components/Settings";
import { Bookings } from "../components/Bookings";
import { BrandLogo } from "../components/BrandLogo";
type Tab = "quotes"|"bookings"|"suppliers"|"settings";
export default function App(){
  const { t, i18n } = useTranslation();
  const [tab, setTab] = useState<Tab>("quotes");
  useEffect(()=>{ document.documentElement.dir = i18n.language==="he"?"rtl":"ltr"; }, [i18n.language]);
  return (
    <div className="min-h-screen">
  <header className="bg-white border-b sticky top-0 z-10">
  <div className="max-w-6xl mx-auto p-4 flex items-center justify-between">
    <div className="flex items-center gap-3">
      <BrandLogo className="h-8 w-auto" />
      <h1 className="font-semibold text-xl">{t("app.title")}</h1>
    </div>
    <div className="flex items-center gap-3">
      <nav className="hidden sm:flex gap-3">
        {/* ... נשאר כפי שהוא ... */}
      </nav>
      <LanguageSwitcher />
    </div>
  </div>
</header>
      <main className="max-w-6xl mx-auto p-4">
        {tab==='quotes' && <Quotes />}
        {tab==='bookings' && <Bookings />}
        {tab==='suppliers' && <Suppliers />}
        {tab==='settings' && <Settings />}
      </main>
    </div>
  );
}
