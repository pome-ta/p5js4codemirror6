import * as Tone from 'tone';

import TapIndicator from 'modules/TapIndicator.js';

class SpectrumAnalyzer {
  #p;
  #fft;
  #audioContext;
  #minFreq;
  #maxFreq;

  constructor(mainInstance) {
    this.#p = mainInstance;
    this.#fft = null;
    this.#audioContext = mainInstance.getAudioContext();
  }

  get #sampleRate() {
    return this.#audioContext.sampleRate;
  }
  setup(fft) {
    this.#fft = fft;
    this.#hookWindowResized();
    console.log(fft.fftSize);
    console.log(this.#sampleRate);
  }

  #setBaseGraphics() {
    this.nyquist = this.#sampleRate / 2;
    this.bandWidth = this.nyquist / this.#fft.fftSize;

    this.#minFreq = this.bandWidth;
    this.#maxFreq = this.nyquist;

    this.#setSize();
    this.#createBase();
    this.#drawBaseGraphics();
  }

  #hookWindowResized() {
    const originalWindowResized = this.#p.windowResized;
    this.#p.windowResized = (...args) => {
      if (typeof originalWindowResized !== 'function') {
        return;
      }
      console.log('前class');
      originalWindowResized.apply(this.#p, args);
      console.log('後class');
    };
  }
}

const sketch = (p) => {
  let tapIndicator;

  let cnvs;
  let w = p.windowWidth;
  let h = p.windowHeight;

  const v = 360;

  let mainMixer;
  let mainOsc;
  let lfo;
  let subOsc;

  let fft;

  const spectrumAnalyzer = new SpectrumAnalyzer(p);

  p.setup = () => {
    // put setup code here
    //tapIndicator = new TapIndicator(p);
    Tone.setContext(p.getAudioContext());

    cnvs = p.createCanvas(w, h);
    cnvs.mouseReleased(p.userStartAudio);

    p.colorMode(p.HSL, v, 1, 1);

    const types = ['sine', 'triangle', 'sawtooth', 'square'];

    mainOsc = new p5.Oscillator(440 + p.random() * 440, types[0]);
    mainOsc.amp(0.3);
    mainOsc.disconnect();

    lfo = new p5.Oscillator(0.3, 'sine'); // 速さ
    lfo.amp(360); // 幅
    lfo.disconnect();

    subOsc = new Tone.Oscillator(880 + p.random() * 440, types[3]);
    subOsc.volume.value = -20;
    //subOsc.disconnect();

    mainMixer = new p5.Gain(0.1);

    lfo.node.connect(mainOsc.node.frequency);
    mainOsc.connect(mainMixer);
    //subOsc.connect(mainMixer);
    subOsc.connect(mainMixer.input);

    lfo.start();
    mainOsc.start();
    subOsc.start();

    fft = new p5.FFT(64);
    mainMixer.connect(fft);
    spectrumAnalyzer.setup(fft);
  };

  p.draw = () => {
    // put drawing code here
    p.background((p.frameCount * 0.5) % v, 1, 0.5);

    let spectrum = fft.analyze();

    p.fill(v, 0.5, 0.1);
    p.noStroke();

    for (let i = 0; i < spectrum.length; i++) {
      let x = p.map(i, 0, spectrum.length, 0, w);
      let y = -h + p.map(spectrum[i], 0, 0.1, h, 0);
      p.rect(x, h, w / spectrum.length, y);
    }

    let waveform = fft.waveform();

    p.noFill();

    p.beginShape();
    p.stroke(20);

    for (let i = 0; i < waveform.length; i++) {
      let x = p.map(i, 0, waveform.length, 0, w);
      let y = p.map(waveform[i], -1, 1, 0, h);
      p.vertex(x, y);
    }
    p.endShape();
  };

  p.windowResized = (e) => {
    console.log('windowResized');
    w = p.windowWidth;
    h = p.windowHeight;
    cnvs = p.resizeCanvas(w, h);
  };
};

new p5(sketch);
