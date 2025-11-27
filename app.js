// EasyTheraNotes - Main Application

// App State
const AppState = {
    view: 'landing',
    patientId: '',
    recordingTime: 0,
    isCopied: false,
    noteContent: null,
    error: null,
    history: [],
    mediaRecorder: null,
    audioChunks: [],
    timer: null,
    stream: null,
    visualizer: null
};

// View Management
function showView(viewName) {
    // Hide all views
    document.querySelectorAll('.view').forEach(view => {
        view.classList.remove('active');
    });

    // Show target view
    const targetView = document.getElementById(`${viewName}-view`);
    if (targetView) {
        targetView.classList.add('active');
        AppState.view = viewName;
    }

    // Handle app view content
    if (viewName === 'app') {
        showAppContentView('input');
    }
}

function showAppContentView(contentView) {
    document.querySelectorAll('.app-content-view').forEach(view => {
        view.classList.remove('active');
    });

    const targetView = document.getElementById(`${contentView}-view`);
    if (targetView) {
        targetView.classList.add('active');
    }

    // Update tabs
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.remove('active');
    });

    if (contentView === 'input' || contentView === 'recording' || contentView === 'processing' || contentView === 'result') {
        document.getElementById('tab-input')?.classList.add('active');
    } else if (contentView === 'history' || contentView === 'history-details') {
        document.getElementById('tab-history')?.classList.add('active');
    }
}

// Error Management
function showError(message) {
    AppState.error = message;
    const errorBanner = document.getElementById('error-banner');
    const errorMessage = document.getElementById('error-message');
    if (errorBanner && errorMessage) {
        errorMessage.textContent = message;
        errorBanner.classList.remove('hidden');
    }
}

function hideError() {
    AppState.error = null;
    const errorBanner = document.getElementById('error-banner');
    if (errorBanner) {
        errorBanner.classList.add('hidden');
    }
}

// Recording Functions
async function startRecording() {
    if (!AppState.patientId.trim()) {
        showError('Please enter a Patient ID first.');
        return;
    }
    hideError();

    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        AppState.stream = stream;
        const mediaRecorder = new MediaRecorder(stream);
        AppState.mediaRecorder = mediaRecorder;
        AppState.audioChunks = [];

        mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                AppState.audioChunks.push(event.data);
            }
        };

        mediaRecorder.start();
        showAppContentView('recording');

        // Initialize visualizer
        const canvas = document.getElementById('audio-visualizer');
        if (canvas) {
            AppState.visualizer = new AudioVisualizer(canvas, stream);
            AppState.visualizer.start();
        }

        // Timer
        AppState.recordingTime = 0;
        updateRecordingTimer();
        AppState.timer = setInterval(() => {
            AppState.recordingTime++;
            updateRecordingTimer();
        }, 1000);

        // Update session ID display
        const sessionIdEl = document.getElementById('recording-session-id');
        if (sessionIdEl) {
            sessionIdEl.textContent = `Session ID: ${AppState.patientId}`;
        }

    } catch (err) {
        console.error(err);
        showError('Microphone access denied or not available.');
    }
}

function stopRecording() {
    if (AppState.mediaRecorder && AppState.mediaRecorder.state === 'recording') {
        AppState.mediaRecorder.stop();
        AppState.mediaRecorder.onstop = async () => {
            const audioBlob = new Blob(AppState.audioChunks, { type: 'audio/mp3' });

            // Stop all tracks
            if (AppState.stream) {
                AppState.stream.getTracks().forEach(track => track.stop());
            }

            // Stop visualizer
            if (AppState.visualizer) {
                AppState.visualizer.stop();
            }

            if (AppState.timer) {
                clearInterval(AppState.timer);
            }

            await processAudio(audioBlob);
        };
    }
}

function updateRecordingTimer() {
    const timerEl = document.getElementById('recording-timer');
    if (timerEl) {
        timerEl.textContent = formatTime(AppState.recordingTime);
    }
}

