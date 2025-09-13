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
  const rate = 2;

  let soundFile;
  let fft;
  
  let description = 'loading';
  let pTag;
  

  p.preload = () => {
    const url = githubusercontent(soundFileURL);
    soundFile = p.loadSound(url);
  };

  p.setup = () => {
    // put setup code here
    w = p.windowWidth;
    h = p.windowHeight;

    
    p.createCanvas(w, h / rate);
    
    p.fill(255, 40, 255);
    p.noStroke();
    p.textAlign(p.CENTER);
    p.textSize(8);
    
    fft = new p5.FFT();

    pTag = p.createP(description);
    const p2Tag = p.createP('Description: Using getEnergy(low, high) to measure amplitude within a range of frequencies.');
    
    
  };

  p.draw = () => {
    // put drawing code here
    p.background(30,20,30);
    updateDescription();
    
    fft.analyze();
    for (let i = 0; i < 8; i++) {
      p.noStroke();
      p.fill((i*30) % 100 + 50, 195, (i*25 + 50) % 255);
      // Each bar has a unique frequency range
      const centerFreq = (p.pow(2,i)*125)/2;
      const loFreq = (p.pow(2,i-1)*125)/2 + centerFreq/4;
      const hiFreq = (centerFreq + centerFreq/2);
      
      const freqValue = fft.getEnergy(loFreq, hiFreq - 1);
      // Rectangle height represents the average value of this frequency range
      const _h = (-h/2) + p.map(freqValue, 0, 255, h/rate, 0);
      p.rect((i+1)*w/8 - w/8, h/rate, w/8, _h);
  
      p.fill(255);
      p.text( loFreq.toFixed(0) +' Hz - ' + hiFreq.toFixed(0)+' Hz', (i+1)*w/8 - w/8/2, 30);
    }

    
  };
  
  // Change description text if the song is loading, playing or paused
  function updateDescription() {
    if (!soundFile.isPlaying()) {
      description = 'Paused...';
      pTag.html(description);
    }
    else if (soundFile.isPlaying()){
      description = 'Playing!';
      pTag.html(description);
    }
    else {
      for (let i = 0; i < p.frameCount%3; i++ ) {
        // add periods to loading to create a fun loading bar effect
        // 読み込み中にピリオドを追加して、楽しい読み込みバー効果を作成します。
        // todo: 表示されなくない？
        if (p.frameCount%4 == 0){
          description += '.';
        }
        if (p.frameCount%25 == 0) {
          description = 'loading';
        }
      }
      pTag.html(description);
    }
  }

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
