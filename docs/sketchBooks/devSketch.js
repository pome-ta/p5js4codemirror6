// --- # example:

import * as Tone from 'tone';
import TapIndicator from 'modules/TapIndicator.js';
import SpectrumAnalyzer from 'modules/SpectrumAnalyzer.js';

const sketch = (p) => {
  let cnvs;
  let w = p.windowWidth;
  let h = p.windowHeight;

  const tapIndicator = new TapIndicator(p);
  const spectrumAnalyzer = new SpectrumAnalyzer(p, 1024);

  const ctx = p.getAudioContext();
  Tone.setContext(ctx);

  p.setup = () => {
    // put setup code here
    cnvs = p.createCanvas(w, h);
    //cnvs.mouseReleased(p.userStartAudio);

    const osc = new Tone.Oscillator().toDestination();

    osc.start();

    spectrumAnalyzer.targetNodes(osc);
    tapIndicator.setup();

    //p.noLoop();
  };

  p.draw = () => {
    // put drawing code here
    p.background(80);
    spectrumAnalyzer.drawGraph();
  };

  p.windowResized = (e) => {
    console.log('windowResized');
    w = p.windowWidth;
    h = p.windowHeight;
    cnvs = p.resizeCanvas(w, h);
  };
};

new p5(sketch);
