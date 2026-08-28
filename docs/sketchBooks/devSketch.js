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

  let pointerId = null;
  let xyPad;

  const holdColor = 'rgba(128, 0, 0, 0.64)';
  const holdAlpha = 0.4;
  const idleAlpha = 0.12;
  const idleBg = (a) => `rgba(0, 0, 128, ${a})`;

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

  const moveWidth = (v) => {
    const valueWidth = p.map(v, 0, 1, -0.8, 0.8);
    synth.oscillator.width.value = valueWidth;
  };

  const xyPadClientFrame = (event) => {
    const {
      left: rectLeft,
      top: rectTop,
      width: rectWidth,
      height: rectHeight,
    } = event.currentTarget.getBoundingClientRect();

    // xxx: 外の要素まで拾わなくていいと思うのだけど・・・
    const absPointer = {
      x: p.map(event.clientX - rectLeft, 0, rectWidth, 0, rectWidth, true),
      y: p.map(event.clientY - rectTop, 0, rectHeight, 0, rectHeight, true),
    };
    const ratioPointer = {
      x: p.map(absPointer.x, 0, rectWidth, 0.0, 1.0, true),
      y: p.map(absPointer.y, 0, rectHeight, 0.0, 1.0, true),
    };

    return {
      absPointer,
      ratioPointer,
      size: { width: rectWidth, height: rectHeight },
      position: { x: rectLeft, y: rectTop },
      client: { x: event.clientX, y: event.clientY },
    };
  };

  const domSetup = () => {
    xyPad = p.createDiv();
    xyPad
      .style('width', '16rem')
      .style('height', '16rem')
      .style('background', idleBg(idleAlpha))
      .style('-webkit-touch-callout', 'none')
      .style('-webkit-user-select', 'none')
      .style('user-select', 'none')
      .style('touch-action', 'none');

    const styleTransformPerspective = (event) => {
      const { ratioPointer: rp } = xyPadClientFrame(event);

      const xMap = p.map(rp.y, 0, 1, -7.5, 7.5, true);
      const yMap = p.map(rp.x, 0, 1, 7.5, -7.5, true);

      return `rotateY(${yMap}deg) rotateX(${xMap}deg)`;
    };

    const styleRadialGradient = (event) => {
      const { absPointer: ap } = xyPadClientFrame(event);
      return `radial-gradient(circle at ${ap.x}px ${ap.y}px in hsl longer hue, ${holdColor} 8%, ${idleBg(
        holdAlpha,
      )}  1%)`;
    };

    const idleSignal = (event) => {
      xyPad.elt.releasePointerCapture(event.pointerId);
      xyPad.style('background', idleBg(idleAlpha));
      synth.triggerRelease();
      pointerId = null;
    };

    const signalLiteral = {
      pointerdown: (event) => {
        xyPad.elt.setPointerCapture(event.pointerId);
        pointerId = event.pointerId;

        xyPad
          .style('transform', `perspective(16rem) ${styleTransformPerspective(event)}`)
          .style('background', `${styleRadialGradient(event)}`);

        synth.triggerAttack(notes[callCounter++ % notes.length]);
      },

      pointermove: (event) => {
        if (event.buttons === 0 || event.pointerId !== pointerId) {
          pointerId = null;
          return;
        }
        xyPad
          .style('transform', `perspective(16rem) ${styleTransformPerspective(event)}`)
          .style('background', `${styleRadialGradient(event)}`);
        const { ratioPointer: rp } = xyPadClientFrame(event);
        moveWidth(rp.y);
      },

      pointerup: (event) => {
        idleSignal(event);
      },

      pointercancel: (event) => {
        console.log('pointercancel');
        idleSignal(event);
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
