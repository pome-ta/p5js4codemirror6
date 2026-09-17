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
  transport.bpm.value = 105;

  const masterCh = new Tone.Channel().toDestination();

  const drumCh = new Tone.Channel();
  const kick = 'kick',
    snare = 'snare';
  const drumKitPlayer = new Tone.Players();
  drumKitPlayer.fadeIn = '1i';
  drumKitPlayer.fadeOut = '1i';

  const drumSeq = new Tone.Sequence({
    callback: (time, nameTrigger) => {
      Object.values(nameTrigger).forEach((trigger) => {
          trigger.start(time);
      });
    },
    // prettier-ignore
    events: [
      {kick},
    ],
    subdivision: '4n',
    // humanize: 0.001,
  });

  drumCh.chain(masterCh);

  // --- Sketch
  let cnvs;
  let w = p.windowWidth;
  let h = p.windowHeight;

  // --- Plugins
  const tapIndicator = new TapIndicator(p);
  const spectrumAnalyzer = new SpectrumAnalyzer(p, 2048);

  p.setup = async () => {
    // put setup code here
    cnvs = p.createCanvas(w, h);

    const kickBuffer = await Tone.Offline(() => {
      const synth = new Tone.Synth({
        // oscillator: { type: 'sine', phase: -80 },
        // oscillator: { type: 'sine' },
        // oscillator: { type: 'sine', phase: -72 },

        oscillator: { type: 'pulse', width: 0 },
        envelope: {
          attack: 1e-3,
          decay: 12.5,
          sustain: 0.0,
          release: 0.075,
          attackCurve: 'exponential',
          // releaseCurve: 'exponential',
        },
        //portamento: 0.125,
      }).toDestination();
      const nowTime = Tone.now();
      // console.log(nowTime);

      synth.triggerAttack('A6', 0);
      // synth.frequency.rampTo('A2', 0.1);
      // synth.triggerAttackRelease('A5', nowTime, nowTime+1.5);
      synth.frequency.rampTo('A3', 0.1);
      // synth.triggerAttack('A0', nowTime + 0.001);
      // synth.triggerAttackRelease('A4', 0, 1.5);

      synth.triggerRelease(0.5);
    }, 2.5);
    
    drumKitPlayer.add(kick,kickBuffer);
    

    transport.start(0);
    drumSeq.start();

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
  };
};

new p5(sketch);
