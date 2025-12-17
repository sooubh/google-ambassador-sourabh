export class AudioStreamPlayer {
    audioContext: AudioContext | null = null;
    queue: ArrayBuffer[] = [];
    isPlaying: boolean = false;
    scheduledTime: number = 0;

    constructor() {
        // We initialize context lazily or on user gesture
    }

    private ensureContext() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
                sampleRate: 24000,
            });
        }
    }

    add16BitPCM(arrayBuffer: ArrayBuffer) {
        this.ensureContext();
        this.queue.push(arrayBuffer);
        this.scheduleNext();
    }

    private scheduleNext() {
        if (!this.audioContext) return;

        if (this.queue.length > 0) {
            const chunk = this.queue.shift()!;
            const audioBuffer = this.pcmToAudioBuffer(chunk);

            const source = this.audioContext.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(this.audioContext.destination);

            // Schedule to play immediately after the previous one finishes
            const currentTime = this.audioContext.currentTime;
            if (this.scheduledTime < currentTime) {
                this.scheduledTime = currentTime;
            }

            source.start(this.scheduledTime);
            this.scheduledTime += audioBuffer.duration;
        }
    }

    private pcmToAudioBuffer(arrayBuffer: ArrayBuffer): AudioBuffer {
        if (!this.audioContext) throw new Error("AudioContext not initialized");

        const int16Array = new Int16Array(arrayBuffer);
        const float32Array = new Float32Array(int16Array.length);

        for (let i = 0; i < int16Array.length; i++) {
            float32Array[i] = int16Array[i] / 32768;
        }

        const audioBuffer = this.audioContext.createBuffer(1, float32Array.length, 24000);
        audioBuffer.getChannelData(0).set(float32Array);
        return audioBuffer;
    }

    async stop() {
        if (this.audioContext) {
            await this.audioContext.close();
            this.audioContext = null;
        }
        this.queue = [];
        this.scheduledTime = 0;
    }
}
