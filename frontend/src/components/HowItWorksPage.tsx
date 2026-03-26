import Navbar from "./Navbar";
import {
  Upload,
  Settings2,
  Printer,
  PackageCheck,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function HowItWorksPage() {
  const detailedSteps = [
    {
      number: 1,
      icon: <Upload size={40} className="text-emerald-600" />,
      title: "Upload or Request",
      desc: "Start by sending us your 3D design file (like an STL or OBJ file). If you do not have a file but have a great idea, you can describe it to us, and we can help you design it from scratch.",
    },
    {
      number: 2,
      icon: <Settings2 size={40} className="text-emerald-600" />,
      title: "Review & Quote",
      desc: "Our team checks your file to make sure it will print perfectly. We look at the size, the best material for the job, and how long it will take. Then, we send you a clear, honest price with no hidden fees.",
    },
    {
      number: 3,
      icon: <Printer size={40} className="text-emerald-600" />,
      title: "We Print",
      desc: "Once you approve the price, we send your design to our high-speed Bambu Lab P2S printers. We keep a close eye on the first few layers to make sure everything is sticking properly and looking great.",
    },
    {
      number: 4,
      icon: <PackageCheck size={40} className="text-emerald-600" />,
      title: "Packed & Shipped",
      desc: "After the print is done, we carefully remove it, clean up any rough edges, and pack it safely in eco-friendly materials. We then ship it straight to your front door.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#f8f9fa] font-sans text-gray-900 flex flex-col">
      <Navbar />

      {/* Page Header */}
      <header className="bg-[#133827] py-16 px-6 text-center">
        <div className="max-w-3xl mx-auto text-white">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">How It Works</h1>
          <p className="text-emerald-50/80 text-lg">
            Getting your custom parts printed is as easy as 1-2-3 (and 4!). Here
            is exactly what happens when you start a project with us.
          </p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-16 flex-grow">
        {/* The Step-by-Step List */}
        <div className="space-y-12">
          {detailedSteps.map((step) => (
            <div
              key={step.number}
              className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-start gap-8"
            >
              {/* Icon & Number Circle */}
              <div className="shrink-0 relative">
                <div className="w-20 h-20 bg-emerald-50 rounded-2xl flex items-center justify-center border border-emerald-100">
                  {step.icon}
                </div>
                <div className="absolute -top-3 -right-3 w-8 h-8 bg-[#133827] text-white rounded-full flex items-center justify-center font-bold text-sm shadow-md">
                  {step.number}
                </div>
              </div>

              {/* Text Content */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  {step.title}
                </h2>
                <p className="text-gray-600 leading-relaxed text-lg">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Quality Guarantee Box */}
        <div className="mt-16 bg-stone-100 rounded-2xl p-8 md:p-12 flex flex-col md:flex-row items-center gap-8 border border-stone-200">
          <div className="shrink-0 bg-white p-4 rounded-full shadow-sm">
            <CheckCircle2 size={48} className="text-emerald-600" />
          </div>
          <div>
            <h3 className="text-2xl font-bold mb-2">Our Quality Promise</h3>
            <p className="text-gray-600 mb-6">
              If your print does not match the file you sent or has major flaws,
              we will reprint it for free. We want you to love what you make.
            </p>
            <Link
              to="/quote"
              className="inline-flex items-center gap-2 font-bold text-emerald-700 hover:text-emerald-800 transition-colors"
            >
              Start your first project <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-12 px-6 text-center text-gray-500 text-sm">
        <p>© 2026 PrintCraft Collective. All rights reserved.</p>
      </footer>
    </div>
  );
}
