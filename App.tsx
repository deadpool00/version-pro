import React, { useState, useRef, useEffect } from 'react';


type MainView = "landing" | "auth" | "register" | "app";

const App: React.FC = () => {
  const [view, setView] = useState<MainView>("landing");

  if (view === "landing") {
    return <LandingView onGoToAuth={() => setView("auth")} />;
  }

  if (view === "auth") {
    return (
      <AuthView
        onBackToLanding={() => setView("landing")}
        onGoToRegister={() => setView("register")}
        onLogin={() => setView("app")}
      />
    );
  }

  if (view === "register") {
    return (
      <RegisterView
        onBackToLanding={() => setView("landing")}
        onGoToAuth={() => setView("auth")}
      />
    );
  }

  // view === "app"  → PÁGINA 3: #app-view
  return <AppView onLogout={() => setView("landing")} />;
};

export default App;

/* ───────────────────── Landing (página 1) ───────────────────── */

interface LandingProps {
  onGoToAuth: () => void;
}

const LandingView: React.FC<LandingProps> = ({ onGoToAuth }) => (
  <div id="landing-view" className="view active">
    <div className="landing-container">
      {/* Decorative background */}
      <div className="landing-bg-1" />
      <div className="landing-bg-2" />

      {/* Header */}
      <header className="landing-header">
        <div className="header-left">
          <div className="logo-icon">
            <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </div>
          <span className="logo-text">EasyTheraNotes</span>
        </div>
        <div className="header-right">
          <button className="btn-text" onClick={onGoToAuth}>
            Sign In
          </button>
          <button className="btn-primary-small" onClick={onGoToAuth}>
            Start Free Trial
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-badge-new">
            <svg className="icon-small" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
            <span>NEXT GEN CLINICAL INTELLIGENCE</span>
          </div>
          <h1 className="hero-title-clean">
            Clinical Notes,
          </h1>
          <p className="hero-description">
            Turn patient conversations into structured, professional SOAP notes instantly. Experience the power of advanced neural audio processing with zero data retention.
          </p>
          <div className="hero-buttons">
            <button className="btn-hero-primary" onClick={onGoToAuth}>
              Launch Workspace
              <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </section>

      {/* Professional Grade Documentation */}
      <section className="features-section">
        <div className="section-header">
          <h2>Professional Grade Documentation</h2>
          <p>Designed for modern healthcare providers who value accuracy, security, and efficiency.</p>
        </div>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon bg-blue">
              <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
            </div>
            <h3>Instant Transcription</h3>
            <p>
              Proprietary medical speech-to-text engine captures complex terminology with 99.8%
              accuracy.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon bg-indigo">
              <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
              </svg>
            </div>
            <h3>Auto-Structured SOAP</h3>
            <p>
              Intelligent formatting automatically categorizes Subjective, Objective, Assessment, and
              Plan data.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon bg-slate">
              <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <h3>Zero-Retention Privacy</h3>
            <p>
              HIPAA-compliant architecture ensures audio processing happens in volatile memory only.
            </p>
          </div>
        </div>
      </section>

      {/* HIPAA Security Section */}
      <section className="hipaa-section">
        <div className="hipaa-content">
          <div className="hipaa-text">
            <div className="section-badge">SECURITY</div>
            <h2>Built for HIPAA Compliance</h2>
            <p className="hipaa-description">
              Your patients' privacy is our top priority. EasyTheraNotes exceeds industry standards for healthcare data protection.
            </p>
            <div className="hipaa-features">
              <div className="hipaa-feature">
                <svg className="icon-check-circle" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                <div className="hipaa-feature-text">
                  <h4>End-to-end AES-256 encryption</h4>
                  <p>Your data is encrypted at rest and in transit</p>
                </div>
              </div>
              <div className="hipaa-feature">
                <svg className="icon-check-circle" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                <div className="hipaa-feature-text">
                  <h4>BAA included with all plans</h4>
                  <p>Business Associate Agreement ready to sign</p>
                </div>
              </div>
              <div className="hipaa-feature">
                <svg className="icon-check-circle" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                <div className="hipaa-feature-text">
                  <h4>SOC 2 Type II certified</h4>
                  <p>Independently audited security controls</p>
                </div>
              </div>
              <div className="hipaa-feature">
                <svg className="icon-check-circle" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                <div className="hipaa-feature-text">
                  <h4>Auto-delete audio</h4>
                  <p>Recordings deleted after processing</p>
                </div>
              </div>
            </div>
          </div>
          <div className="hipaa-visual">
            <div className="hipaa-shield-outer"></div>
            <div className="hipaa-shield-middle"></div>
            <div className="hipaa-shield-inner">
              <svg className="shield-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <polyline points="9 12 11 14 15 10" />
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="pricing-section">
        <div className="section-header">
          <h2>Simple, Transparent Pricing</h2>
          <p>Choose the plan that works best for your practice. 14-day free trial, no credit card required.</p>
        </div>
        <div className="pricing-card-wrapper">
          <div className="pricing-card">
            <div className="pricing-badge">Most Popular</div>
            <div className="pricing-header">
              <h3>Professional Plan</h3>
              <p>Everything you need for clinical documentation</p>
            </div>
            <div className="pricing-content">
              <div className="pricing-price">
                <span className="price-amount">$40</span>
                <span className="price-period">/month</span>
              </div>
              <ul className="pricing-features">
                <li>
                  <svg className="icon-check" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                  Unlimited audio transcription
                </li>
                <li>
                  <svg className="icon-check" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                  Automatic SOAP note generation
                </li>
                <li>
                  <svg className="icon-check" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                  Complete session history
                </li>
                <li>
                  <svg className="icon-check" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                  Guaranteed HIPAA compliance
                </li>
              </ul>
              <button className="btn-pricing" onClick={onGoToAuth}>
                Start Free Trial
              </button>
              <p className="pricing-note">Cancel anytime. No long-term contracts.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2>Ready to Transform Your Practice?</h2>
          <p>Join 10,000+ healthcare professionals who have reclaimed their time and improved documentation quality.</p>
          <div className="cta-buttons">
            <button className="btn-cta-primary" onClick={onGoToAuth}>
              Start Free Trial
              <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
            <button className="btn-cta-secondary" onClick={onGoToAuth}>
              Schedule a Demo
            </button>
          </div>
          <div className="cta-features">
            <div className="cta-feature">
              <svg className="icon-small" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <span>14-day free trial</span>
            </div>
            <div className="cta-feature">
              <svg className="icon-small" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <span>No credit card required</span>
            </div>
            <div className="cta-feature">
              <svg className="icon-small" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <span>Cancel anytime</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-logo">
            <div className="logo-icon-small">
              <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
            </div>
            <span>EasyTheraNotes</span>
          </div>
          <div className="footer-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Contact Support</a>
          </div>
          <p className="footeropyright">
            © 2024 EasyTheraNotes. Professional Medical Demo.
          </p>
        </div>
      </footer>
    </div>
  </div>
);

