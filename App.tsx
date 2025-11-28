
import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Upload, FileText, Copy, Trash2, Lock, CheckCircle, AlertCircle, LogOut, Activity, Loader2, Brain, Zap, Shield, ArrowRight, History, Calendar, ChevronRight, Clock, ArrowLeft, Stethoscope, Sparkles } from 'lucide-react';
import { AppView, SoapNote } from './types';
import { generateClinicalNote } from './services/geminiService';
import { formatTime } from './services/audioUtils';
import Button from './components/Button';
import Visualizer from './components/Visualizer';

const App: React.FC = () => {
  // State
  const [view, setView] = useState<AppView>(AppView.LANDING);
  const [patientId, setPatientId] = useState('');
  const [recordingTime, setRecordingTime] = useState(0);
  const [isCopied, setIsCopied] = useState(false);
  const [noteContent, setNoteContent] = useState<SoapNote | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // History State
  const [history, setHistory] = useState<SoapNote[]>([]);

  // Recording Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // --- Handlers ---

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setView(AppView.INPUT);
  };

  const handleStartRecording = async () => {
    if (!patientId.trim()) {
      setError("Please enter a Patient ID first.");
      return;
    }
    setError(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start();
      setView(AppView.RECORDING);
      
      // Timer
      setRecordingTime(0);
      timerRef.current = window.setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (err) {
      console.error(err);
      setError("Microphone access denied or not available.");
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/mp3' }); // Basic mime fallback
        
        // Stop all tracks
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
        }
        
        if (timerRef.current) clearInterval(timerRef.current);
        
        await processAudio(audioBlob);
      };
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!patientId.trim()) {
        setError("Please enter a Patient ID before uploading.");
        return;
    }

    await processAudio(file);
  };

  const processAudio = async (blob: Blob) => {
    setView(AppView.PROCESSING);
    setError(null);
    
    try {
      const note = await generateClinicalNote(blob, patientId);
      
      // Enhance note with ID and Timestamp for history
      const completeNote: SoapNote = {
        ...note,
        id: crypto.randomUUID(),
        timestamp: Date.now()
      };

      setNoteContent(completeNote);
      setHistory(prev => [completeNote, ...prev]);
      setView(AppView.RESULT);
    } catch (err: any) {
      setError(err.message || "Failed to process audio.");
      setView(AppView.INPUT);
    }
  };

  const handleCopy = () => {
    if (!noteContent) return;
    
    const text = `
PATIENT ID: ${noteContent.patientId}
DATE: ${noteContent.date}

S: ${noteContent.subjective}
O: ${noteContent.objective}
A: ${noteContent.assessment}
P: ${noteContent.plan}
    `.trim();

    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleReset = () => {
    setPatientId('');
    setNoteContent(null);
    setRecordingTime(0);
    setError(null);
    setIsCopied(false);
    audioChunksRef.current = [];
    setView(AppView.INPUT);
  };

  const handleTabChange = (newView: AppView) => {
    if (view === AppView.RECORDING || view === AppView.PROCESSING) return;
    if (newView === AppView.INPUT) {
        handleReset();
    } else {
        setView(newView);
    }
  };

  const handleViewHistoryItem = (note: SoapNote) => {
    setNoteContent(note);
    setView(AppView.HISTORY_DETAILS);
  };

  // --- Render Functions ---

  const renderLanding = () => (
    <div className="min-h-screen font-sans text-slate-800 bg-slate-50 overflow-x-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 clip-path-slant z-0"></div>
      <div className="absolute top-0 right-0 w-1/2 h-[600px] bg-blue-500/10 rounded-bl-[100px] z-0 pointer-events-none blur-3xl"></div>

      {/* Landing Header */}
      <header className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 h-24 flex items-center justify-between">
        <div className="flex items-center gap-3">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-2.5 rounded-xl shadow-lg">
              <Activity className="w-6 h-6 text-blue-300" />
            </div>
            <span className="font-bold text-2xl text-white tracking-tight">EasyTheraNotes</span>
        </div>
        <nav className="hidden md:flex gap-10 text-sm font-medium text-blue-100/80">
            <button className="hover:text-white transition duration-300">Solutions</button>
            <button className="hover:text-white transition duration-300">Security</button>
            <button className="hover:text-white transition duration-300">Pricing</button>
        </nav>
        <div className="flex items-center gap-4">
             <button onClick={() => setView(AppView.AUTH)} className="text-sm font-medium text-blue-100 hover:text-white transition">
                Sign In
             </button>
             <button onClick={() => setView(AppView.AUTH)} className="bg-white text-blue-900 hover:bg-blue-50 px-6 py-2.5 rounded-full font-semibold text-sm transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5">
                Start Free Trial
             </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 pt-20 pb-32 px-6 lg:px-8 max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12">
        <div className="flex-1 text-left">
            <div className="inline-flex items-center gap-2 bg-blue-800/50 backdrop-blur-sm border border-blue-700/50 px-4 py-1.5 rounded-full text-blue-200 text-xs font-semibold uppercase tracking-wider mb-8">
                <Sparkles className="w-3 h-3 text-blue-300" />
                <span>Next Gen Clinical Intelligence</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight mb-6 leading-[1.1]">
                Clinical Notes, <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-indigo-200">Reimagined.</span>
            </h1>
            <p className="text-xl text-blue-100/70 max-w-xl mb-10 leading-relaxed font-light">
                Turn patient conversations into structured, professional SOAP notes instantly. 
                Experience the power of advanced neural audio processing with zero data retention.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
                <button onClick={() => setView(AppView.AUTH)} className="px-8 py-4 bg-blue-500 hover:bg-blue-400 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-blue-500/30 transition-all flex items-center justify-center gap-2 group">
                    Launch Workspace
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button onClick={() => setView(AppView.AUTH)} className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl font-semibold text-lg backdrop-blur-sm transition-all">
                    Watch Demo
                </button>
            </div>
        </div>
        
        {/* Abstract Hero Visual */}
        <div className="flex-1 relative w-full max-w-lg lg:max-w-xl">
             <div className="absolute inset-0 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-3xl blur-2xl opacity-30 animate-pulse"></div>
             <div className="relative bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
                 <div className="flex items-center gap-4 mb-6 border-b border-white/10 pb-6">
                     <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white">
                         <Mic className="w-6 h-6" />
                     </div>
                     <div>
                         <div className="h-2 w-24 bg-white/20 rounded mb-2"></div>
                         <div className="h-2 w-16 bg-white/10 rounded"></div>
                     </div>
                     <div className="ml-auto text-xs text-green-400 font-mono flex items-center gap-1">
                         <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                         Recording
                     </div>
                 </div>
                 <div className="space-y-3">
                     {[1,2,3].map(i => (
                         <div key={i} className="flex gap-3 items-center opacity-40">
                             <div className="w-1 h-8 bg-blue-500/50 rounded-full"></div>
                             <div className="flex-1 h-2 bg-white/10 rounded"></div>
                             <div className="w-1/4 h-2 bg-white/5 rounded"></div>
                         </div>
                     ))}
                     <div className="flex gap-3 items-center">
                         <div className="w-1 h-12 bg-blue-400 rounded-full shadow-[0_0_15px_rgba(96,165,250,0.5)]"></div>
                         <div className="flex-1 space-y-2">
                            <div className="h-2.5 bg-white/90 rounded w-3/4"></div>
                            <div className="h-2.5 bg-white/60 rounded w-1/2"></div>
                         </div>
                     </div>
                 </div>
                 
                 <div className="mt-8 pt-6 border-t border-white/10">
                      <div className="flex justify-between items-center text-white/80 text-sm">
                          <span className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-indigo-400"/> AI Processing</span>
                          <span className="font-mono">00:01:23</span>
                      </div>
                 </div>
             </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-32 px-6 lg:px-8 max-w-7xl mx-auto">
         <div className="text-center mb-20">
             <h2 className="text-3xl font-bold text-slate-900 mb-4">Professional Grade Documentation</h2>
             <p className="text-slate-500 max-w-2xl mx-auto text-lg">Designed for modern healthcare providers who value accuracy, security, and efficiency.</p>
         </div>
         
         <div className="grid md:grid-cols-3 gap-8">
             {[
                 {
                     icon: <Zap className="w-6 h-6 text-white" />,
                     color: "bg-blue-600",
                     title: "Instant Transcription",
                     desc: "Proprietary medical speech-to-text engine captures complex terminology with 99.8% accuracy."
                 },
                 {
                     icon: <FileText className="w-6 h-6 text-white" />,
                     color: "bg-indigo-600",
                     title: "Auto-Structured SOAP",
                     desc: "Intelligent formatting automatically categorizes Subjective, Objective, Assessment, and Plan data."
                 },
                 {
                     icon: <Shield className="w-6 h-6 text-white" />,
                     color: "bg-slate-800",
                     title: "Zero-Retention Privacy",
                     desc: "HIPAA-compliant architecture ensures audio processing happens in volatile memory only."
                 }
             ].map((feature, i) => (
                 <div key={i} className="bg-white p-8 rounded-3xl shadow-lg shadow-slate-200/50 border border-slate-100 hover:-translate-y-1 transition duration-300">
                     <div className={`w-14 h-14 ${feature.color} rounded-2xl flex items-center justify-center mb-6 shadow-md`}>
                         {feature.icon}
                     </div>
                     <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                     <p className="text-slate-500 leading-relaxed">{feature.desc}</p>
                 </div>
             ))}
         </div>
      </section>
      
      {/* Pricing Section */}
      <section className="py-32 px-6 lg:px-8 max-w-7xl mx-auto">
         <div className="text-center mb-20">
             <h2 className="text-3xl font-bold text-slate-900 mb-4">Simple, Transparent Pricing</h2>
             <p className="text-slate-500 max-w-2xl mx-auto text-lg">Choose the plan that works best for your practice.</p>
         </div>
         
         <div className="max-w-md mx-auto">
             <div className="bg-white rounded-3xl shadow-xl border-2 border-blue-200 overflow-hidden hover:shadow-2xl transition-all duration-300">
                 <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6 text-white text-center">
                     <h3 className="text-2xl font-bold mb-2">Professional Plan</h3>
                     <p className="text-blue-100 text-sm">Everything you need for clinical documentation</p>
                 </div>
                 <div className="p-8 text-center">
                     <div className="mb-6">
                         <span className="text-5xl font-bold text-slate-900">$40</span>
                         <span className="text-slate-500 text-lg ml-2">/month</span>
                     </div>
                     <ul className="space-y-4 mb-8 text-left">
                         <li className="flex items-center gap-3 text-slate-700">
                             <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                             <span>Unlimited audio transcription</span>
                         </li>
                         <li className="flex items-center gap-3 text-slate-700">
                             <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                             <span>Automatic SOAP note generation</span>
                         </li>
                         <li className="flex items-center gap-3 text-slate-700">
                             <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                             <span>Complete session history</span>
                         </li>
                         <li className="flex items-center gap-3 text-slate-700">
                             <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                             <span>Guaranteed HIPAA compliance</span>
                         </li>
                     </ul>
                     <button onClick={() => setView(AppView.AUTH)} className="w-full px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-blue-500/30 transition-all">
                         Start Now
                     </button>
                 </div>
             </div>
         </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 pt-16 pb-8 px-6">
         <div className="max-w-7xl mx-auto flex flex-col items-center">
             <div className="flex items-center gap-2 mb-6">
                <div className="bg-blue-600 p-1.5 rounded-lg">
                    <Activity className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-lg text-slate-900">EasyTheraNotes</span>
             </div>
             <div className="flex gap-8 text-sm text-slate-500 mb-8">
                 <a href="#" className="hover:text-blue-600">Privacy Policy</a>
                 <a href="#" className="hover:text-blue-600">Terms of Service</a>
                 <a href="#" className="hover:text-blue-600">Contact Support</a>
             </div>
             <p className="text-slate-400 text-sm">© 2024 EasyTheraNotes. Professional Medical Demo.</p>
         </div>
      </footer>
    </div>
  );

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const username = formData.get('username') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const passwordConfirm = formData.get('passwordConfirm') as string;
    
    // Validate passwords match
    if (password !== passwordConfirm) {
      alert('Passwords do not match. Please try again.');
      return;
    }
    
    // Here you would typically send this data to a backend
    console.log('Registration data:', { username, email, password });
    alert('Account created successfully! Please sign in.');
    setView(AppView.AUTH);
  };

  const renderRegister = () => (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 font-sans text-slate-800 animate-[fadeIn_0.5s]">
      <div className="w-full max-w-md bg-white p-10 rounded-3xl shadow-xl border border-slate-100">
        <div className="flex justify-center mb-8">
          <div className="p-4 bg-blue-600 rounded-2xl shadow-lg shadow-blue-200">
            <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="8.5" cy="7" r="4"/>
              <path d="M20 8v6M23 11h-6"/>
            </svg>
          </div>
        </div>
        <h1 className="text-2xl font-bold text-center text-slate-900 mb-2">Create Account</h1>
        <p className="text-center text-slate-500 mb-8">Register for a new account</p>
        
        <form onSubmit={handleRegister} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Username</label>
            <input 
              type="text" 
              name="username"
              className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition font-medium" 
              placeholder="Enter your username" 
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Email</label>
            <input 
              type="email" 
              name="email"
              className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition font-medium" 
              placeholder="Enter your email" 
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
            <input 
              type="password" 
              name="password"
              className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition font-medium" 
              placeholder="Create a password" 
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Confirm Password</label>
            <input 
              type="password" 
              name="passwordConfirm"
              className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition font-medium" 
              placeholder="Confirm your password" 
              required
            />
          </div>
          <Button className="w-full py-4 rounded-xl text-base shadow-lg shadow-blue-500/20">Create Account</Button>
        </form>
        <div className="mt-6 text-center">
          <p className="text-sm text-slate-500">
            Already have an account?{' '}
            <button onClick={() => setView(AppView.AUTH)} className="text-blue-600 font-semibold hover:text-blue-700 underline">
              Sign In
            </button>
          </p>
        </div>
        <div className="mt-8 flex items-center justify-center gap-2 text-xs text-slate-400 font-medium bg-slate-50 py-2 rounded-lg">
          <Lock className="w-3 h-3" />
          <span>256-bit End-to-End Encryption</span>
        </div>
        <div className="mt-8 text-center">
             <button onClick={() => setView(AppView.LANDING)} className="text-sm font-medium text-slate-500 hover:text-slate-900">
                ← Return to Homepage
             </button>
        </div>
      </div>
    </div>
  );

  const renderAuth = () => (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 font-sans text-slate-800 animate-[fadeIn_0.5s]">
      <div className="w-full max-w-md bg-white p-10 rounded-3xl shadow-xl border border-slate-100">
        <div className="flex justify-center mb-8">
          <div className="p-4 bg-blue-600 rounded-2xl shadow-lg shadow-blue-200">
            <Lock className="w-8 h-8 text-white" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-center text-slate-900 mb-2">Secure Portal</h1>
        <p className="text-center text-slate-500 mb-8">Provider Authentication</p>
        
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Provider ID</label>
            <input 
              type="text" 
              className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition font-medium" 
              placeholder="dr.example" 
              defaultValue="dr.smith"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
            <input 
              type="password" 
              className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition font-medium" 
              placeholder="••••••••" 
              defaultValue="password"
            />
          </div>
          <Button className="w-full py-4 rounded-xl text-base shadow-lg shadow-blue-500/20">Access Workspace</Button>
        </form>
        <div className="mt-6 text-center">
          <p className="text-sm text-slate-500">
            Don't have an account?{' '}
            <button onClick={() => setView(AppView.REGISTER)} className="text-blue-600 font-semibold hover:text-blue-700 underline">
              Sign Up
            </button>
          </p>
        </div>
        <div className="mt-8 flex items-center justify-center gap-2 text-xs text-slate-400 font-medium bg-slate-50 py-2 rounded-lg">
          <Lock className="w-3 h-3" />
          <span>256-bit End-to-End Encryption</span>
        </div>
        <div className="mt-8 text-center">
             <button onClick={() => setView(AppView.LANDING)} className="text-sm font-medium text-slate-500 hover:text-slate-900">
                ← Return to Homepage
             </button>
        </div>
      </div>
    </div>
  );

  const renderHistory = () => (
    <div className="space-y-6 animate-[fadeIn_0.5s_ease-out]">
        <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Session History</h2>
            <span className="text-xs font-semibold text-slate-500 bg-white border border-slate-200 px-3 py-1 rounded-full shadow-sm">{history.length} Records</span>
        </div>
        
        {history.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-16 text-center">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <History className="w-10 h-10 text-slate-300" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">No Session History</h3>
                <p className="text-slate-500 mb-8 max-w-xs mx-auto">Your secure session records will appear here after your first completed recording.</p>
                <Button onClick={() => handleTabChange(AppView.INPUT)} variant="outline">Start New Session</Button>
            </div>
        ) : (
            <div className="grid gap-4">
                {history.map((note) => (
                    <div key={note.id} onClick={() => handleViewHistoryItem(note)} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg hover:border-blue-200 transition-all cursor-pointer group">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                                    {note.patientId}
                                    <span className="bg-blue-50 text-blue-600 text-[10px] uppercase tracking-wider px-2 py-1 rounded-full font-bold border border-blue-100">SOAP</span>
                                </h3>
                                <div className="flex items-center gap-4 text-sm text-slate-500 mt-2">
                                    <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-slate-400" /> {note.date}</span>
                                    {note.timestamp && (
                                        <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-slate-400" /> {new Date(note.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                    )}
                                </div>
                            </div>
                            <div className="bg-slate-50 p-2.5 rounded-full group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-white" />
                            </div>
                        </div>
                        <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-600 line-clamp-2 border border-slate-100 group-hover:bg-white group-hover:border-blue-100 transition-colors">
                            <span className="font-semibold text-slate-700">Subjective:</span> {note.subjective}
                        </div>
                    </div>
                ))}
            </div>
        )}
    </div>
  );

  const renderResult = (isHistoryView: boolean) => (
    <div className="space-y-6 animate-[slideInUp_0.5s_ease-out]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
             {isHistoryView && (
                 <button onClick={() => setView(AppView.HISTORY)} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition">
                     <ArrowLeft className="w-5 h-5" />
                 </button>
             )}
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-6 h-6 text-blue-600" />
            {isHistoryView ? 'Archived Note' : 'Generated Note'}
            </h2>
        </div>
        {!isHistoryView && (
            <span className="text-sm px-3 py-1 bg-green-100 text-green-700 rounded-full font-medium flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5" />
            Processing Complete
            </span>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex justify-between items-center">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
            <Stethoscope className="w-4 h-4" />
            Clinical Documentation
          </span>
          <span className="text-xs text-slate-400 font-medium">READ ONLY</span>
        </div>
        {noteContent && (
            <div className="p-8 space-y-8 text-slate-700 font-sans leading-relaxed">
                <div className="grid grid-cols-2 gap-4 border-b border-slate-100 pb-6">
                <div>
                    <span className="block text-xs font-bold text-slate-400 uppercase mb-1">Patient ID</span>
                    <span className="font-mono text-xl text-slate-900 font-semibold">{noteContent.patientId}</span>
                </div>
                <div className="text-right">
                    <span className="block text-xs font-bold text-slate-400 uppercase mb-1">Date of Service</span>
                    <span className="font-mono text-slate-900 font-medium">{noteContent.date}</span>
                </div>
                </div>

                <div className="grid gap-6">
                    <div className="relative">
                        <div className="absolute -left-4 top-1 bottom-1 w-1 bg-blue-200 rounded-full"></div>
                        <h3 className="text-sm font-bold text-slate-900 uppercase mb-2 pl-2">Subjective</h3>
                        <p className="text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-lg border border-slate-100">{noteContent.subjective}</p>
                    </div>
                    
                    <div className="relative">
                        <div className="absolute -left-4 top-1 bottom-1 w-1 bg-indigo-200 rounded-full"></div>
                        <h3 className="text-sm font-bold text-slate-900 uppercase mb-2 pl-2">Objective</h3>
                        <p className="text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-lg border border-slate-100">{noteContent.objective}</p>
                    </div>

                    <div className="relative">
                        <div className="absolute -left-4 top-1 bottom-1 w-1 bg-purple-200 rounded-full"></div>
                        <h3 className="text-sm font-bold text-slate-900 uppercase mb-2 pl-2">Assessment</h3>
                        <p className="text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-lg border border-slate-100">{noteContent.assessment}</p>
                    </div>

                    <div className="relative">
                        <div className="absolute -left-4 top-1 bottom-1 w-1 bg-green-200 rounded-full"></div>
                        <h3 className="text-sm font-bold text-slate-900 uppercase mb-2 pl-2">Plan</h3>
                        <p className="text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-lg border border-slate-100">{noteContent.plan}</p>
                    </div>
                </div>
            </div>
        )}
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Button onClick={handleCopy} className="gap-2 w-full shadow-lg shadow-blue-500/20">
          {isCopied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {isCopied ? "Copied to Clipboard" : "Copy Note Text"}
        </Button>

        {isHistoryView ? (
             <Button onClick={() => setView(AppView.HISTORY)} variant="outline" className="gap-2 w-full">
                Back to History List
             </Button>
        ) : (
             <Button onClick={handleReset} variant="outline" className="gap-2 w-full text-slate-600 hover:text-red-600 hover:border-red-200 hover:bg-red-50">
                <Trash2 className="w-4 h-4" />
                Discard & New Session
            </Button>
        )}
      </div>
    </div>
  );

  if (view === AppView.LANDING) return renderLanding();
  if (view === AppView.AUTH) return renderAuth();
  if (view === AppView.REGISTER) return renderRegister();

  const isTabNavDisabled = view === AppView.RECORDING || view === AppView.PROCESSING;
  const isInputActive = [AppView.INPUT, AppView.RECORDING, AppView.PROCESSING, AppView.RESULT].includes(view);
  const isHistoryActive = [AppView.HISTORY, AppView.HISTORY_DETAILS].includes(view);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-20">
      {/* App Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-4xl mx-auto px-6 h-18 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setView(AppView.LANDING)}>
            <div className="bg-blue-600 p-2 rounded-xl group-hover:bg-blue-700 transition">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-slate-900 tracking-tight">EasyTheraNotes</span>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-sm font-bold text-slate-800">Dr. Smith</span>
              <span className="text-[10px] uppercase font-bold text-green-600 flex items-center gap-1 bg-green-50 px-2 py-0.5 rounded-full border border-green-100">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                Connected
              </span>
            </div>
            <div className="h-8 w-[1px] bg-slate-200 hidden sm:block"></div>
            <button onClick={() => setView(AppView.AUTH)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 transition">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8">
        {/* Navigation Tabs */}
        <div className="flex p-1.5 bg-slate-200/60 rounded-xl mb-8 relative z-10 backdrop-blur-sm">
            <button 
                onClick={() => handleTabChange(AppView.INPUT)}
                disabled={isTabNavDisabled}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                    isInputActive 
                    ? 'bg-white text-blue-700 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                } ${isTabNavDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                <Mic className="w-4 h-4" />
                Active Session
            </button>
            <button 
                onClick={() => handleTabChange(AppView.HISTORY)}
                disabled={isTabNavDisabled}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                    isHistoryActive
                    ? 'bg-white text-blue-700 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                } ${isTabNavDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                <History className="w-4 h-4" />
                History Archive
            </button>
        </div>

        {/* Error Banner */}
        {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700 animate-pulse shadow-sm">
                <AlertCircle className="w-5 h-5" />
                <span className="font-medium">{error}</span>
            </div>
        )}

        {/* View: Dashboard / Input */}
        {view === AppView.INPUT && (
          <div className="space-y-6 animate-[fadeIn_0.5s_ease-out]">
            
            <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6 text-white">
                    <h2 className="text-2xl font-bold mb-2">New Session</h2>
                    <p className="text-blue-100 opacity-90 text-sm">Configure your session details below to begin documentation.</p>
                </div>
                
                <div className="p-8">
                    <label className="block text-sm font-bold text-slate-700 mb-3 uppercase tracking-wider">
                        Patient Identifier
                    </label>
                    <div className="relative mb-8">
                        <input 
                        type="text" 
                        value={patientId}
                        onChange={(e) => setPatientId(e.target.value)}
                        placeholder="e.g. PT-2024-8842"
                        className="w-full pl-12 pr-4 py-4 text-lg bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition font-medium text-slate-900 placeholder:text-slate-400"
                        />
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                             <div className="bg-slate-200 rounded-md p-1">
                                <Stethoscope className="w-4 h-4 text-slate-500" />
                             </div>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-5">
                        <button 
                        onClick={handleStartRecording}
                        className="relative overflow-hidden flex flex-col items-center justify-center gap-4 p-8 rounded-2xl border-2 border-blue-50 bg-blue-50/50 hover:bg-blue-50 hover:border-blue-300 transition-all duration-300 group text-center"
                        >
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="p-5 bg-white rounded-2xl shadow-sm group-hover:shadow-lg group-hover:scale-110 transition-all duration-300">
                            <Mic className="w-8 h-8 text-blue-600" />
                        </div>
                        <div>
                            <span className="block font-bold text-lg text-slate-800 mb-1">Start Recording</span>
                            <span className="text-xs text-slate-500">Use microphone</span>
                        </div>
                        </button>

                        <div className="relative overflow-hidden flex flex-col items-center justify-center gap-4 p-8 rounded-2xl border-2 border-dashed border-slate-200 bg-white hover:border-slate-400 hover:bg-slate-50 transition-all duration-300 group cursor-pointer text-center">
                        <input 
                            type="file" 
                            accept="audio/*"
                            onChange={handleFileUpload}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <div className="p-5 bg-slate-50 rounded-2xl shadow-sm group-hover:shadow-md group-hover:bg-white transition-all duration-300">
                            <Upload className="w-8 h-8 text-slate-400 group-hover:text-slate-600" />
                        </div>
                        <div>
                            <span className="block font-bold text-lg text-slate-800 mb-1">Upload Audio</span>
                            <span className="text-xs text-slate-500">MP3, WAV, M4A</span>
                        </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100 rounded-xl p-5 flex gap-4 shadow-sm">
              <div className="bg-amber-100 p-2 rounded-lg h-fit">
                 <Shield className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                  <h4 className="font-bold text-amber-800 text-sm mb-1">Privacy Protocol Active</h4>
                  <p className="text-sm text-amber-800/80 leading-relaxed">
                    Ensure no direct personal identifiers (names, specific addresses) are spoken. The AI is trained to structure clinical data while maintaining anonymity.
                  </p>
              </div>
            </div>
          </div>
        )}

        {/* View: Recording */}
        {view === AppView.RECORDING && (
          <div className="flex flex-col items-center justify-center py-16 space-y-10 animate-[zoomIn_0.3s_ease-out]">
            <div className="relative w-full max-w-lg flex justify-center">
                <Visualizer isRecording={true} audioStream={streamRef.current} />
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                     <div className="relative">
                        <div className="absolute -inset-8 bg-red-100/50 rounded-full animate-ping opacity-75"></div>
                        <div className="absolute -inset-4 bg-red-100 rounded-full animate-pulse opacity-100"></div>
                        <div className="relative bg-gradient-to-br from-red-500 to-pink-600 p-8 rounded-full shadow-2xl border-4 border-white">
                            <Mic className="w-12 h-12 text-white" />
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="text-center space-y-3 z-10">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-50 border border-red-100 text-red-600 text-xs font-bold uppercase tracking-widest animate-pulse">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                Recording In Progress
              </div>
              <div className="text-6xl font-mono font-bold text-slate-800 tabular-nums tracking-tight">
                {formatTime(recordingTime)}
              </div>
              <p className="text-slate-400 font-medium">Session ID: {patientId}</p>
            </div>

            <Button onClick={handleStopRecording} variant="danger" className="w-56 py-4 text-lg shadow-xl shadow-red-500/20 hover:shadow-red-500/30 transition-all rounded-xl gap-2 z-10">
              <Square className="w-5 h-5 fill-current" /> End Session
            </Button>
          </div>
        )}

        {/* View: Processing */}
        {view === AppView.PROCESSING && (
          <div className="flex flex-col items-center justify-center py-24 space-y-8 animate-[fadeIn_0.5s]">
             <div className="relative">
                <div className="absolute inset-0 bg-blue-100 rounded-full animate-ping opacity-50 duration-1000"></div>
                <div className="bg-white p-6 rounded-full shadow-xl border border-blue-50 relative z-10">
                    <Loader2 className="w-16 h-16 text-blue-600 animate-spin" />
                </div>
             </div>
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-bold text-slate-900">Processing Audio</h3>
              <p className="text-slate-500">Securely connecting to Clinical AI Engine...</p>
            </div>
            <div className="bg-white px-6 py-3 rounded-full border border-slate-200 shadow-sm flex items-center gap-3 text-xs font-bold text-slate-400 tracking-wider">
                <span className="text-blue-600">TRANSCRIBING</span>
                <ChevronRight className="w-3 h-3" />
                <span>ANALYZING</span>
                <ChevronRight className="w-3 h-3" />
                <span>STRUCTURING</span>
            </div>
          </div>
        )}

        {/* View: Result */}
        {view === AppView.RESULT && renderResult(false)}

        {/* View: History */}
        {view === AppView.HISTORY && renderHistory()}

        {/* View: History Details */}
        {view === AppView.HISTORY_DETAILS && renderResult(true)}

      </main>
    </div>
  );
};

export default App;