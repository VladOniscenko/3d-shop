// src/components/Quote.tsx
import Navbar from "./Navbar";

export default function Quote() {
  return (
    <div className="min-h-screen bg-[#f8f9fa] font-sans text-gray-900">
      <Navbar />

      <main className="max-w-3xl mx-auto px-6 py-16">
        <h2 className="text-4xl font-bold mb-4">Get a Custom Quote</h2>
        <p className="text-gray-500 mb-8">
          Tell us about your project and we will get back to you with a price.
        </p>

        <form className="bg-white p-8 rounded-2xl shadow-sm space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Project Name
            </label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              placeholder="E.g., Custom Keyboard Case"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Details & Dimensions
            </label>
            <textarea
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              placeholder="Describe your part..."
            ></textarea>
          </div>

          <button
            type="button"
            className="w-full bg-[#133827] text-white font-bold py-3 rounded-lg hover:bg-[#1c4d37] transition-colors"
          >
            Submit Request
          </button>
        </form>
      </main>
    </div>
  );
}