/* ───────────────────── Auth (página 2) ───────────────────── */

interface AuthProps {
  onBackToLanding: () => void;
  onGoToRegister: () => void;
  onLogin: () => void;
}

const AuthView: React.FC<AuthProps> = ({
  onBackToLanding,
  onGoToRegister,
  onLogin,
}) => (
  <div id="auth-view" className="view active">
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-icon-wrapper">
          <div className="auth-icon">
            <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
        </div>
        <h1>Secure Portal</h1>
        <p className="auth-subtitle">Provider Authentication</p>
        <form
          id="auth-form"
          className="auth-form"
          onSubmit={(e) => {
            e.preventDefault();
            onLogin(); // ← aquí saltamos a la página 3 (#app-view)
          }}
        >
          <div className="form-group">
            <label htmlFor="provider-id">Provider ID</label>
            <input
              id="provider-id"
              type="text"
              placeholder="dr.example"
              defaultValue="dr.smith"
            />
          </div>
          <div className="form-group">
            <label htmlFor="provider-password">Password</label>
            <input
              id="provider-password"
              type="password"
              placeholder="••••••••"
              defaultValue="password"
            />
          </div>
          <button type="submit" className="btn-primary-full">
            Access Workspace
          </button>
        </form>
        <div className="auth-footer">
          <p className="auth-footer-text">
            Don&apos;t have an account?{" "}
            <button
              type="button"
              className="auth-link"
              onClick={onGoToRegister}
            >
              Sign Up
            </button>
          </p>
        </div>
        <div className="auth-security">
          <svg className="icon-small" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <span>256-bit End-to-End Encryption</span>
        </div>
        <button
          className="auth-back"
          type="button"
          onClick={onBackToLanding}
        >
          ← Return to Homepage
        </button>
      </div>
    </div>
  </div>
);