// Audio Processing
async function processAudio(blob) {
    showAppContentView('processing');
    hideError();

    try {
        const note = await generateClinicalNote(blob, AppState.patientId);

        // Enhance note with ID and Timestamp
        const completeNote = {
            ...note,
            id: crypto.randomUUID(),
            timestamp: Date.now()
        };

        AppState.noteContent = completeNote;
        AppState.history = [completeNote, ...AppState.history];
        showAppContentView('result');
        renderNote(completeNote, 'note-content');
        updateHistoryDisplay();
    } catch (err) {
        showError(err.message || 'Failed to process audio.');
        showAppContentView('input');
    }
}

// File Upload
function handleFileUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!AppState.patientId.trim()) {
        showError('Please enter a Patient ID before uploading.');
        return;
    }

    processAudio(file);
}

// Note Rendering
function renderNote(note, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = `
        <div class="note-meta">
            <div class="note-meta-item">
                <span class="note-meta-label">Patient ID</span>
                <span class="note-meta-value">${note.patientId}</span>
            </div>
            <div class="note-meta-item" style="text-align: right;">
                <span class="note-meta-label">Date of Service</span>
                <span class="note-meta-value-small">${note.date}</span>
            </div>
        </div>
        <div class="note-section subjective">
            <h3 class="note-section-title">Subjective</h3>
            <p class="note-section-content">${note.subjective}</p>
        </div>
        <div class="note-section objective">
            <h3 class="note-section-title">Objective</h3>
            <p class="note-section-content">${note.objective}</p>
        </div>
        <div class="note-section assessment">
            <h3 class="note-section-title">Assessment</h3>
            <p class="note-section-content">${note.assessment}</p>
        </div>
        <div class="note-section plan">
            <h3 class="note-section-title">Plan</h3>
            <p class="note-section-content">${note.plan}</p>
        </div>
    `;
}

// Copy Note
function copyNote() {
    if (!AppState.noteContent) return;

    const text = `
PATIENT ID: ${AppState.noteContent.patientId}
DATE: ${AppState.noteContent.date}

S: ${AppState.noteContent.subjective}
O: ${AppState.noteContent.objective}
A: ${AppState.noteContent.assessment}
P: ${AppState.noteContent.plan}
    `.trim();

    navigator.clipboard.writeText(text);
    AppState.isCopied = true;

    const copyBtn = document.getElementById('copy-note-btn');
    if (copyBtn) {
        const originalHTML = copyBtn.innerHTML;
        copyBtn.innerHTML = `
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            Copied to Clipboard
        `;
        setTimeout(() => {
            copyBtn.innerHTML = originalHTML;
            AppState.isCopied = false;
        }, 2000);
    }

    const copyHistoryBtn = document.getElementById('copy-history-note-btn');
    if (copyHistoryBtn) {
        const originalHTML = copyHistoryBtn.innerHTML;
        copyHistoryBtn.innerHTML = `
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            Copied to Clipboard
        `;
        setTimeout(() => {
            copyHistoryBtn.innerHTML = originalHTML;
        }, 2000);
    }
}

// Reset
function reset() {
    AppState.patientId = '';
    AppState.noteContent = null;
    AppState.recordingTime = 0;
    AppState.error = null;
    AppState.isCopied = false;
    AppState.audioChunks = [];

    const patientIdInput = document.getElementById('patient-id-input');
    if (patientIdInput) {
        patientIdInput.value = '';
    }

    hideError();
    showAppContentView('input');
}

// History Management
function updateHistoryDisplay() {
    const historyCount = document.getElementById('history-count');
    if (historyCount) {
        historyCount.textContent = `${AppState.history.length} Records`;
    }

    const historyEmpty = document.getElementById('history-empty');
    const historyList = document.getElementById('history-list');

    if (AppState.history.length === 0) {
        if (historyEmpty) historyEmpty.classList.remove('hidden');
        if (historyList) historyList.classList.add('hidden');
    } else {
        if (historyEmpty) historyEmpty.classList.add('hidden');
        if (historyList) {
            historyList.classList.remove('hidden');
            renderHistoryList();
        }
    }
}

