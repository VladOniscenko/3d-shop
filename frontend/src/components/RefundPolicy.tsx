import Navbar from "./Navbar";
import Footer from "./Footer";
import { useI18n } from "../i18n/I18nContext";

export default function RefundPolicy() {
  const { t } = useI18n();

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col">
      <Navbar />
      <main className="max-w-4xl mx-auto px-6 py-12 w-full flex-grow">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          {t("legal.refunds.title")}
        </h1>
        <p className="text-gray-600 mb-8">{t("legal.updated")}</p>

        <div className="space-y-6 text-gray-700 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {t("legal.refunds.section1Title")}
            </h2>
            <p>{t("legal.refunds.section1Body")}</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {t("legal.refunds.section2Title")}
            </h2>
            <p>{t("legal.refunds.section2Body")}</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {t("legal.refunds.section3Title")}
            </h2>
            <p>{t("legal.refunds.section3Body")}</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {t("legal.refunds.section4Title")}
            </h2>
            <p>{t("legal.refunds.section4Body")}</p>
          </section>

          <section className="bg-white border border-gray-200 rounded-2xl p-5">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              {t("legal.contact.title")}
            </h2>
            <p>{t("legal.contact.body")}</p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
