const sketch = (p) => {
  const v = 360;
  let sound;
  let amp;

  p.setup = async () => {
    // put setup code here
    sound = await p.loadSound('https://tonejs.github.io/audio/berklee/gong_1.mp3');
    console.log(sound);
    
    const cnv = p.createCanvas(v, v);
    cnv.mouseReleased(p.userStartAudio);
    p.colorMode(p.HSL, v, 1, 1);

    amp = new p5.Amplitude();
    sound.connect(amp);
  };

  p.draw = () => {
    // put drawing code here
    p.background(p.frameCount % v, 1, 0.5);
    let level = amp.getLevel();
    level = p.map(level, 0, 0.2, 0, 255);
  };

  p.mouseReleased = () => {
    sound.play();
  }
};

new p5(sketch);