/* ───────────────────── Register ───────────────────── */

interface RegisterProps {
  onBackToLanding: () => void;
  onGoToAuth: () => void;
}

const RegisterView: React.FC<RegisterProps> = ({
  onBackToLanding,
  onGoToAuth,
}) => (
  <div id="register-view" className="view active">
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-icon-wrapper">
          <div className="auth-icon">
            <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="8.5" cy="7" r="4" />
              <path d="M20 8v6M23 11h-6" />
            </svg>
          </div>
        </div>
        <h1>Create Account</h1>
        <p className="auth-subtitle">Register for a new account</p>
        <form id="register-form" className="auth-form">
          <div className="form-group">
            <label htmlFor="register-username">Username</label>
            <input
              id="register-username"
              type="text"
              placeholder="Enter your username"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="register-email">Email</label>
            <input
              id="register-email"
              type="email"
              placeholder="Enter your email"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="register-password">Password</label>
            <input
              id="register-password"
              type="password"
              placeholder="Create a password"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="register-password-confirm">Confirm Password</label>
            <input
              id="register-password-confirm"
              type="password"
              placeholder="Confirm your password"
              required
            />
          </div>
          <button type="submit" className="btn-primary-full">
            Create Account
          </button>
        </form>
        <div className="auth-footer">
          <p className="auth-footer-text">
            Already have an account?{" "}
            <button type="button" className="auth-link" onClick={onGoToAuth}>
              Sign In
            </button>
          </p>
        </div>
        <div className="auth-security">
          <svg className="icon-small" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <span>256-bit End-to-End Encryption</span>
        </div>
        <button
          type="button"
          className="auth-back"
          onClick={onBackToLanding}
        >
          ← Return to Homepage
        </button>
      </div>
    </div>
  </div>
);

/* ───────────────────── App View (#app-view, página 3) ───────────────────── */

interface AppViewProps {
  onLogout: () => void;
}

type WorkspaceView = 'input' | 'recording' | 'processing' | 'result' | 'history';