function renderHistoryList() {
    const historyList = document.getElementById('history-list');
    if (!historyList) return;

    historyList.innerHTML = AppState.history.map(note => `
        <div class="history-item" data-note-id="${note.id}">
            <div class="history-item-header">
                <div>
                    <h3 class="history-item-title">
                        ${note.patientId}
                        <span class="history-item-badge">SOAP</span>
                    </h3>
                    <div class="history-item-meta">
                        <span>
                            <svg class="icon-small" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                                <line x1="16" y1="2" x2="16" y2="6"/>
                                <line x1="8" y1="2" x2="8" y2="6"/>
                                <line x1="3" y1="10" x2="21" y2="10"/>
                            </svg>
                            ${note.date}
                        </span>
                        ${note.timestamp ? `
                            <span>
                                <svg class="icon-small" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <circle cx="12" cy="12" r="10"/>
                                    <polyline points="12 6 12 12 16 14"/>
                                </svg>
                                ${new Date(note.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </span>
                        ` : ''}
                    </div>
                </div>
                <div class="history-item-arrow">
                    <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                </div>
            </div>
            <div class="history-item-preview">
                <strong>Subjective:</strong> ${note.subjective}
            </div>
        </div>
    `).join('');

    // Add click handlers
    historyList.querySelectorAll('.history-item').forEach(item => {
        item.addEventListener('click', () => {
            const noteId = item.dataset.noteId;
            const note = AppState.history.find(n => n.id === noteId);
            if (note) {
                AppState.noteContent = note;
                showAppContentView('history-details');
                renderNote(note, 'history-note-content');
            }
        });
    });
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // View navigation
    document.querySelectorAll('[data-view]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const view = btn.dataset.view;
            if (view === 'app') {
                showView('app');
            } else if (view === 'auth') {
                showView('auth');
            } else if (view === 'landing') {
                showView('landing');
            }
        });
    });

    // Auth form
    const authForm = document.getElementById('auth-form');
    if (authForm) {
        authForm.addEventListener('submit', (e) => {
            e.preventDefault();
            showView('app');
        });
    }

    // Tab navigation
    document.querySelectorAll('[data-tab]').forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.dataset.tab;
            if (tabName === 'input') {
                reset();
            } else if (tabName === 'history') {
                showAppContentView('history');
                updateHistoryDisplay();
            }
        });
    });

    // Patient ID input
    const patientIdInput = document.getElementById('patient-id-input');
    if (patientIdInput) {
        patientIdInput.addEventListener('input', (e) => {
            AppState.patientId = e.target.value;
        });
    }

    // Start recording
    const startRecordingBtn = document.getElementById('start-recording-btn');
    if (startRecordingBtn) {
        startRecordingBtn.addEventListener('click', startRecording);
    }

    // Stop recording
    const stopRecordingBtn = document.getElementById('stop-recording-btn');
    if (stopRecordingBtn) {
        stopRecordingBtn.addEventListener('click', stopRecording);
    }

    // File upload
    const audioUpload = document.getElementById('audio-upload');
    if (audioUpload) {
        audioUpload.addEventListener('change', handleFileUpload);
    }

    // Copy note
    const copyNoteBtn = document.getElementById('copy-note-btn');
    if (copyNoteBtn) {
        copyNoteBtn.addEventListener('click', copyNote);
    }

    const copyHistoryNoteBtn = document.getElementById('copy-history-note-btn');
    if (copyHistoryNoteBtn) {
        copyHistoryNoteBtn.addEventListener('click', copyNote);
    }

    // Discard note
    const discardNoteBtn = document.getElementById('discard-note-btn');
    if (discardNoteBtn) {
        discardNoteBtn.addEventListener('click', reset);
    }

    // Back to history
    const backToHistoryBtn = document.getElementById('back-to-history-btn');
    if (backToHistoryBtn) {
        backToHistoryBtn.addEventListener('click', () => {
            showAppContentView('history');
            updateHistoryDisplay();
        });
    }

    const backToHistoryListBtn = document.getElementById('back-to-history-list-btn');
    if (backToHistoryListBtn) {
        backToHistoryListBtn.addEventListener('click', () => {
            showAppContentView('history');
            updateHistoryDisplay();
        });
    }

    // Initialize
    updateHistoryDisplay();
});

