// [002-Amplitude-VisualizingLoudness by thomasjohnmartinez -p5.js Web Editor](https://editor.p5js.org/thomasjohnmartinez/sketches/Wlcnc6WCD)
const soundPath = 'https://tonejs.github.io/audio/berklee/gong_1.mp3';

const sketch = (p) => {

  let w = p.windowWidth;
  let h = p.windowHeight;

  let sound;
  let amp;

  p.preload = () => {
    sound = p.loadSound(soundPath);
  };


  p.setup = () => {
    // put setup code here
    soundReset();

    const cnv = p.createCanvas(w, h);
    cnv.mousePressed(playSound);

    p.textAlign(p.CENTER);
    p.fill(255);

    amp = new p5.Amplitude();
    sound.connect(amp);

    p.describe('The color of the background changes based on the amplitude of the sound.');


    window._cacheSounds = [sound, amp,];
  };

  p.draw = () => {
    // put drawing code here
    const level = p.map(amp.getLevel(), 0, 0.2, 0, 225);
    p.background(level, 0, 0);
    p.text('click to play', w / 2, 120);
  };


  function playSound() {
    sound.play();
  }


  p.windowResized = (e) => {
    w = p.windowWidth;
    h = p.windowHeight;
    p.resizeCanvas(w, h);
  };

  function soundReset() {
    // const actx = p.getAudioContext();
    const gain = p.soundOut.output.gain;
    const defaultValue = gain.defaultValue;
    // todo: クリップノイズ対策
    gain.value = -1;
    window._cacheSounds?.forEach((s) => {
      s?.stop && s?.stop();
      s?.disconnect && s?.disconnect();
    });

    gain.value = defaultValue;
    p.userStartAudio();
  }
};

new p5(sketch);