const AppView: React.FC<AppViewProps> = ({ onLogout }) => {
  const [view, setView] = React.useState<WorkspaceView>('input');
  const [patientId, setPatientId] = React.useState('');
  const [timer, setTimer] = React.useState(0);
  const timerRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    // limpiar el intervalo si el componente se desmonta
    return () => {
      if (timerRef.current !== null) {
        window.clearInterval(timerRef.current);
      }
    };
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // 🔴 Empezar “grabación” (simulada)
  const handleStartRecording = () => {
    setView('recording');
    setTimer(0);

    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
    }

    timerRef.current = window.setInterval(() => {
      setTimer((prev) => prev + 1);
    }, 1000);
  };

  // ⏹️ Detener “grabación” y pasar a procesamiento + resultado
  const handleStopRecording = () => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }

    setView('processing');

    // Simulamos 2s de procesamiento y luego mostramos la nota generada
    setTimeout(() => {
      setView('result');
    }, 2000);
  };

  const handleGoToInput = () => {
    setView('input');
  };

  const handleGoToHistory = () => {
    setView('history');
  };

  const handleDiscardAndNew = () => {
    setView('input');
    setTimer(0);
  };

  const generatedNote = `SOAP Note – Demo
Patient: ${patientId || 'PT-0000'}
Date: ${new Date().toLocaleDateString()}

S: Patient reports ongoing symptoms compatible with anxiety and stress.
O: Affect congruent with mood, oriented x3, no acute safety concerns observed.
A: Generalized anxiety features with situational stressors.
P: Continue psychotherapy, monitor symptoms, and adjust plan as needed.`;

  const handleCopyNote = async () => {
    try {
      await navigator.clipboard.writeText(generatedNote);
      // opcional: podrías mostrar un pequeño feedback visual
    } catch {
      // si falla, simplemente no hacemos nada
    }
  };

  const isHistory = view === 'history';

  return (
    <div id="app-view" className="view active">
      {/* App Header */}
      <header className="app-header">
        <div className="app-header-content">
          <div className="app-logo" onClick={handleGoToInput}>
            <div className="logo-icon-small bg-blue">
              <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
            </div>
            <span>EasyTheraNotes</span>
          </div>
          <div className="app-header-right">
            <div className="user-info">
              <span className="user-name">Dr. Smith</span>
              <span className="user-status">
                <span className="status-dot-small"></span>
                Connected
              </span>
            </div>
            <div className="header-divider"></div>
            <button className="icon-btn" type="button" onClick={onLogout}>
              <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <path d="M16 17l5-5-5-5" />
                <path d="M21 12H9" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <main className="app-main">
        {/* Navigation Tabs */}
        <div className="nav-tabs">
          <button
            type="button"
            className={`nav-tab ${!isHistory ? 'active' : ''}`}
            onClick={handleGoToInput}
          >
            <svg className="icon-small" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8" />
            </svg>
            Active Session
          </button>
          <button
            type="button"
            className={`nav-tab ${isHistory ? 'active' : ''}`}
            onClick={handleGoToHistory}
          >
            <svg className="icon-small" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M3 3v18h18" />
              <path d="M7 16l4-4 4 4 6-6" />
            </svg>
            History Archive
          </button>
        </div>

        {/* VISTA: INPUT (New Session) */}
        {view === 'input' && (
          <>
            <div id="input-view" className="app-content-view active">
              <div className="session-card">
                <div className="session-header">
                  <h2>New Session</h2>
                  <p>Configure your session details below to begin documentation.</p>
                </div>
                <div className="session-body">
                  <label className="session-label">Patient Identifier</label>
                  <div className="input-wrapper">
                    <div className="input-icon">
                      <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      placeholder="e.g. PT-2024-8842"
                      className="session-input"
                      value={patientId}
                      onChange={(e) => setPatientId(e.target.value)}
                    />
                  </div>
                  <div className="action-buttons">
                    <button
                      type="button"
                      className="action-btn record-btn"
                      onClick={handleStartRecording}
                    >
                      <div className="action-icon">
                        <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                          <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8" />
                        </svg>
                      </div>
                      <div>
                        <span className="action-title">Start Recording</span>
                        <span className="action-subtitle">Use microphone (demo)</span>
                      </div>
                    </button>

                    <label className="action-btn upload-btn">
                      <input type="file" accept="audio/*" className="file-input" />
                      <div className="action-icon">
                        <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <path d="M17 8l-5-5-5 5" />
                          <path d="M12 3v12" />
                        </svg>
                      </div>
                      <div>
                        <span className="action-title">Upload Audio</span>
                        <span className="action-subtitle">MP3, WAV, M4A</span>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="privacy-notice">
              <div className="notice-icon">
                <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <div>
                <h4>Privacy Protocol Active</h4>
                <p>
                  Ensure no direct personal identifiers (names, specific addresses) are spoken. The AI is
                  trained to structure clinical data while maintaining anonymity.
                </p>
              </div>
            </div>
          </>
        )}

        {/* VISTA: RECORDING */}
        {view === 'recording' && (
          <div id="recording-view" className="app-content-view active">
            <div className="recording-container">
              <div className="visualizer-wrapper">
                <canvas className="audio-visualizer" />
                <div className="recording-icon-wrapper">
                  <div className="recording-pulse-1"></div>
                  <div className="recording-pulse-2"></div>
                  <div className="recording-icon"></div>
                </div>
              </div>
              <div className="recording-info">
                <div className="recording-badge">
                  <span className="recording-dot"></span>
                  Recording In Progress
                </div>
                <div className="recording-timer">{formatTime(timer)}</div>
                <p className="recording-session-id">
                  Session ID: {patientId || 'AUTO-SESSION'}
                </p>
              </div>
              <button
                type="button"
                className="btn-danger"
                onClick={handleStopRecording}
              >
                End Session
              </button>
            </div>
          </div>
        )}

        {/* VISTA: PROCESSING */}
        {view === 'processing' && (
          <div id="processing-view" className="app-content-view active">
            <div className="processing-container">
              <div className="processing-spinner-wrapper">
                <div className="processing-pulse"></div>
                <div className="processing-spinner">
                  <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                </div>
              </div>
              <div className="processing-text">
                <h3>Processing Audio</h3>
                <p>Securely connecting to Clinical AI Engine...</p>
              </div>
              <div className="processing-steps">
                <span className="step-active">TRANSCRIBING</span>
                <svg className="icon-small" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M5 12h14" />
                  <path d="M12 5l7 7-7 7" />
                </svg>
                <span>ANALYZING</span>
                <svg className="icon-small" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M5 12h14" />
                  <path d="M12 5l7 7-7 7" />
                </svg>
                <span>STRUCTURING</span>
              </div>
            </div>
          </div>
        )}

        {/* VISTA: RESULT */}
        {view === 'result' && (
          <div id="result-view" className="app-content-view active">
            <div className="result-header">
              <div className="result-header-left">
                <h2>
                  <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <path d="M14 2v6h6" />
                    <path d="M16 13H8" />
                    <path d="M16 17H8" />
                    <path d="M10 9H8" />
                  </svg>
                  Generated Note
                </h2>
              </div>
              <span className="result-badge">
                <svg className="icon-small" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                Processing Complete
              </span>
            </div>
            <div className="note-card">
              <div className="note-header">
                <span className="note-label">
                  <svg className="icon-small" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  Clinical Documentation
                </span>
                <span className="note-readonly">READ ONLY</span>
              </div>
              <div className="note-content">
                <pre>{generatedNote}</pre>
              </div>
            </div>
            <div className="result-actions">
              <button
                type="button"
                className="btn-primary-full"
                onClick={handleCopyNote}
              >
                <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
                Copy Note Text
              </button>
              <button
                type="button"
                className="btn-outline-danger"
                onClick={handleDiscardAndNew}
              >
                <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                  <path d="M10 11v6" />
                  <path d="M14 11v6" />
                </svg>
                Discard &amp; New Session
              </button>
            </div>
          </div>
        )}

        {/* VISTA: HISTORY */}
        {view === 'history' && (
          <div id="history-view" className="app-content-view active">
            <div className="history-header">
              <h2>Session History</h2>
              <span className="history-count">0 Records</span>
            </div>
            <div id="history-empty" className="history-empty">
              <div className="empty-icon">
                <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M3 3v18h18" />
                  <path d="M7 16l4-4 4 4 6-6" />
                </svg>
              </div>
              <h3>No Session History</h3>
              <p>Your secure session records will appear here after your first completed recording.</p>
              <button
                type="button"
                className="btn-outline"
                onClick={handleGoToInput}
              >
                Start New Session
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
