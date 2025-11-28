import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Upload, FileText, Copy, Trash2, Lock, CheckCircle, AlertCircle, LogOut, Activity, Loader2, Zap, Shield, ArrowRight, History, Calendar, ChevronRight, Clock, ArrowLeft, Stethoscope, Sparkles } from 'lucide-react';

// Types
enum AppView {
  LANDING = 'LANDING',
  AUTH = 'AUTH',
  REGISTER = 'REGISTER',
  INPUT = 'INPUT',
  RECORDING = 'RECORDING',
  PROCESSING = 'PROCESSING',
  RESULT = 'RESULT',
  HISTORY = 'HISTORY',
  HISTORY_DETAILS = 'HISTORY_DETAILS'
}

interface SoapNote {
  id?: string;
  timestamp?: number;
  patientId: string;
  date: string;
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
}

// Utilities
const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

// Button Component
const Button: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'outline' | 'danger';
  className?: string;
  disabled?: boolean;
}> = ({ children, onClick, variant = 'primary', className = '', disabled = false }) => {
  const baseClasses = "px-6 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center";
  const variants = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white",
    outline: "bg-white border-2 border-slate-200 hover:border-blue-600 text-slate-700 hover:text-blue-600",
    danger: "bg-red-600 hover:bg-red-700 text-white"
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variants[variant]} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {children}
    </button>
  );
};

// Visualizer Component
const Visualizer: React.FC<{ isRecording: boolean; audioStream: MediaStream | null }> = ({ isRecording, audioStream }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    if (!isRecording || !audioStream || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const analyser = audioContext.createAnalyser();
    const source = audioContext.createMediaStreamSource(audioStream);
    source.connect(analyser);
    analyser.fftSize = 256;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      ctx.fillStyle = 'rgb(248, 250, 252)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 2.5;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height * 0.8;
        
        const gradient = ctx.createLinearGradient(0, canvas.height - barHeight, 0, canvas.height);
        gradient.addColorStop(0, 'rgb(239, 68, 68)');
        gradient.addColorStop(1, 'rgb(244, 114, 182)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        x += barWidth + 1;
      }
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      audioContext.close();
    };
  }, [isRecording, audioStream]);

  return (
    <canvas
      ref={canvasRef}
      width={600}
      height={200}
      className="w-full max-w-2xl rounded-2xl shadow-lg"
    />
  );
};

// Mock API Service
const generateClinicalNote = async (audioBlob: Blob, patientId: string): Promise<SoapNote> => {
  await new Promise(resolve => setTimeout(resolve, 3000));

  return {
    patientId,
    date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    subjective: "Patient reports feeling anxious about upcoming work presentation. States difficulty sleeping for past 3 nights, averaging 4-5 hours per night. Denies changes in appetite. Reports tension in shoulders and neck.",
    objective: "Patient appears mildly anxious during session. Appropriate eye contact maintained. Speech rate slightly increased. Affect congruent with mood. No signs of acute distress.",
    assessment: "Adjustment disorder with anxiety, related to situational stressor (work presentation). Sleep disruption secondary to anxiety. Patient demonstrates good insight and motivation for treatment.",
    plan: "Continue weekly therapy sessions focusing on CBT techniques for anxiety management. Teach progressive muscle relaxation exercises. Patient to practice deep breathing 2x daily. Follow-up in 1 week to reassess sleep patterns and anxiety levels."
  };
};

