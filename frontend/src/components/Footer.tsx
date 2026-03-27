import { Mail, Phone, MapPin, Clock3 } from "lucide-react";
import { useI18n } from "../i18n/I18nContext";

export default function Footer() {
  const { t } = useI18n();

  return (
    <footer className="bg-white border-t border-gray-100 mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div>
          <h4 className="text-sm font-black tracking-wide text-gray-900 uppercase mb-3">
            {t("footer.companyName")}
          </h4>
          <p className="text-sm text-gray-500 leading-relaxed">
            {t("footer.tagline")}
          </p>
        </div>

        <div className="text-sm text-gray-600 space-y-2">
          <p className="font-semibold text-gray-900 mb-1">
            {t("footer.contact")}
          </p>
          <a
            href="mailto:info@printcraft.nl"
            className="flex items-center gap-2 hover:text-emerald-700"
          >
            <Mail size={16} /> info@printcraft.nl
          </a>
          {/* <a
            href="tel:+31101234567"
            className="flex items-center gap-2 hover:text-emerald-700"
          >
            <Phone size={16} /> +31 10 123 4567
          </a> */}
        </div>

        <div className="text-sm text-gray-600 space-y-2">
          <p className="font-semibold text-gray-900 mb-1">
            {t("footer.location")}
          </p>
          <p className="flex items-center gap-2">
            <MapPin size={16} /> Rotterdam, Nederland
          </p>
        </div>

        <div className="text-sm text-gray-600 space-y-2">
          <p className="font-semibold text-gray-900 mb-1">
            {t("footer.hours")}
          </p>
          <p className="flex items-center gap-2">
            <Clock3 size={16} /> {t("footer.hoursValue")}
          </p>
        </div>
      </div>

      <div className="border-t border-gray-100 py-5 px-6 text-center">
        <p className="text-xs text-gray-400">{t("footer.copyright")}</p>
      </div>
    </footer>
  );
}
