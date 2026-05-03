/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Download, 
  FileText, 
  Image as ImageIcon, 
  ExternalLink, 
  CheckCircle2, 
  ShieldCheck,
  BookOpen,
  GraduationCap,
  Bell,
  Trash2,
  Info,
  User
} from "lucide-react";

interface Channel {
  id: string;
  name: string;
  link: string;
}

interface Exam {
  id: string;
  title: string;
  subject: string;
  grade: string;
  type: string;
  url: string;
}

export default function App() {
  const [isJoined, setIsJoined] = useState<boolean>(() => {
    return localStorage.getItem("joined_channels") === "true";
  });
  const [channels, setChannels] = useState<Channel[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [newExam, setNewExam] = useState({ title: "", subject: "", grade: "١٢", type: "pdf", url: "" });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [channelsRes, examsRes] = await Promise.all([
        fetch("/api/channels"),
        fetch("/api/exams")
      ]);
      const channelsData = await channelsRes.json();
      const examsData = await examsRes.json();
      setChannels(channelsData);
      setExams(examsData);
    } catch (err) {
      console.error("Failed to fetch data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddExam = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/exams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newExam, password: adminPassword })
      });
      if (res.ok) {
        await fetchData();
        setNewExam({ title: "", subject: "", grade: "١٢", type: "pdf", url: "" });
        setIsAdminMode(false);
        alert("ئەسیلەکە بە سەرکەوتوویی زیاد کرا!");
      } else {
        const err = await res.json();
        alert(err.error || "هەڵەیەک ڕوویدا");
      }
    } catch (err) {
      alert("هەڵەیەک ڕوویدا لە کاتی زیادکردن");
    }
  };

  const handleDeleteExam = async (id: string) => {
    if (!window.confirm("ئایا دڵنیایت لە سڕینەوەی ئەم ئەسیلەیە؟")) return;
    
    try {
      const res = await fetch(`/api/exams/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: adminPassword })
      });
      
      if (res.ok) {
        await fetchData();
        alert("بە سەرکەوتوویی سڕایەوە");
      } else {
        const err = await res.json();
        alert(err.error || "هەڵەیەک ڕوویدا");
      }
    } catch (err) {
      alert("هەڵەیەک ڕوویدا لە کاتی سڕینەوە");
    }
  };

  const handleJoinConfirm = () => {
    localStorage.setItem("joined_channels", "true");
    setIsJoined(true);
  };

  if (loading && exams.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen font-sans">
        <div className="animate-pulse text-indigo-600 font-bold text-xl">کەمێک چاوەڕوان بە...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans bg-slate-50 overflow-x-hidden">
      <AnimatePresence mode="wait">
        {!isJoined ? (
          // ... Join Screen ...
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
          >
            <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden p-8 text-center border border-slate-100">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShieldCheck className="w-8 h-8 text-indigo-600" />
              </div>
              <h2 className="text-2xl font-black mb-3 text-slate-800">بۆتی ئەسیلە و مەلزەمە</h2>
              <p className="text-slate-500 mb-8 leading-relaxed">
                سڵاو! بۆ ئەوەی بتوانیت سوود لە خزمەتگوزارییەکانی ئەم بۆتە وەربگریت، پێویستە سەرەتا جۆینی ئەم کەناڵانە بیت:
              </p>

              <div className="space-y-3 mb-8">
                {channels.map(channel => (
                  <a
                    key={channel.id}
                    href={channel.link}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between p-4 bg-indigo-50/50 hover:bg-indigo-50 border border-indigo-100/50 rounded-2xl transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                        <ExternalLink className="w-4 h-4 text-indigo-500" />
                      </div>
                      <span className="font-bold text-slate-700">{channel.name}</span>
                    </div>
                    <span className="text-xs text-indigo-600 font-bold bg-indigo-100 px-3 py-1 rounded-full group-hover:scale-105 transition-transform">
                      جۆین بە
                    </span>
                  </a>
                ))}
              </div>

              <button
                onClick={handleJoinConfirm}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl shadow-xl shadow-indigo-200 transition-all flex items-center justify-center gap-2 group active:scale-[0.98]"
              >
                <CheckCircle2 className="w-5 h-5" />
                جۆین بووم، بۆتەکە کارا بکە
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col min-h-screen"
          >
              {/* About Modal */}
              <AnimatePresence>
                {showAbout && (
                  <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md"
                  >
                    <motion.div 
                      initial={{ scale: 0.9, opacity: 0 }} 
                      animate={{ scale: 1, opacity: 1 }}
                      className="bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl text-center"
                    >
                      <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <User className="w-10 h-10 text-indigo-600" />
                      </div>
                      <h2 className="text-2xl font-black text-slate-800 mb-2">دەربارەی پڕۆژە</h2>
                      <p className="text-slate-600 leading-relaxed mb-6">
                        ئەم پلاتفۆرمە دروست کراوە لە لایەن <span className="font-black text-indigo-600">Bradost Zagana</span> بۆ خزمەتی قوتابیانی ئازیز، بە مەبەستی ئاسانکاری لە دۆزینەوەی ئەسیلە و سەرچاوەکان.
                      </p>
                      <button 
                        onClick={() => setShowAbout(false)}
                        className="w-full py-4 bg-slate-100 font-bold rounded-2xl text-slate-600 hover:bg-slate-200 transition-colors"
                      >
                        داخستن
                      </button>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {isAdminMode && (
                  <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md"
                  >
                  <motion.div 
                    initial={{ y: 50 }} 
                    animate={{ y: 0 }}
                    className="bg-white w-full max-w-lg rounded-3xl p-8 shadow-2xl"
                  >
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-black text-slate-800">زیادکردنی ئەسیلەی نوێ</h2>
                      <button onClick={() => setIsAdminMode(false)} className="text-slate-400 hover:text-slate-600 font-bold">داخستن</button>
                    </div>
                    <form onSubmit={handleAddExam} className="space-y-4">
                      <div>
                        <label className="block text-sm font-bold text-slate-500 mb-2">تێپەڕەوشەی ئەدمین (پارێزراوی)</label>
                        <input 
                          type="password"
                          required
                          className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                          placeholder="کۆدی ئەدمین بنووسە"
                          value={adminPassword}
                          onChange={e => setAdminPassword(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-500 mb-2">ناوی ئەسیلە</label>
                        <input 
                          required
                          className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                          placeholder="بۆ نموونە: بیرکاری پۆلی ١٢ - ٢٠٢٤"
                          value={newExam.title}
                          onChange={e => setNewExam({...newExam, title: e.target.value})}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-bold text-slate-500 mb-2">وانە</label>
                          <input 
                            required
                            className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none"
                            placeholder="بیرکاری"
                            value={newExam.subject}
                            onChange={e => setNewExam({...newExam, subject: e.target.value})}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-slate-500 mb-2">پۆل</label>
                          <select 
                            className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none"
                            value={newExam.grade}
                            onChange={e => setNewExam({...newExam, grade: e.target.value})}
                          >
                            <option value="١٢">١٢</option>
                            <option value="١١">١١</option>
                            <option value="١٠">١٠</option>
                            <option value="٩">٩</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-500 mb-2">لینکی PDF یان وێنە</label>
                        <input 
                          required
                          className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none"
                          placeholder="https://t.me/..."
                          value={newExam.url}
                          onChange={e => setNewExam({...newExam, url: e.target.value})}
                        />
                      </div>
                      <button className="w-full py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-[0.98]">
                        پاشەکەوت بکە
                      </button>
                    </form>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Header ... */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-4 py-4 sm:px-6">
              <div className="max-w-4xl mx-auto flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
                    <BookOpen className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h1 className="text-lg font-black text-slate-800">بۆتی ئەسیلە</h1>
                    <div className="flex items-center gap-1 text-[10px] text-green-600 font-bold">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                      ئۆنلاین
                    </div>
                  </div>
                </div>
                <div 
                  onClick={() => setIsAdminMode(true)}
                  className="bg-slate-100 p-2 rounded-xl text-slate-500 cursor-pointer hover:bg-slate-200"
                >
                  <Bell className="w-5 h-5" />
                </div>
              </div>
            </header>

            {/* Main Content ... */}
            <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 pb-24">
              <div className="mb-8">
                <h2 className="text-xl font-black text-slate-800 mb-4 flex items-center gap-2">
                  <GraduationCap className="text-indigo-600" />
                  دواین ئەسیلەکان
                </h2>
                
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide no-scrollbar">
                  {["all", "١٢", "١١", "١٠", "٩"].map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`whitespace-nowrap px-6 py-2 rounded-2xl font-bold transition-all ${
                        activeTab === tab 
                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" 
                        : "bg-white text-slate-500 hover:bg-slate-100 border border-slate-100"
                      }`}
                    >
                      {tab === "all" ? "هەمووی" : `پۆلی ${tab}`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Exam Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {exams.filter(e => activeTab === "all" || e.grade === activeTab).map(exam => (
                  <motion.div
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={exam.id}
                    className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow group flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className={`p-2 rounded-xl ${exam.type === 'pdf' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                          {exam.type === 'pdf' ? <FileText size={20} /> : <ImageIcon size={20} />}
                        </div>
                        <span className="text-xs font-bold text-slate-400">پۆلی {exam.grade}</span>
                      </div>
                      <h3 className="font-bold text-slate-800 mb-1">{exam.title}</h3>
                      <p className="text-sm text-slate-500 mb-4">وانەی {exam.subject}</p>
                    </div>
                    
                    <div className="flex gap-2">
                      <a
                        href={exam.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 py-3 bg-slate-50 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 font-bold rounded-2xl transition-colors flex items-center justify-center gap-2"
                      >
                        <Download size={18} />
                        دابەزاندن
                      </a>
                      {isAdminMode && (
                        <button 
                          onClick={() => handleDeleteExam(exam.id)}
                          className="p-3 bg-red-50 text-red-500 hover:bg-red-100 rounded-2xl transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>

              {exams.filter(e => activeTab === "all" || e.grade === activeTab).length === 0 && (
                <div className="text-center py-20">
                  <p className="text-slate-400 font-bold">هیچ ئەسیلەیەک نەدۆزرایەوە بۆ ئەم پۆلە</p>
                </div>
              )}
            </main>

            {/* Bottom Nav */}
            <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md bg-white/80 backdrop-blur-xl border border-white/50 shadow-2xl rounded-3xl px-8 py-3 z-40 flex items-center justify-between">
              <button 
                onClick={() => { setIsAdminMode(false); setShowAbout(false); }}
                className={`flex flex-col items-center gap-1 transition-all ${(!isAdminMode && !showAbout) ? 'text-indigo-600' : 'opacity-50'}`}
              >
                <BookOpen size={20} />
                <span className="text-[10px] font-bold mt-1">ئەسیلەکان</span>
              </button>
              
              <button 
                onClick={() => { setShowAbout(true); setIsAdminMode(false); }}
                className={`flex flex-col items-center gap-1 transition-all ${showAbout ? 'text-indigo-600' : 'opacity-50'}`}
              >
                <Info size={20} />
                <span className="text-[10px] font-bold mt-1">دەربارە</span>
              </button>

              <button 
                onClick={() => { setIsAdminMode(true); setShowAbout(false); }}
                className={`flex flex-col items-center gap-1 transition-all ${isAdminMode ? 'text-indigo-600' : 'opacity-50'}`}
              >
                <ShieldCheck size={20} />
                <span className="text-[10px] font-bold mt-1">بەڕێوەبردن</span>
              </button>

              <button 
                onClick={() => {
                  localStorage.removeItem("joined_channels");
                  window.location.reload();
                }}
                className="flex flex-col items-center gap-1 opacity-50 hover:opacity-100 transition-all"
              >
                <ExternalLink size={20} />
                <span className="text-[10px] font-bold mt-1">باری چوونەدەر</span>
              </button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
