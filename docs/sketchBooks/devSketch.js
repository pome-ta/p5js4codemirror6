// --- # example:

import * as Tone from 'tone';

import TapIndicator from 'modules/TapIndicator.js';
import SpectrumAnalyzer from 'modules/SpectrumAnalyzer.js';

const sketch = (p) => {
  // --- Plugins
  const tapIndicator = new TapIndicator(p);
  const spectrumAnalyzer = new SpectrumAnalyzer(p, 2048);

  // --- Tone.js
  const ctx = p.getAudioContext();
  Tone.setContext(ctx);

  // --- Sketch
  let cnvs;
  let w = p.windowWidth;
  let h = p.windowHeight;

  const signalStr = ['◎', '◉'];
  let signalBtn;

  p.setup = () => {
    // put setup code here
    cnvs = p.createCanvas(w, h);
    domSetup();

    tapIndicator.setup();
    //spectrumAnalyzer.targetNodes(click);

    //p.noLoop();
  };

  p.draw = () => {
    // put drawing code here
    p.background(80);
    //p.rect(0, 0, w / 2, h / 2);
    //spectrumAnalyzer.drawGraph();
  };

  p.windowResized = (e) => {
    console.log('windowResized');
    w = p.windowWidth;
    h = p.windowHeight;
    cnvs = p.resizeCanvas(w, h);
    domSetup();
  };

  const domSetup = () => {
    signalBtn = p.createButton(signalStr[0]);
    signalBtn
      //.style('font-family', 'monospace')
      .style('font-size', '3rem')
      .style('width', '4rem')
      .style('height', '4rem')
      .style('border-radius', '50%')
      .style('-webkit-touch-callout', 'none')
      .style('-webkit-user-select', 'none')
      .style('user-select', 'none')
      .style('touch-action', 'none');

    signalBtn.mousePressed(btnPressed);
    signalBtn.mouseReleased(btnReleased);
    domLayout();
  };

  function btnPressed() {
    this.html(signalStr[1]);
  }

  function btnReleased() {
    this.html(signalStr[0]);
  }

  const domLayout = () => {
    // console.log('layout');
    const cw = signalBtn.size().width;
    const ch = signalBtn.size().height;
    const x = w / 2 - cw / 2;
    const y = h / 2 - ch / 2;
    signalBtn.position(x, y / 2 + y);
  };
};

new p5(sketch);
