import * as Tone from 'tone';

import TapIndicator from 'modules/TapIndicator.js';
import SpectrumAnalyzer from 'modules/SpectrumAnalyzer01.js';

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

    mainOsc = new p5.Oscillator(440 + p.random() * 440, types[0]);
    mainOsc.amp(0.8);
    mainOsc.disconnect();

    lfo = new p5.Oscillator(0.1, 'sine'); // 速さ
    lfo.amp(200); // 幅
    lfo.disconnect();

    subOsc = new p5.Oscillator(880 + p.random() * 440, types[2]);
    subOsc.amp(0.3);
    subOsc.disconnect();

    mainMixer = new p5.Gain();
    lfo.node.connect(mainOsc.node.frequency);
    mainOsc.connect(mainMixer);
    subOsc.connect(mainMixer);

    lfo.start();
    mainOsc.start();
    subOsc.start();

    fft = new p5.FFT(1024);
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
