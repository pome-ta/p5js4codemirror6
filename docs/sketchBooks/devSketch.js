// [p5.sound.js/examples/004-OscillatorAmplitudeLFOmodulation/sketch.js at main · processing/p5.sound.js · GitHub](https://github.com/processing/p5.sound.js/blob/main/examples/004-OscillatorAmplitudeLFOmodulation/sketch.js)

let osc, lfo;
let cnv;

function setup() {
  describe('a sketch that demonstrates amplitude modulation with an LFO and sine tone');
  cnv = createCanvas(100, 100);
  cnv.mousePressed(startSound);
  textAlign(CENTER);
  textWrap(WORD);
  textSize(10);

  osc = new p5.Oscillator('sine');
  lfo = new p5.Oscillator(1);
  lfo.disconnect();
  osc.amp(lfo);
}

function startSound() {
  lfo.start();
  osc.start();
}

function draw() {
  background(220);
  text('click to play sound', 0, height / 2 - 20, 100);
  text('control lfo with mouseX position', 0, height / 2, 100);

  let freq = map(mouseX, 0, width, 0, 10);
  lfo.freq(freq);
}

/*
const sketch = (p) => {
  let osc, lfo;
  let cnv;

  p.setup = () => {
    // put setup code here
    cnv = p.createCanvas(100, 100);
    //cnv.mouseReleased(p.userStartAudio);
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
    p.text('click to play sound', 0, p.height / 2 - 20, 100);
    p.text('control lfo with mouseX position', 0, p.height / 2, 100);

    let freq = map(p.mouseX, 0, p.width, 0, 10);
    lfo.freq(freq);
  };

  function startSound() {
    lfo.start();
    osc.start();
  }
};

new p5(sketch);
*/
