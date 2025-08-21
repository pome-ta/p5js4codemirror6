// [p5.js-sound/examples/array_of_notes/sketch.js at main · processing/p5.js-sound · GitHub](https://github.com/processing/p5.js-sound/blob/main/examples/array_of_notes/sketch.js)

const interactionTraceKitPath =
  '../../sketchBooks/modules/interactionTraceKit.js';

const sketch = (p) => {
  let w = p.windowWidth;
  let h = p.windowHeight;

  let pointerTracker;
  let tapIndicator;

  let synth;
  let songStarted = false;
  
  const song = [
    // Note pitch, velocity (between 0-1), start time (s), note duration (s)
    { pitch: 'E4', velocity: 1, time: 0, duration: 1 },
    { pitch: 'D4', velocity: 1, time: 1, duration: 1 },
    { pitch: 'C4', velocity: 1, time: 2, duration: 1 },
    { pitch: 'D4', velocity: 1, time: 3, duration: 1 },
    { pitch: 'E4', velocity: 1, time: 4, duration: 1 },
    { pitch: 'E4', velocity: 1, time: 5, duration: 1 },
    { pitch: 'E4', velocity: 1, time: 6, duration: 1 },
    // Rest indicated by offset in start time
    { pitch: 'D4', velocity: 1, time: 8, duration: 1 },
    { pitch: 'D4', velocity: 1, time: 9, duration: 1 },
    { pitch: 'E4', velocity: 1, time: 10, duration: 1 },
    { pitch: 'D4', velocity: 1, time: 11, duration: 1 },
    // Chord indicated by simultaneous note start times
    { pitch: 'C4', velocity: 1, time: 12, duration: 2 },
    { pitch: 'E4', velocity: 1, time: 12, duration: 2 },
    { pitch: 'G4', velocity: 1, time: 12, duration: 2 },
  ];
  

  p.preload = () => {
    p.loadModule(interactionTraceKitPath, (m) => {
      const {PointerTracker, TapIndicator} = m;
      pointerTracker = new PointerTracker(p);
      tapIndicator = new TapIndicator(p);
    });
  };

  p.setup = () => {
    // put setup code here
    soundReStart();

    p.canvas.addEventListener(pointerTracker.move, (e) => e.preventDefault(), {
      passive: false,
    });
    

    p.createCanvas(w, h);
    tapIndicator.setup();

    p.textAlign(p.CENTER, p.CENTER);
    
    // --- sound
    synth = new p5.PolySynth();
    
  };

  p.draw = () => {
    // put drawing code here
    p.background(180);
    songStarted ? p.text('song started', w / 2, h / 2) : p.text('click to play song', w / 2, h / 2);
  };

  p.touchStarted = (e) => {
    if (!songStarted) { // Only play once
      for (let i = 0; i < song.length; i++) {
        const note = song[i];
        synth.play(note.pitch, note.velocity, note.time, note.duration);
      }
      songStarted = true;
    }
  };

  p.touchMoved = (e) => {
  };

  p.touchEnded = (e) => {
  };

  p.windowResized = (e) => {
    w = p.windowWidth;
    h = p.windowHeight;
    p.resizeCanvas(w, h);
  };

  function soundReStart() {
    // wip: クリップノイズ対策
    p.disposeSound();

    const soundArray = p.soundOut.soundArray;
    for (let soundIdx = soundArray.length - 1; soundIdx >= 0; soundIdx--) {
      const sound = soundArray[soundIdx];
      // todo: 過剰処理?
      sound?.stop && sound.stop();
      sound?.dispose && sound.dispose();
      sound?.disconnect && sound.disconnect();

      soundArray.splice(soundIdx, 1);
    }

    const parts = p.soundOut.parts;
    for (let partIdx = parts.length - 1; partIdx >= 0; partIdx--) {
      const phrases = parts[partIdx].phrases;
      for (let phraseIdx = phrases.length - 1; phraseIdx >= 0; phraseIdx--) {
        phrases.splice(phraseIdx, 1);
      }
      parts.splice(partIdx, 1);
    }

    p.soundOut.soundArray = [];
    p.soundOut.parts = [];
    p.soundOut.extensions = []; // todo: 対応必要?

    p.userStartAudio();
  }
};

new p5(sketch);

