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
  const transport = Tone.getTransport();
  const BPM = transport.bpm;

  let bpm = 100;

  let masterCh;
  let synth;

  // --- Sketch
  let cnvs;
  let w = p.windowWidth;
  let h = p.windowHeight;

  let xyPad;

  const holdBg = ['background', 'rgba(128, 0, 0, 0.64)'];
  const idleBg = ['background', 'rgba(128, 0, 0, 0.12)'];
  const notes = ['D2', 'F2', 'A2', 'A3', 'D3', 'F2', 'A2'];
  let callCounter = 0;

  p.setup = () => {
    // put setup code here
    cnvs = p.createCanvas(w, h);

    BPM.value = bpm;

    /*
    synth = new Tone.MonoSynth({
      oscillator: { type: 'pulse', width: 0 },
      envelope: { attack: 0.005, decay: 0.1, sustain: 0.3, release: 1 },
    });
    */

    synth = new Tone.Synth({ oscillator: { type: 'pulse', width: 0 } });

    const lfo = new Tone.LFO('1n', -0.8, 0.8).start();
    //lfo.connect(synth.oscillator.width);

    // --- mixer
    masterCh = new Tone.Channel().toDestination();
    synth.connect(masterCh);

    tapIndicator.setup();
    spectrumAnalyzer.targetNodes(masterCh);
    domSetup();

    //p.noLoop();
  };

  p.draw = () => {
    // put drawing code here
    p.background(80);
    //p.rect(0, 0, w / 2, h / 2);
    spectrumAnalyzer.drawGraph();
  };

  p.windowResized = (e) => {
    console.log('windowResized');
    w = p.windowWidth;
    h = p.windowHeight;
    cnvs = p.resizeCanvas(w, h);
    domLayout();
  };

  const domSetup = () => {
    xyPad = p.createDiv();
    xyPad
      .style('width', '16rem')
      .style('height', '16rem')
      .style(...idleBg)
      .style('-webkit-touch-callout', 'none')
      .style('-webkit-user-select', 'none')
      .style('user-select', 'none')
      .style('touch-action', 'none');

    const signalCancel = (event) => {
      xyPad.style(...idleBg);
      synth.triggerRelease();
    };
    const signalLiteral = {
      pointerdown: (event) => {
        xyPad.style(...holdBg);
        synth.triggerAttack(notes[callCounter++ % notes.length]);
      },
      pointermove: (event) => {
        console.log('pointermove');
      },
      pointerup: (event) => {
        signalCancel(event);
      },
    };

    //pointercancel

    const signalEvent = (event) => {
      signalLiteral[event.type](event);
    };
    xyPad.mousePressed(signalEvent);
    xyPad.mouseMoved(signalEvent);
    xyPad.mouseReleased(signalEvent);
    //xyPad.elt.addEventListener('pointermove', (e) => signalEvent(e));

    domLayout();
  };

  const domLayout = () => {
    // console.log('layout');

    const cw = xyPad.size().width;
    const ch = xyPad.size().height;
    const x = w / 2 - cw / 2;
    const y = h / 2 - ch / 2;

    xyPad.position(x, y / 2);
  };
};

new p5(sketch);
