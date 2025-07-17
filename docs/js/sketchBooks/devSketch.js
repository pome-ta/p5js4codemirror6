new p5((p) => {
  let fft, osc, env;
  const minFreq = 20;
  const maxFreq = 20000;

  let audioStarted = false;

  p.setup = () => {
    p.createCanvas(600, 300);
    fft = new p5.FFT(0.9, 1024);

    env = new p5.Envelope();
    env.setADSR(0.001, 0.1, 0, 0.2);
    env.setRange(1, 0);

    osc = new p5.Oscillator('sine');
    osc.disconnect(); // スピーカー出力はEnvelopeに任せる
    osc.amp(env);

    p.textAlign(p.CENTER, p.CENTER);
    p.textSize(18);
  };

  p.draw = () => {
    p.background(0);
    drawLogGrid();

    if (audioStarted) {
      drawSpectrum();
    } else {
      p.fill(255);
      p.text("Tap to Start Audio", p.width / 2, p.height / 2);
    }
  };

  function drawLogGrid() {
    p.stroke(50);
    p.fill(100);
    p.textAlign(p.CENTER, p.TOP);
    let freqs = [20, 100, 1000, 10000];
    for (let f of freqs) {
      let x = p.map(Math.log10(f), Math.log10(minFreq), Math.log10(maxFreq), 0, p.width);
      p.line(x, 0, x, p.height);
      p.noStroke();
      p.text(f + 'Hz', x, 0);
      p.stroke(50);
    }
  }

  function drawSpectrum() {
    let spectrum = fft.analyze();
    let nyquist = p.sampleRate() / 2;
    let lastX = -1;

    p.noStroke();
    p.fill(0, 255, 100);

    for (let i = 1; i < spectrum.length; i++) {
      let freq = i * (nyquist / spectrum.length);
      if (freq < minFreq || freq > maxFreq) continue;

      let x = p.map(Math.log10(freq), Math.log10(minFreq), Math.log10(maxFreq), 0, p.width);
      if (Math.floor(x) === Math.floor(lastX)) continue;
      lastX = x;

      let h = -p.map(spectrum[i], 0, 255, 0, p.height);
      p.rect(x, p.height, 2, h);
    }
  }

  function playKick() {
    osc.freq(120);
    osc.start();
    env.play(osc);
    p.setTimeout(() => osc.stop(), 150);
  }

  p.mousePressed = () => {
    if (!audioStarted) {
      p.userStartAudio().then(() => {
        audioStarted = true;
        console.log("AudioContext started");
      });
    } else {
      playKick();
    }
  };
});
