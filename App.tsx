import React, { useState } from 'react';

type View = 'landing' | 'auth' | 'register' | 'workspace';

const App: React.FC = () => {
  const [view, setView] = useState<View>('landing');

  switch (view) {
    case 'auth':
      return (
        <AuthView
          onBackToLanding={() => setView('landing')}
          onGoToRegister={() => setView('register')}
          onLogin={() => setView('workspace')}
        />
      );
    case 'register':
      return (
        <RegisterView
          onBackToLanding={() => setView('landing')}
          onGoToAuth={() => setView('auth')}
        />
      );
    case 'workspace':
      return <WorkspaceView onLogout={() => setView('landing')} />;
    case 'landing':
    default:
      return <LandingView onGoToAuth={() => setView('auth')} />;
  }
};

/* ───────────────────────── Landing ───────────────────────── */

interface LandingProps {
  onGoToAuth: () => void;
}

const LandingView: React.FC<LandingProps> = ({ onGoToAuth }) => (
  <div id="landing-view" className="view active">
    <div className="landing-container">
      {/* Decorative background */}
      <div className="landing-bg-1"></div>
      <div className="landing-bg-2"></div>

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
          <div className="hero-badge">
            <svg className="icon-small" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
            <span>Next Gen Clinical Intelligence</span>
          </div>
          <h1 className="hero-title">
            Clinical Notes,
            <br />
            <span className="gradient-text">Reimagined.</span>
          </h1>
          <p className="hero-description">
            Turn patient conversations into structured, professional SOAP notes instantly.
            Experience the power of advanced neural audio processing with zero data retention.
          </p>
          <div className="hero-buttons">
            <button className="btn-hero-primary" onClick={onGoToAuth}>
              Launch Workspace
              <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
            <button className="btn-hero-secondary" onClick={onGoToAuth}>
              Watch Demo
            </button>
          </div>
        </div>

        <div className="hero-visual">
          <div className="visual-bg"></div>
          <div className="visual-card">
            <div className="visual-header">
              <div className="visual-icon">
                <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8" />
                </svg>
              </div>
              <div className="visual-info">
                <div className="visual-line"></div>
                <div className="visual-line short"></div>
              </div>
              <div className="visual-status">
                <div className="status-dot"></div>
                Recording
              </div>
            </div>
            <div className="visual-bars">
              <div className="visual-bar inactive"></div>
              <div className="visual-bar inactive"></div>
              <div className="visual-bar inactive"></div>
              <div className="visual-bar active"></div>
            </div>
            <div className="visual-footer">
              <span>
                <svg className="icon-small" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
                AI Processing
              </span>
              <span className="mono">00:01:23</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="section-header">
          <h2>Professional Grade Documentation</h2>
          <p>
            Designed for modern healthcare providers who value accuracy, security, and
            efficiency.
          </p>
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
              Intelligent formatting automatically categorizes Subjective, Objective, Assessment,
              and Plan data.
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
              HIPAA-compliant architecture ensures audio processing happens in volatile memory
              only.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="pricing-section">
        <div className="section-header">
          <h2>Simple, Transparent Pricing</h2>
          <p>Choose the plan that works best for your practice.</p>
        </div>
        <div className="pricing-card-wrapper">
          <div className="pricing-card">
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
                Start Now
              </button>
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

/* ───────────────────────── Auth ───────────────────────── */

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

        {/* AQUÍ ES DONDE EL BOTÓN YA CAMBIA DE VISTA */}
        <form
          id="auth-form"
          className="auth-form"
          onSubmit={(e) => {
            e.preventDefault();
            onLogin();
          }}
        >
          <div className="form-group">
            <label>Provider ID</label>
            <input
              type="text"
              placeholder="dr.example"
              defaultValue="dr.smith"
              id="provider-id"
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              defaultValue="password"
              id="provider-password"
            />
          </div>
          <button type="submit" className="btn-primary-full">
            Access Workspace
          </button>
        </form>

        <div className="auth-footer">
          <p className="auth-footer-text">
            Don&apos;t have an account?{' '}
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

/* ─────────────────────── Register ─────────────────────── */

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
            <label>Username</label>
            <input
              type="text"
              placeholder="Enter your username"
              id="register-username"
              required
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              id="register-email"
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Create a password"
              id="register-password"
              required
            />
          </div>
          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              placeholder="Confirm your password"
              id="register-password-confirm"
              required
            />
          </div>
          <button type="submit" className="btn-primary-full">
            Create Account
          </button>
        </form>
        <div className="auth-footer">
          <p className="auth-footer-text">
            Already have an account?{' '}
            <button
              type="button"
              className="auth-link"
              onClick={onGoToAuth}
            >
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

/* ─────────────────────── Workspace ────────────────────── */

interface WorkspaceProps {
  onLogout: () => void;
}

const WorkspaceView: React.FC<WorkspaceProps> = ({ onLogout }) => (
  <div className="view active app-view-placeholder">
    <div className="auth-container">
      <div className="auth-card">
        <h1>Workspace</h1>
        <p className="auth-subtitle">
          Aquí irá tu vista principal (grabación, historial, etc.).
        </p>
        <button className="btn-primary-full" onClick={onLogout}>
          Log out / Back to Landing
        </button>
      </div>
    </div>
  </div>
);

export default App;
