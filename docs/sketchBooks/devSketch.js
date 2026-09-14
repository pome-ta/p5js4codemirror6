// --- # example:

import * as Tone from 'tone';

import TapIndicator from 'modules/TapIndicator.js';
import SpectrumAnalyzer from 'modules/SpectrumAnalyzer.js';

const sketch = (p) => {
  // --- Tone.js
  const ctx = p.getAudioContext();
  Tone.setContext(ctx);
  /* Starting Audio */
  document.addEventListener('pointerup', async () => await Tone.start(), {
    once: true,
  });

  const transport = Tone.getTransport();
  const BPM = transport.bpm;
  const masterCh = new Tone.Channel().toDestination();

  // --- kick
  const kickTone = new Tone.MonoSynth({
    oscillator: { type: 'pulse', width: 0 },
    envelope: {
      attack: 0.0,
      decay: 1.0,
      sustain: 0.0,
      release: 0.9,
      decayCurve: 'exponential',
    },
    filter: {
      type: 'lowpass',
      Q: 8,
      rolloff: -48, // -12, -24, -48, -96
      frequency: 0,
    },
    filterEnvelope: {
      attack: 0.0,
      decay: 0.545,
      sustain: 0.0,
      release: 0.08,
      baseFrequency: 88,
      octaves: 1.3,
    },
  });

  const kickFrqEnv = new Tone.FrequencyEnvelope({
    attack: 0.0,
    decay: 0.84,
    sustain: 0.0,
    release: 0.75,
    baseFrequency: 'A0',
    octaves: 1.9,
    decayCurve: 'exponential',
  });

  kickFrqEnv.connect(kickTone.oscillator.frequency);

  const kickCh = new Tone.Channel();
  const kickChainAry = [
    ,
    //
    kickCh,
  ];
  kickTone.chain(...kickChainAry.filter((n) => n));
  kickCh.chain(masterCh);

  const kickSeq = new Tone.Sequence(
    (time, _signal) => {
      kickTone.triggerAttackRelease(0, '32i', time);
      // kickFrqEnv.triggerAttack(time);
      kickFrqEnv.triggerAttackRelease('3i', time);
    },
    // prettier-ignore
    [
        1, 1, 1, 1,
        1, 1, 1, 1,
        1, 1, 1, 1,
        // 4
        1, 1, 1, [1, 1, ],
      ],
    '4n',
  );

  // --- Sketch
  let cnvs;
  let w = p.windowWidth;
  let h = p.windowHeight;

  // --- Plugins
  const tapIndicator = new TapIndicator(p);
  const spectrumAnalyzer = new SpectrumAnalyzer(p, 2048);

  p.setup = () => {
    // put setup code here
    cnvs = p.createCanvas(w, h);

    BPM.value = 110;

    kickSeq.start(0);
    transport.start(0);

    tapIndicator.setup();
    spectrumAnalyzer.targetNodes(masterCh);

    // p.noLoop();
    // p.frameRate(1);
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
    domLayout();
  };
};

new p5(sketch);
