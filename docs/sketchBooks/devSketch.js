const sketch = (p) => {
  const v = 360;
  let osc, playing, freq, amp;
  let scale = [261.6, 311.1, 349.2, 370, 392, 466.2];

  p.setup = () => {
    // put setup code here
    p.createCanvas(v, v);
    p.colorMode(p.HSL, v, 1, 1);
    osc = new p5.Oscillator('sawtooth');
    osc.freq(440);
    osc.amp(0.8);
    osc.start();
  };

  p.draw = () => {
    // put drawing code here
    p.background(p.frameCount % v, 1, 0.5);
    freq = p.scale[p.floor(p.map(p.mouseX, 0, p.width, 0, 5))];

    amp = p.constrain(p.map(p.mouseY, p.height, 0, 0, 1), 0, 1);
    p.text('tap to play', 20, 20);
    p.text('freq: ' + freq, 20, 40);
    p.text('amp: ' + amp, 20, 60);

    if (playing == true) {
      osc.freq(freq);
      osc.amp(amp);
    }
  };

  function playOscillator() {
    // starting an oscillator on a user gesture will enable audio
    // in browsers that have a strict autoplay policy.
    osc.start();
    playing = true;
  }
};

new p5(sketch);
