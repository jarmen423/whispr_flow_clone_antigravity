/**
 * Audio Recorder Worklet
 * 
 * Processes audio in real-time and sends raw PCM data to the main thread.
 * This runs on the audio thread for minimal latency.
 */

class AudioRecorderProcessor extends AudioWorkletProcessor {
  constructor(options) {
    super();
    
    this.sampleRate = options.processorOptions?.sampleRate || 16000;
    this.bufferSize = 4096; // Samples to buffer before sending
    this.buffer = new Float32Array(this.bufferSize);
    this.bufferIndex = 0;
    
    // Smooth audio level calculation
    this.smoothingFactor = 0.8;
    this.currentLevel = 0;
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0];
    
    if (!input || !input[0]) {
      return true;
    }

    const inputChannel = input[0];
    
    // Calculate RMS level for visualization
    let sum = 0;
    for (let i = 0; i < inputChannel.length; i++) {
      sum += inputChannel[i] * inputChannel[i];
    }
    const rms = Math.sqrt(sum / inputChannel.length);
    this.currentLevel = this.smoothingFactor * this.currentLevel + (1 - this.smoothingFactor) * rms;

    // Buffer audio data
    for (let i = 0; i < inputChannel.length; i++) {
      this.buffer[this.bufferIndex++] = inputChannel[i];
      
      if (this.bufferIndex >= this.bufferSize) {
        // Send buffered audio to main thread
        this.port.postMessage({
          type: "audio",
          buffer: new Float32Array(this.buffer), // Copy the buffer
          level: this.currentLevel,
        });
        this.bufferIndex = 0;
      }
    }

    return true;
  }
}

registerProcessor("audio-recorder-processor", AudioRecorderProcessor);
