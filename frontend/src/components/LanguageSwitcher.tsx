import { useTranslation } from "react-i18next";
export function LanguageSwitcher(){
  const { i18n, t } = useTranslation();
  const change = (lng:string)=>{
    i18n.changeLanguage(lng);
    localStorage.setItem("lang", lng);
    document.documentElement.dir = lng==="he"?"rtl":"ltr";
  };
  return (
    <select className="border rounded px-2 py-1" value={i18n.language} onChange={e=>change(e.target.value)} title={t("common.language")||"Language"}>
      <option value="en">{t("common.english")}</option>
      <option value="he">{t("common.hebrew")}</option>
    </select>
  );
}
