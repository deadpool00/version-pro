// Services for EasyTheraNotes

// Format time from seconds to MM:SS
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

// Convert blob to base64
function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const result = reader.result;
            const base64 = result.split(',')[1];
            resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

// Generate clinical note (mock service)
async function generateClinicalNote(audioBlob, patientId) {
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    const currentDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    // Generate a sample SOAP note
    const note = {
        patientId: patientId,
        date: currentDate,
        subjective: `Patient reports ongoing concerns related to their condition. Patient describes experiencing symptoms that have been present for the duration of the session. Patient expresses understanding of the treatment plan and is engaged in the therapeutic process.`,
        objective: `Patient presents as alert and oriented. Appearance is appropriate for age and setting. Speech is clear and coherent. Patient demonstrates good eye contact and appears comfortable in the clinical setting. No acute distress observed.`,
        assessment: `Patient continues to work through identified treatment goals. Progress is noted in patient's engagement and understanding of therapeutic interventions. Patient demonstrates appropriate insight into their condition and treatment needs.`,
        plan: `Continue with current treatment approach. Patient will return for follow-up as scheduled. Patient is encouraged to practice discussed strategies between sessions. Monitor progress and adjust interventions as needed based on patient response.`
    };

    return note;
}

// Audio Visualizer
class AudioVisualizer {
    constructor(canvas, audioStream) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.audioStream = audioStream;
        this.audioContext = null;
        this.analyzer = null;
        this.dataArray = null;
        this.animationFrame = null;
        this.isActive = false;

        if (audioStream) {
            this.init();
        }
    }

    init() {
        this.audioContext = new AudioContext();
        const source = this.audioContext.createMediaStreamSource(this.audioStream);
        this.analyzer = this.audioContext.createAnalyser();
        this.analyzer.fftSize = 64;
        source.connect(this.analyzer);

        const bufferLength = this.analyzer.frequencyBinCount;
        this.dataArray = new Uint8Array(bufferLength);

        this.resize();
        this.draw();
    }

    resize() {
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
    }

    draw() {
        if (!this.analyzer || !this.isActive) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            // Draw idle bars
            const barCount = 20;
            const barWidth = this.canvas.width / barCount;
            for (let i = 0; i < barCount; i++) {
                const barHeight = 5;
                const x = i * barWidth;
                const y = this.canvas.height - barHeight;
                this.ctx.fillStyle = '#ef4444';
                this.ctx.fillRect(x, y, barWidth - 2, barHeight);
            }
            this.animationFrame = requestAnimationFrame(() => this.draw());
            return;
        }

        this.analyzer.getByteFrequencyData(this.dataArray);

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        const barCount = 20;
        const barWidth = this.canvas.width / barCount;
        const step = Math.floor(this.dataArray.length / barCount);

        for (let i = 0; i < barCount; i++) {
            const value = this.dataArray[i * step] || 0;
            const barHeight = Math.max((value / 255) * this.canvas.height, 5);
            const x = i * barWidth;
            const y = this.canvas.height - barHeight;

            this.ctx.fillStyle = '#ef4444';
            this.ctx.fillRect(x, y, barWidth - 2, barHeight);
        }

        this.animationFrame = requestAnimationFrame(() => this.draw());
    }

    start() {
        this.isActive = true;
        if (!this.analyzer && this.audioStream) {
            this.init();
        }
        this.draw();
    }

    stop() {
        this.isActive = false;
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
        if (this.audioContext && this.audioContext.state !== 'closed') {
            this.audioContext.close();
        }
    }
}