// Main App Component
const App: React.FC = () => {
  const [view, setView] = useState<AppView>(AppView.LANDING);
  const [patientId, setPatientId] = useState('');
  const [recordingTime, setRecordingTime] = useState(0);
  const [isCopied, setIsCopied] = useState(false);
  const [noteContent, setNoteContent] = useState<SoapNote | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<SoapNote[]>([]);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const handleLogin = () => {
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
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        
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

  const renderLanding = () => (
    <div className="min-h-screen font-sans text-slate-800 bg-slate-50 overflow-x-hidden">
      <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 z-0"></div>

      <header className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 h-24 flex items-center justify-between">
        <div className="flex items-center gap-3">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-2.5 rounded-xl shadow-lg">
              <Activity className="w-6 h-6 text-blue-300" />
            </div>
            <span className="font-bold text-2xl text-white tracking-tight">EasyTheraNotes</span>
        </div>
        <div className="flex items-center gap-4">
             <button onClick={() => setView(AppView.AUTH)} className="text-sm font-medium text-blue-100 hover:text-white transition">
                Sign In
             </button>
             <button onClick={() => setView(AppView.AUTH)} className="bg-white text-blue-900 hover:bg-blue-50 px-6 py-2.5 rounded-full font-semibold text-sm transition-all shadow-lg">
                Start Free Trial
             </button>
        </div>
      </header>

      <section className="relative z-10 pt-20 pb-32 px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-blue-800/50 backdrop-blur-sm border border-blue-700/50 px-4 py-1.5 rounded-full text-blue-200 text-xs font-semibold uppercase tracking-wider mb-8">
                <Sparkles className="w-3 h-3 text-blue-300" />
                <span>Next Gen Clinical Intelligence</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight mb-6 leading-tight">
                Clinical Notes, <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-indigo-200">Reimagined.</span>
            </h1>
            <p className="text-xl text-blue-100/70 max-w-2xl mx-auto mb-10 leading-relaxed">
                Turn patient conversations into structured, professional SOAP notes instantly. 
            </p>
            <button onClick={() => setView(AppView.AUTH)} className="px-8 py-4 bg-blue-500 hover:bg-blue-400 text-white rounded-xl font-semibold text-lg shadow-lg transition-all inline-flex items-center gap-2 group">
                Launch Workspace
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
        </div>
      </section>

      <section className="py-20 px-6 lg:px-8 max-w-7xl mx-auto">
         <div className="grid md:grid-cols-3 gap-8">
             {[
                 { icon: <Zap className="w-6 h-6 text-white" />, color: "bg-blue-600", title: "Instant Transcription", desc: "Medical speech-to-text with 99.8% accuracy." },
                 { icon: <FileText className="w-6 h-6 text-white" />, color: "bg-indigo-600", title: "Auto-Structured SOAP", desc: "Intelligent SOAP note formatting." },
                 { icon: <Shield className="w-6 h-6 text-white" />, color: "bg-slate-800", title: "Zero-Retention Privacy", desc: "HIPAA-compliant processing." }
             ].map((feature, i) => (
                 <div key={i} className="bg-white p-8 rounded-3xl shadow-lg">
                     <div className={`w-14 h-14 ${feature.color} rounded-2xl flex items-center justify-center mb-6`}>
                         {feature.icon}
                     </div>
                     <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                     <p className="text-slate-500">{feature.desc}</p>
                 </div>
             ))}
         </div>
      </section>
    </div>
  );

  const handleRegister = () => {
    alert('Account created successfully!');
    setView(AppView.AUTH);
  };

  const renderRegister = () => (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white p-10 rounded-3xl shadow-xl">
        <h1 className="text-2xl font-bold text-center mb-8">Create Account</h1>
        <div className="space-y-4">
          <input type="text" placeholder="Username" className="w-full px-4 py-3 border rounded-xl" />
          <input type="email" placeholder="Email" className="w-full px-4 py-3 border rounded-xl" />
          <input type="password" placeholder="Password" className="w-full px-4 py-3 border rounded-xl" />
          <Button onClick={handleRegister} className="w-full">Create Account</Button>
        </div>
        <button onClick={() => setView(AppView.AUTH)} className="w-full mt-4 text-blue-600">Sign In</button>
      </div>
    </div>
  );

  const renderAuth = () => (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white p-10 rounded-3xl shadow-xl">
        <div className="flex justify-center mb-8">
          <div className="p-4 bg-blue-600 rounded-2xl">
            <Lock className="w-8 h-8 text-white" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-center mb-8">Secure Portal</h1>
        <div className="space-y-4">
          <input type="text" placeholder="Provider ID" defaultValue="dr.smith" className="w-full px-4 py-3 border rounded-xl" />
          <input type="password" placeholder="Password" defaultValue="password" className="w-full px-4 py-3 border rounded-xl" />
          <Button onClick={handleLogin} className="w-full">Access Workspace</Button>
        </div>
        <button onClick={() => setView(AppView.REGISTER)} className="w-full mt-4 text-blue-600">Sign Up</button>
        <button onClick={() => setView(AppView.LANDING)} className="w-full mt-4 text-slate-500">← Return to Homepage</button>
      </div>
    </div>
  );

  const renderHistory = () => (
    <div className="space-y-6">
        <h2 className="text-2xl font-bold">Session History</h2>
        {history.length === 0 ? (
            <div className="bg-white rounded-2xl p-16 text-center">
                <History className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-bold mb-2">No Session History</h3>
                <Button onClick={() => handleTabChange(AppView.INPUT)} variant="outline">Start New Session</Button>
            </div>
        ) : (
            <div className="space-y-4">
                {history.map((note) => (
                    <div key={note.id} onClick={() => handleViewHistoryItem(note)} className="bg-white p-6 rounded-2xl border cursor-pointer hover:shadow-lg transition">
                        <h3 className="font-bold text-lg">{note.patientId}</h3>
                        <p className="text-sm text-slate-500">{note.date}</p>
                        <p className="text-sm text-slate-600 mt-2 line-clamp-2">{note.subjective}</p>
                    </div>
                ))}
            </div>
        )}
    </div>
  );

  const renderResult = (isHistoryView: boolean) => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        {isHistoryView && (
          <button onClick={() => setView(AppView.HISTORY)} className="p-2 hover:bg-slate-100 rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        <h2 className="text-xl font-bold flex items-center gap-2">
          <FileText className="w-6 h-6 text-blue-600" />
          {isHistoryView ? 'Archived Note' : 'Generated Note'}
        </h2>
      </div>

      <div className="bg-white rounded-xl shadow-lg border overflow-hidden">
        {noteContent && (
            <div className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-4 border-b pb-6">
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase">Patient ID</span>
                    <p className="font-mono text-xl font-semibold">{noteContent.patientId}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-400 uppercase">Date</span>
                    <p className="font-mono font-medium">{noteContent.date}</p>
                  </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <h3 className="text-sm font-bold uppercase mb-2">Subjective</h3>
                        <p className="text-slate-600 bg-slate-50 p-4 rounded-lg">{noteContent.subjective}</p>
                    </div>
                    <div>
                        <h3 className="text-sm font-bold uppercase mb-2">Objective</h3>
                        <p className="text-slate-600 bg-slate-50 p-4 rounded-lg">{noteContent.objective}</p>
                    </div>
                    <div>
                        <h3 className="text-sm font-bold uppercase mb-2">Assessment</h3>
                        <p className="text-slate-600 bg-slate-50 p-4 rounded-lg">{noteContent.assessment}</p>
                    </div>
                    <div>
                        <h3 className="text-sm font-bold uppercase mb-2">Plan</h3>
                        <p className="text-slate-600 bg-slate-50 p-4 rounded-lg">{noteContent.plan}</p>
                    </div>
                </div>
            </div>
        )}
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Button onClick={handleCopy} className="gap-2">
          {isCopied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {isCopied ? "Copied!" : "Copy Note"}
        </Button>
        {!isHistoryView && (
          <Button onClick={handleReset} variant="outline" className="gap-2">
            <Trash2 className="w-4 h-4" />
            New Session
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
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setView(AppView.LANDING)}>
            <div className="bg-blue-600 p-2 rounded-xl">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl">EasyTheraNotes</span>
          </div>
          <button onClick={() => setView(AppView.AUTH)} className="p-2 hover:bg-slate-100 rounded-lg">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8">
        <div className="flex p-1.5 bg-slate-200 rounded-xl mb-8">
            <button 
                onClick={() => handleTabChange(AppView.INPUT)}
                disabled={isTabNavDisabled}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg transition ${
                    isInputActive ? 'bg-white text-blue-700 shadow' : 'text-slate-500'
                } ${isTabNavDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                <Mic className="w-4 h-4" />
                Active Session
            </button>
            <button 
                onClick={() => handleTabChange(AppView.HISTORY)}
                disabled={isTabNavDisabled}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg transition ${
                    isHistoryActive ? 'bg-white text-blue-700 shadow' : 'text-slate-500'
                } ${isTabNavDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                <History className="w-4 h-4" />
                History
            </button>
        </div>

        {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700">
                <AlertCircle className="w-5 h-5" />
                <span>{error}</span>
            </div>
        )}

        {view === AppView.INPUT && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6 text-white">
                    <h2 className="text-2xl font-bold mb-2">New Session</h2>
                    <p className="text-blue-100 text-sm">Configure your session details below.</p>
                </div>
                
                <div className="p-8">
                    <label className="block text-sm font-bold text-slate-700 mb-3 uppercase">Patient Identifier</label>
                    <input 
                      type="text" 
                      value={patientId}
                      onChange={(e) => setPatientId(e.target.value)}
                      placeholder="e.g. PT-2024-8842"
                      className="w-full px-4 py-4 text-lg bg-slate-50 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none mb-8"
                    />

                    <div className="grid md:grid-cols-2 gap-5">
                        <button 
                          onClick={handleStartRecording}
                          className="flex flex-col items-center gap-4 p-8 rounded-2xl border-2 bg-blue-50 hover:bg-blue-100 transition"
                        >
                          <div className="p-5 bg-white rounded-2xl shadow">
                              <Mic className="w-8 h-8 text-blue-600" />
                          </div>
                          <div className="text-center">
                              <span className="block font-bold text-lg">Start Recording</span>
                              <span className="text-xs text-slate-500">Use microphone</span>
                          </div>
                        </button>

                        <label className="flex flex-col items-center gap-4 p-8 rounded-2xl border-2 border-dashed hover:bg-slate-50 transition cursor-pointer">
                          <input type="file" accept="audio/*" onChange={handleFileUpload} className="hidden" />
                          <div className="p-5 bg-slate-50 rounded-2xl">
                              <Upload className="w-8 h-8 text-slate-400" />
                          </div>
                          <div className="text-center">
                              <span className="block font-bold text-lg">Upload Audio</span>
                              <span className="text-xs text-slate-500">MP3, WAV, M4A</span>
                          </div>
                        </label>
                    </div>
                </div>
            </div>
          </div>
        )}

        {view === AppView.RECORDING && (
          <div className="flex flex-col items-center py-16 space-y-10">
            <Visualizer isRecording={true} audioStream={streamRef.current} />
            <div className="text-center space-y-3">
              <div className="text-6xl font-mono font-bold">{formatTime(recordingTime)}</div>
              <p className="text-slate-400">Session ID: {patientId}</p>
            </div>
            <Button onClick={handleStopRecording} variant="danger" className="w-56 py-4 gap-2">
              <Square className="w-5 h-5 fill-current" /> End Session
            </Button>
          </div>
        )}

        {view === AppView.PROCESSING && (
          <div className="flex flex-col items-center py-24 space-y-8">
             <div className="bg-white p-6 rounded-full shadow-xl">
                <Loader2 className="w-16 h-16 text-blue-600 animate-spin" />
             </div>
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-2">Processing Audio</h3>
              <p className="text-slate-500">Connecting to Clinical AI Engine...</p>
            </div>
          </div>
        )}

        {view === AppView.RESULT && renderResult(false)}
        {view === AppView.HISTORY && renderHistory()}
        {view === AppView.HISTORY_DETAILS && renderResult(true)}
      </main>
    </div>
  );
};

export default App;
