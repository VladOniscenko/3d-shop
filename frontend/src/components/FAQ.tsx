// src/components/FAQ.tsx
import React, { useState } from "react";
import Navbar from "./Navbar";
import { ChevronDown, ChevronUp, MessageCircleQuestion } from "lucide-react";
import { Link } from "react-router-dom";

// --- Data ---
const faqData = [
  {
    question: "What type of 3D files do you accept?",
    answer:
      "We accept the most common 3D files: .STL, .OBJ, and .3MF. If you have a different file type from your design software, you can usually use the 'Export' or 'Save As' option to turn it into an STL file before uploading.",
  },
  {
    question: "How much does a custom print cost?",
    answer:
      "The price depends on the size of the object, how solid it needs to be inside, and the material you choose. A small desk toy might be $10, while a large custom bracket could be $40. Use our 'Get a Quote' button for an exact, no-hidden-fee price.",
  },
  {
    question: "How long will it take to get my item?",
    answer:
      "Usually, we finish printing and drop your package in the mail within 2 to 5 business days. Shipping time depends on where you live, but we always provide a tracking number so you can watch it travel.",
  },
  {
    question:
      "I have an idea, but I don't know how to make a 3D file. Can you help?",
    answer:
      "Yes! If you have sketches, reference photos, or just a really good description of what you need, submit a 'Custom Design' request. Our team can build the 3D file for you.",
  },
  {
    question: "Are the printed parts safe for food or drinks?",
    answer:
      "Standard 3D printed plastics are generally not recommended for direct contact with food or hot drinks because tiny bacteria can hide in the printing lines. However, we can advise you on food-safe coatings if that is what your project needs.",
  },
  {
    question: "What happens if my print breaks in the mail?",
    answer:
      "We pack everything very carefully, but accidents happen. If your item arrives broken or has a major printing mistake, just send us a photo within 3 days, and we will reprint and reship it to you for free.",
  },
];

export default function FAQ() {
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
            Frequently Asked Questions
          </h1>
          <p className="text-emerald-50/80 text-lg">
            Got questions about 3D printing, shipping, or materials? We have got
            you covered.
          </p>
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
          <p className="text-gray-500 mb-4">
            Still can't find the answer you're looking for?
          </p>
          <Link
            to="/quote"
            className="text-[#133827] font-bold hover:underline"
          >
            Send us a message
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-12 px-6 text-center text-gray-500 text-sm mt-auto">
        <p>© 2026 PrintCraft Collective. All rights reserved.</p>
      </footer>
    </div>
  );
}
