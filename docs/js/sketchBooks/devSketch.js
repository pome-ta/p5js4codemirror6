// [p5.js-sound/examples/Compressor/sketch.js at main · processing/p5.js-sound · GitHub](https://github.com/processing/p5.js-sound/blob/main/examples/Compressor/sketch.js)

const soundFileURL =
  'https://github.com/processing/p5.js-sound/blob/main/examples/files/beat.ogg';

// todo: `p.loadSound` 用 => 通常のGitHub URL を`githubusercontent` へ置き換え
const githubusercontent = (githubUrl) =>
  githubUrl
    .replace('https://github.com/', 'https://raw.githubusercontent.com/')
    .replace('/blob/', '/');

const interactionTraceKitPath =
  '../../sketchBooks/modules/interactionTraceKit.js';

const sketch = (p) => {
  let w = p.windowWidth;
  let h = p.windowHeight;

  let pointerTracker;
  let tapIndicator;

  let soundFile;

  p.preload = () => {
    p.loadModule(interactionTraceKitPath, (m) => {
      const { PointerTracker, TapIndicator } = m;
      pointerTracker = new PointerTracker(p);
      tapIndicator = new TapIndicator(p);
    });

    const url = githubusercontent(soundFileURL);
    soundFile = p.loadSound(url);
  };

  p.setup = () => {
    // put setup code here
    w = p.windowWidth;
    h = p.windowHeight;

    p.canvas.addEventListener(pointerTracker.move, (e) => e.preventDefault(), {
      passive: false,
    });

    p.createCanvas(w, h);
    //tapIndicator.setup();
    // console.log(p);
  };

  p.draw = () => {
    // put drawing code here
    p.background(64);
  };
  
  p.mousePressed = (e)=> {
    if (soundFile.isPlaying()) {
      soundFile.pause();
      // p.background(80);
    } else {
      soundFile.play();
      // p.background(255);
    }
  }
  
  /*
  p.touchStarted = (e) => {};

  p.touchMoved = (e) => {};
  
  p.touchEnded = (e) => {
    if (soundFile.isPlaying()) {
      soundFile.pause();
      p.background(80);
    } else {
      soundFile.play();
      p.background(255);
    }
  };
  */
  

  p.windowResized = (e) => {
    console.log('re');
    w = p.windowWidth;
    h = p.windowHeight;
    p.resizeCanvas(w, h);
  };
};

new p5(sketch);
