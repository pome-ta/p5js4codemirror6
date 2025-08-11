// [p5.js Web Editor | 003-Microphone-Effects](https://editor.p5js.org/thomasjohnmartinez/sketches/5NV6gUkWM)


const sketch = (p) => {

  let w = p.windowWidth;
  let h = p.windowHeight;

  let mic;

  p.setup = () => {
    // put setup code here
    soundReset();

    const cnv = p.createCanvas(w, h);
    cnv.mousePressed(startMic);

    
    p.describe('The color of the background changes based on the amplitude of the sound.');
    
    mic = new p5.AudioIn();
    


    window._cacheSounds = [mic];
  };

  p.draw = () => {
    // put drawing code here
    
  };


  function startMic() {
    mic.start();
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
