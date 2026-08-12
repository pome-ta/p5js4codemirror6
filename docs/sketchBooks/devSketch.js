import * as Tone from 'tone';

import TapIndicator from 'modules/TapIndicator.js';
//import SpectrumAnalyzer from 'modules/SpectrumAnalyzer01.js';
//import SpectrumAnalyzer from 'modules/SpectrumAnalyzer02.js';
//import SpectrumAnalyzer from 'modules/SpectrumAnalyzer03.js';
import SpectrumAnalyzer from 'modules/SpectrumAnalyzer.js';


class FFTT extends p5.p5soundNode {
    constructor(fftSize = 32) {
        super();
        this.fftSize = fftSize;
        this.analyzer = new Tone.FFT({
            size: this.fftSize,
            normalRange: true,
        });
        this.samples = new Tone.Waveform();
        //creates a single gain node to connect to for the analyzer and waveform
        this.node = new Tone.Gain(1);
        this.node.connect(this.analyzer);
        this.node.connect(this.samples);
        this.input.connect(resolveInput(this.node));
    }

    /**
     * Returns the frequency spectrum of the input signal.
     * @method analyze
     * @for FFT
     * @returns {Array} Array of amplitude values from 0 to 1.
     */
    analyze() {
        return this.analyzer.getValue();
    }
    
    /**
     * Returns an array of sample values from the input audio.
     * @method waveform
     * @for FFT
     * @return {Array} Array of sample values from -1 to -1.
     */
    waveform() {
        return this.samples.getValue();
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
  let panner;
  let lfo2;

  let fft;
  let spectrum;
  


  const spectrumAnalyzer = new SpectrumAnalyzer(p);

  p.setup = () => {
    // put setup code here
    //tapIndicator = new TapIndicator(p);
    const ctx = p.getAudioContext();
    Tone.setContext(ctx);

    cnvs = p.createCanvas(w, h);
    cnvs.mouseReleased(p.userStartAudio);

    p.colorMode(p.HSL, v, 1, 1);

    const types = ['sine', 'triangle', 'sawtooth', 'square'];

    mainOsc = new p5.Oscillator(880, types[0]);
    mainOsc.amp(0.8);
    mainOsc.disconnect();

    lfo = new p5.Oscillator(0.1, 'sine'); // 速さ
    lfo.amp(360); // 幅
    lfo.disconnect();

    subOsc = new p5.Oscillator(880, types[0]);
    // subOsc = new Tone.Oscillator(880, types[0]);
    subOsc.amp(1);
    subOsc.disconnect();
    
    panner = new p5.Panner();
    lfo2 = new p5.Oscillator(0.1);
    lfo2.amp(1);
    lfo2.disconnect();
    panner.pan(lfo2);
    subOsc.connect(panner)

    mainMixer = new p5.Gain();
    lfo.node.connect(mainOsc.node.frequency);
    //mainOsc.connect(mainMixer);
    //subOsc.connect(mainMixer);
    panner.connect(mainMixer);
    // subOsc.connect(mainMixer.input);
    
    
    

    lfo.start();
    mainOsc.start();
    subOsc.start();
    lfo2.start();

    fft = new FFTT(1024);
    // subOsc.connect(fft.input);
    // subOsc.connect(fft);
    // mainOsc.connect(fft);
    mainMixer.connect(fft);
    spectrumAnalyzer.setup(fft);

    //p.noLoop();
  };

  p.draw = () => {
    // put drawing code here
    // p.background((p.frameCount * 0.5) % v, 1, 0.5);
    p.background(1);
    spectrum = fft.analyze();
    spectrumAnalyzer.drawSpectrum(spectrum);
  };

  p.windowResized = (e) => {
    console.log('windowResized');
    w = p.windowWidth;
    h = p.windowHeight;
    cnvs = p.resizeCanvas(w, h);
  };
};

new p5(sketch);
