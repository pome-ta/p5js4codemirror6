// [p5.sound.js/examples/003-Microphone-Effects/sketch.js at main · processing/p5.sound.js · GitHub](https://github.com/processing/p5.sound.js/blob/main/examples/003-Microphone-Effects/sketch.js)

const sketch = (p) => {
  let mic, delay, filty;
  let micStarted = false;

  p.setup = () => {
    // put setup code here
    p.describe("a sketch that accesses the user's microphone and connects it to a delay line and filter effect.");

    const cnv = p.createCanvas(400, 400);
    //cnv.mouseReleased(p.userStartAudio);
    cnv.mousePressed(startMic);

    p.fill(220);

    mic = new p5.AudioIn();
    delay = new p5.Delay(0.74, 0.1);
    filty = new p5.Biquad(600, 'bandpass');

    mic.disconnect();
    mic.connect(delay);
    delay.disconnect();
    delay.connect(filty);

    p.textAlign(p.CENTER);
    p.textWrap(p.WORD);
    p.textSize(10);
  };

  p.draw = () => {
    // put drawing code here
    p.text('click to open mic, watch out for feedback', 0, 200, 400);
    p.text('move the mouse to change the delay time', 0, 220, 400);
    const d = p.map(p.mouseX, 0, p.width, 0.1, 0.5);
    delay.delayTime(d);
  };

  function startMic() {
    console.log(mic);
    console.log(micStarted);
    if (!micStarted) {
      mic.start();
      micStarted = true;
      console.log('t');
    } else {
      mic.stop();
      micStarted = false;
      console.log('f');
    }
  }
};

new p5(sketch);
