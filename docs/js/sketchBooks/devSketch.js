// [p5.js Web Editor | 006-DelayTime-Envelope](https://editor.p5js.org/thomasjohnmartinez/sketches/Dk95S298f)

const interactionTraceKitPath =
  '../../sketchBooks/modules/interactionTraceKit.js';


const sketch = (p) => {
  let w = p.windowWidth;
  let h = p.windowHeight;
  
  let pointerTracker;
  let pointX, pointY;

  let osc;
  let delay;
  let env;
  
  p.preload = () => {
    p.loadModule(interactionTraceKitPath, (m) => {
      const { PointerTracker } = m;
      pointerTracker = new PointerTracker(p);
    });
  };
  

  p.setup = () => {
    // put setup code here
    soundReStart();
    
    p.canvas.addEventListener(pointerTracker.move, (e) => e.preventDefault(), {
      passive: false,
    });

    const cnv = p.createCanvas(w, h);
    p.background(220);
    
    p.textAlign(p.CENTER);
    p.textSize(13);
    p.text('click and drag mouse', w / 2, h / 2);
    

    osc = new p5.Oscillator('sawtooth');
    osc.amp(0.75);
    
    env = new p5.Envelope(0.01);
    delay = new p5.Delay(0.12, 0.7);
    
    
    osc.amp(env);
    osc.disconnect();
    osc.connect(delay);
    
    
    
    
    cnv.mousePressed(oscStart);
    //cnv.mouseReleased(oscStop);
    //cnv.mouseOut(oscStop);
    
    
    p.describe('Click and release or hold, to play a square wave with delay effect.');
    
  };

  p.draw = () => {
    // put drawing code here
    //osc.freq(p.map(p.mouseX, 0, w, 100, 1000));
  };

  function oscStart() {
    p.background(0, 255, 255);
    p.text('release to hear delay', w/2, h/2+150);
    osc.start();
    env.triggerAttack();
  }
  
  function oscStop() {
    p.background(220);
    p.text('click and drag mouse', w/2, h/2+150);
    env.triggerRelease();
  }
  
  p.touchStarted = (e) => {
    pointerTracker.updateXY();
    pointX = pointerTracker.x;
    pointY = pointerTracker.y;
  };

  p.touchMoved = (e) => {
    pointerTracker.updateXY();
    pointX = pointerTracker.x;
    pointY = pointerTracker.y;
  };

  p.touchEnded = (e) => {
    pointerTracker.updateXY();
    pointX = pointerTracker.x;
    pointY = pointerTracker.y;
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
    p.soundOut.extensions = []; // todo: 対応必要？

    p.userStartAudio();
  }
};

new p5(sketch);

