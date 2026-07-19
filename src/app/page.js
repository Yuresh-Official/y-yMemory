'use client';
import { useState, useEffect } from 'react';
import { storage } from '@/firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

export default function Home() {
  const [memories, setMemories] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Fetch all memories on page load
  useEffect(() => {
    fetchMemories();
  }, []);

  const fetchMemories = async () => {
    const res = await fetch('/api/memories');
    const result = await res.json();
    if (result.success) setMemories(result.data);
  };

  const handleUploadAndSave = async (e) => {
    e.preventDefault();
    if (!file || !title) return alert("Please fill title and choose a photo! 💖");

    setLoading(true);
    // 1. Uploading image to Firebase Storage
    const storageRef = ref(storage, `memories/${Date.now()}_${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on('state_changed', 
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(Math.round(progress));
      }, 
      (error) => {
        console.error(error);
        setLoading(false);
      }, 
      async () => {
        // 2. Get download URL from Firebase
        const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
        
        // 3. Save details to MongoDB via our API
        const response = await fetch('/api/memories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, description, mediaUrl: downloadUrl })
        });

        const data = await response.json();
        if (data.success) {
          setTitle('');
          setDescription('');
          setFile(null);
          setUploadProgress(0);
          fetchMemories(); // Refresh dashboard
        }
        setLoading(false);
      }
    );
  };

  return (
    <div className="min-h-screen bg-[#fff0f3] text-[#4a304d] font-sans pb-12">
      {/* Soft Heart Banner */}
      <header className="bg-gradient-to-r from-[#ffb5a7] to-[#fcd5ce] text-center py-10 shadow-sm border-b-4 border-[#ffb5a7]">
        <h1 className="text-3xl md:text-5xl font-serif text-white tracking-wide">💖 Our Private Memory Vault 📂</h1>
        <p className="text-[#8f2d56] italic mt-2 text-sm md:text-base font-medium">Keeping our special beautiful moments forever alive...</p>
      </header>

      <main className="max-w-6xl mx-auto px-4 mt-10">
        {/* Memory Input Form */}
        <section className="bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-md max-w-xl mx-auto border border-[#ffccd5]">
          <h2 className="text-xl font-serif text-[#d81159] mb-4 text-center font-bold">Add a New Sweet Memory</h2>
          <form onSubmit={handleUploadAndSave} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-[#8f2d56]">Moment Title *</label>
              <input 
                type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Our First Date at Beach 🌊"
                className="w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ffb5a7] bg-rose-50/50"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-[#8f2d56]">Little Love Note (Description)</label>
              <textarea 
                value={description} onChange={(e) => setDescription(e.target.value)}
                placeholder="Write what made this moment so special..."
                className="w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ffb5a7] bg-rose-50/50 h-20"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-[#8f2d56]">Choose Polaroid Photo *</label>
              <input 
                type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])}
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#ffe5ec] file:text-[#d81159] hover:file:bg-[#ffccd5] cursor-pointer"
                required
              />
            </div>

            {loading && (
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-[#d81159] h-2.5 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                <p className="text-center text-xs mt-1 text-[#d81159] font-semibold">Uploading Your Love Asset... {uploadProgress}%</p>
              </div>
            )}

            <button 
              type="submit" disabled={loading}
              className="w-full bg-[#d81159] text-white py-3 rounded-xl font-semibold hover:bg-[#c9184a] shadow-md hover:shadow-lg transition-all disabled:opacity-50"
            >
              {loading ? 'Locking into Vault...' : 'Save into Vault 🔒'}
            </button>
          </form>
        </section>

        {/* Polaroid Memory Grid Display */}
        <section className="mt-14">
          <h2 className="text-2xl font-serif text-[#8f2d56] mb-8 text-center font-bold relative inline-block w-full">
            ✨ Our Captured Timelines ✨
          </h2>
          
          {memories.length === 0 ? (
            <p className="text-center text-gray-500 italic mt-6">No memories inside the vault yet. Start uploading your love pages! 💕</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
              {memories.map((memory) => (
                <div key={memory._id} className="bg-white p-4 pb-8 shadow-xl border border-gray-100 rounded-sm transform hover:rotate-1 hover:scale-105 transition-all duration-300">
                  {/* Photo Section */}
                  <div className="w-full aspect-square relative overflow-hidden bg-gray-100 border border-gray-200">
                    <img src={memory.mediaUrl} alt={memory.title} className="w-full h-full object-cover" />
                  </div>
                  {/* Polaroid Text Section */}
                  <div className="mt-4 font-serif">
                    <h3 className="text-lg font-bold text-[#4a304d] leading-snug">{memory.title}</h3>
                    <p className="text-xs text-gray-400 mt-1">📅 {new Date(memory.date).toLocaleDateString()}</p>
                    {memory.description && (
                      <p className="text-sm text-gray-600 mt-2 italic font-sans border-t pt-2 border-dashed border-rose-100">
                        "{memory.description}"
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
