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

  const kickSynth = new Tone.Synth({
    oscillator: { type: 'pulse', width: 0 },
    envelope: {
      //
      attack: 0.0,
      decay: 2.5,
      sustain: 0.0,
      release: 2.5,
    },
  });

  const kickPitchFrq = new Tone.FrequencyEnvelope({
    attack: 0.0,
    decay: 0.075,
    sustain: 0.0,
    release: 0.075,
    baseFrequency: 'A0', // 下限
    octaves: 2.5, // 上限 = baseFrequency * 2^octaves
    // attackCurve: 'exponential',
    // decayCurve: 'exponential',
  });

  kickPitchFrq.connect(kickSynth.oscillator.frequency);

  const kickCh = new Tone.Channel();
  const kickChainAry = [
    ,
    //
    kickCh,
  ];
  kickSynth.chain(...kickChainAry.filter((n) => n));
  kickCh.chain(masterCh);

  const kickSeq = new Tone.Sequence(
    (time, _signal) => {
      // kickTone.triggerAttackRelease(0, '32i', time);
      //kickTone.triggerAttack('A0', time);
      //kickFrqEnv.triggerAttack(time);
      kickSynth.triggerAttack('A0', time);
      kickPitchFrq.triggerAttack(time);
      // kickFrqEnv.triggerAttackRelease('3i', time);
    },
    // prettier-ignore
    [
      1, 1, 1, 1,
      1, 1, 1, 1,
      1, 1, 1, 1,
      // 4
      1, 1, 1, [1, 1,],
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
