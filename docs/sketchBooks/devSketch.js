// [p5.js-sound/examples/FFT_freqRange/sketch.js at main · processing/p5.js-sound · GitHub](https://github.com/processing/p5.js-sound/blob/main/examples/FFT_freqRange/sketch.js)


/**
 * Display the average amount of energy (amplitude) across a range
 * of frequencies using the p5.FFT class and its methods analyze()
 * and getEnergy().
 * 
 * This example divides the frequency spectrum into eight bands.
 */

const soundFileURL =
  'https://github.com/processing/p5.js-sound/blob/main/examples/files/beat.ogg';


// todo: `p.loadSound` 用 => 通常のGitHub URL を`githubusercontent` へ置き換え
const githubusercontent = (githubUrl) =>
  githubUrl
    .replace('https://github.com/', 'https://raw.githubusercontent.com/')
    .replace('/blob/', '/');


const sketch = (p) => {
  let w, h;

  let soundFile;
  let fft;
  
  let description = 'loading';
  let pTag;
  

  let noise, env, analyzer, delay;

  p.preload = () => {
    const url = githubusercontent(soundFileURL);
    soundFile = p.loadSound(url);
  };

  p.setup = () => {
    // put setup code here
    w = p.windowWidth;
    h = p.windowHeight;

    p.createCanvas(w, h);

    

    
  };

  p.draw = () => {
    // put drawing code here
    p.background(128);

    
  };

  /*
  p.mousePressed = (e) => {
  };

  p.mouseReleased = (e) => {
  };
  */

  p.touchStarted = (e) => {
    soundFile.isPlaying() ? soundFile.pause() : soundFile.loop();
  };

  p.touchMoved = (e) => {};

  p.touchEnded = (e) => {};

  p.windowResized = (e) => {
    w = p.windowWidth;
    h = p.windowHeight;
    p.resizeCanvas(w, h);
  };
};

new p5(sketch);
