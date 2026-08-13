//import * as Tone from 'tone';

import TapIndicator from 'modules/TapIndicator.js';
import SpectrumAnalyzer from 'modules/SpectrumAnalyzer.js';

const sketch = (p) => {
  let tapIndicator;

  let cnvs;
  let w = p.windowWidth;
  let h = p.windowHeight;

  const spectrumAnalyzer = new SpectrumAnalyzer(p, 1024);

  let sound;
  let amp;

  p.setup = async () => {
    // put setup code here
    sound = await p.loadSound('https://tonejs.github.io/audio/berklee/gong_1.mp3');

    tapIndicator = new TapIndicator(p);
    //const ctx = p.getAudioContext();
    //Tone.setContext(ctx);

    cnvs = p.createCanvas(w, h);
    cnvs.mouseReleased(p.userStartAudio);

    amp = new p5.Amplitude();
    sound.connect(amp);
    
    const mainMixer = new p5.Gain();
    amp.connect(mainMixer)

    spectrumAnalyzer.targetNodes(mainMixer);
  };

  p.draw = () => {
    p.background(1);
    spectrumAnalyzer.drawGraph();
  };

  p.mouseReleased = () => {
    sound.play();
  };

  p.windowResized = (e) => {
    console.log('windowResized');
    w = p.windowWidth;
    h = p.windowHeight;
    cnvs = p.resizeCanvas(w, h);
  };
};

new p5(sketch);
