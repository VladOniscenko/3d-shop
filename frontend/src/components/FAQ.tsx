// src/components/FAQ.tsx
import { useState } from "react";
import Navbar from "./Navbar";
import { ChevronDown, ChevronUp, MessageCircleQuestion } from "lucide-react";
import { useI18n } from "../i18n/I18nContext";
import Footer from "./Footer";
import { Link } from "react-router-dom";

export default function FAQ() {
  const { t } = useI18n();
  const supportPath = localStorage.getItem("token") ? "/quote" : "/signup";
  const faqData = [
    { question: t("faq.q1"), answer: t("faq.a1") },
    { question: t("faq.q2"), answer: t("faq.a2") },
    { question: t("faq.q3"), answer: t("faq.a3") },
    { question: t("faq.q4"), answer: t("faq.a4") },
    { question: t("faq.q5"), answer: t("faq.a5") },
    { question: t("faq.q6"), answer: t("faq.a6") },
  ];

  // Keeps track of which question is currently open
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleQuestion = (index: number) => {
    // If clicking the already open question, close it. Otherwise, open the new one.
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] font-sans text-gray-900 flex flex-col">
      <Navbar />

      {/* Header Section */}
      <header className="bg-[#133827] py-16 px-6 text-center">
        <div className="max-w-3xl mx-auto text-white">
          <div className="flex justify-center mb-6">
            <MessageCircleQuestion
              size={56}
              className="text-emerald-400 opacity-80"
            />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {t("faq.title")}
          </h1>
          <p className="text-emerald-50/80 text-lg">{t("faq.subtitle")}</p>
        </div>
      </header>

      {/* FAQ Accordion List */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-16 w-full flex-grow">
        <div className="space-y-4">
          {faqData.map((faq, index) => {
            const isOpen = openIndex === index;

            return (
              <div
                key={index}
                className={`bg-white border rounded-2xl overflow-hidden transition-all duration-200 ${
                  isOpen
                    ? "border-emerald-500 shadow-md"
                    : "border-gray-200 hover:border-emerald-300 shadow-sm"
                }`}
              >
                {/* Clickable Header */}
                <button
                  onClick={() => toggleQuestion(index)}
                  className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
                >
                  <h3
                    className={`font-bold text-lg pr-8 ${isOpen ? "text-[#133827]" : "text-gray-900"}`}
                  >
                    {faq.question}
                  </h3>
                  <div
                    className={`shrink-0 transition-transform duration-200 ${isOpen ? "text-emerald-600" : "text-gray-400"}`}
                  >
                    {isOpen ? (
                      <ChevronUp size={24} />
                    ) : (
                      <ChevronDown size={24} />
                    )}
                  </div>
                </button>

                {/* Expandable Answer */}
                {isOpen && (
                  <div className="px-6 pb-6 text-gray-600 leading-relaxed animate-in fade-in slide-in-from-top-2">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Contact Support Box */}
        <div className="mt-12 text-center">
          <p className="text-gray-500 mb-4">{t("faq.contactText")}</p>
          <Link
            to={supportPath}
            className="text-[#133827] font-bold hover:underline"
          >
            {t("faq.contactCta")}
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
