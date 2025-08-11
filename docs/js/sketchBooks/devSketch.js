// [p5.js Web Editor | 003-Microphone-Effects](https://editor.p5js.org/thomasjohnmartinez/sketches/5NV6gUkWM)


const sketch = (p) => {

  let w = p.windowWidth;
  let h = p.windowHeight;

  let mic;
  let delay;
  let filter;

  p.setup = () => {
    // put setup code here
    soundReset();

    p.describe(`a sketch that accesses the user's microphone and connects it to a delay line.`);

    const cnv = p.createCanvas(w, h);
    cnv.mousePressed(startMic);
    p.background(220);


    mic = new p5.AudioIn();
    delay = new p5.Delay(0.74, 0.1);
    // filter = new p5.Biquad(600, "bandpass");

    p.textAlign(p.CENTER, p.CENTER);
    p.textWrap(p.WORD);
    p.textSize(10);
    p.text('click to open mic, watch out for feedback', w / 2, h / 2, 100);


    window._cacheSounds = [mic,delay,filter];
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
    const actx = p.getAudioContext();

     console.log(p.soundOut);

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
