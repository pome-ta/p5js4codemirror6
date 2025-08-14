// [p5.js Web Editor | 004-OscillatorAmplitudeLFOmodulation](https://editor.p5js.org/thomasjohnmartinez/sketches/9bsyBm86Q)

const interactionTraceKitPath = '../../sketchBooks/modules/interactionTraceKit.js';


const sketch = (p) => {
  let w = p.windowWidth;
  let h = p.windowHeight;
  
  let pointerTracker;
  let pointX, pointY;
  
  let osc;
  let lfo;
  
  p.preload = () => {
    p.loadModule(interactionTraceKitPath, (m) => {
      const {PointerTracker, TapIndicator} = m;
      pointerTracker = new PointerTracker(p);
    });
  };

  p.setup = () => {
    // put setup code here
    soundReStart();
    
    p.canvas.addEventListener(pointerTracker.move, (e) => e.preventDefault(), {
      passive: false,
    });
    
    p.describe(
      'a sketch that demonstrates amplitude modulation with an LFO and sine tone'
    );

    const cnv = p.createCanvas(w, h);
    cnv.mousePressed(startSound);
    p.textAlign(p.CENTER);
    p.textWrap(p.WORD);
    p.textSize(10);
    
    osc = new p5.Oscillator('sine');
    lfo = new p5.Oscillator(1);
    lfo.disconnect();
    osc.amp(lfo);
  };

  p.draw = () => {
    // put drawing code here
    p.background(220);
    
    const maxWidth = 100;
    p.text('click to play sound', w / 2 - (maxWidth / 2), h / 2 - 20, maxWidth);
    p.text('control lfo with mouseX position', w / 2 - (maxWidth / 2), h / 2, maxWidth);
    
    if (isNaN(pointX)) {
      return;
    }
    
    const freq = p.map(pointX, 0, w, 0, 10);
    lfo.freq(freq);
  };
  
  function startSound() {
    lfo.start();
    osc.start();
  }

  p.touchStarted = (e) => {
    pointerTracker.updateXY();
    pointX = pointerTracker.x
    pointY = pointerTracker.y
  };

  p.touchMoved = (e) => {
    pointerTracker.updateXY();
    pointX = pointerTracker.x
    pointY = pointerTracker.y
  };

  p.touchEnded = (e) => {
    pointerTracker.updateXY();
    pointX = pointerTracker.x
    pointY = pointerTracker.y
  };

  p.windowResized = (e) => {
    w = p.windowWidth;
    h = p.windowHeight;
    p.resizeCanvas(w, h);
  };

  function soundReStart() {
    // wip: クリップノイズ対策
    p.disposeSound();

    const soundArray = p.soundOut.soundArray;
    for (let soundIdx = soundArray.length - 1; soundIdx >= 0; soundIdx--) {
      const sound = soundArray[soundIdx];
      // todo: 過剰処理？
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
    p.soundOut.extensions = [];  // todo: 対応必要？
    
    p.userStartAudio();
  }
};

new p5(sketch);

