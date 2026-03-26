import React, { useState } from "react";
import { UploadCloud, File, X, Loader2, CheckCircle2 } from "lucide-react";
import Navbar from "./Navbar";
import api from "../services/api"; // Import your axios service

export default function Upload() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [instructions, setInstructions] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
      setSuccess(false); // Reset success if they pick a new file
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setLoading(true);

    try {
      // 1. Prepare the file for the API
      const formData = new FormData();
      formData.append("file", selectedFile);

      // 2. Upload the file to your .NET /api/upload route
      const uploadRes = await api.post("/upload", formData);
      const fileUrl = uploadRes.data.url;

      // 3. Create the Order entry in the database
      await api.post("/orders/quote", {
        fileUrl: fileUrl,
        notes: instructions,
        status: "pending_quote",
        createdAt: new Date(),
      });

      // 4. Show success and clear the form
      setSuccess(true);
      setSelectedFile(null);
      setInstructions("");
    } catch (error) {
      console.error("Upload failed", error);
      alert("Something went wrong with the upload. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-16 w-full">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold mb-4">Upload Your Design</h1>
          <p className="text-gray-500 text-lg">
            We accept .STL, .OBJ, and .3MF files. Upload your file below to get
            started.
          </p>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
          {/* Success Message */}
          {success && (
            <div className="mb-8 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-3">
              <CheckCircle2 className="text-emerald-600" />
              <p className="font-medium">
                Success! Your design has been sent for a quote.
              </p>
            </div>
          )}

          {/* Drag and Drop Zone */}
          {!selectedFile ? (
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:bg-gray-50 transition-colors">
              <UploadCloud
                size={64}
                className="mx-auto text-emerald-500 mb-4"
              />
              <h3 className="text-xl font-bold text-gray-700 mb-2">
                Drag & drop your file here
              </h3>
              <p className="text-gray-500 mb-6">
                or click the button to browse your computer
              </p>

              <label className="cursor-pointer bg-[#133827] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#1c4d37] transition-colors inline-block">
                Choose File
                <input
                  type="file"
                  className="hidden"
                  accept=".stl,.obj,.3mf"
                  onChange={handleFileChange}
                />
              </label>
            </div>
          ) : (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-white p-3 rounded-lg shadow-sm">
                  <File size={32} className="text-emerald-600" />
                </div>
                <div>
                  <p className="font-bold text-gray-900">{selectedFile.name}</p>
                  <p className="text-sm text-gray-500">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedFile(null)}
                className="text-gray-400 hover:text-red-500 p-2 transition-colors"
                aria-label="Remove file"
              >
                <X size={24} />
              </button>
            </div>
          )}

          {/* Form to submit */}
          <form className="mt-8 space-y-6" onSubmit={handleUpload}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Any special instructions?
              </label>
              <textarea
                rows={3}
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                placeholder="E.g., Please print this in red PETG if possible..."
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={!selectedFile || loading}
              className={`w-full font-bold py-4 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                selectedFile && !loading
                  ? "bg-emerald-600 text-white hover:bg-emerald-700"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} /> Sending...
                </>
              ) : (
                "Get My Quote"
              )}
            </button>
          </form>
        </div>
      </main>
    </>
  );
}
