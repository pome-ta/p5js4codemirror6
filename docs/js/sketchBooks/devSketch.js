// すぺあな

class GridAndLabels {
  #p;
  #labelsLayer;
  #gridLayer;
  #spectrumLayer;
  #labelsSize;
  #labelsPosition;
  #gridSize;
  #gridPosition;

  constructor(mainInstance) {
    this.#p = mainInstance;
    this.#labelsLayer = null;
    this.#gridLayer = null;
    this.#spectrumLayer = null;
    
    this.ratio = 0.92;
  }
  
  #setSize() {
    let w = this.#p.windowWidth;
    let h = this.#p.windowHeight;
    
    this.#labelsLayer && this.#labelsLayer.remove();
    this.#gridLayer && this.#gridLayer.remove();
    this.#spectrumLayer && this.#spectrumLayer.remove();
    
    this.#labelsLayer = this.#p.createGraphics(w * this.ratio, h * this.ratio);
    let lw = this.#labelsLayer.width;
    let lh = this.#labelsLayer.height;
    
    this.#gridLayer = this.#p.createGraphics(lw * this.ratio, lh * this.ratio);
    let gw = this.#gridLayer.width;
    let gh = this.#gridLayer.height;
    
    this.#spectrumLayer = this.#p.createGraphics(lw * this.ratio, lh * this.ratio);
    
    this.#labelsSize = [lw, lh];
    this.#labelsPosition = [(w - lw) / 2, (h - lh) / 2];
    this.#gridSize = [gw, gh];
    this.#gridPosition = [(w - gw) / 2, (h - gh) / 2];
  }
  
  
  #createLabels() {
  }

  

  setup() {
    const ratio = 0.92;
    let w = this.#p.windowWidth;
    let h = this.#p.windowHeight;

    this.#labelsLayer = this.#p.createGraphics(w * ratio, h * ratio);
    let lw = this.#labelsLayer.width;
    let lh = this.#labelsLayer.height;

    let lx = (w - lw) / 2;
    let ly = (h - lh) / 2;

    this.#gridLayer = this.#p.createGraphics(lw * ratio, lh * ratio);
    let gw = this.#gridLayer.width;
    let gh = this.#gridLayer.height;

    let gx = (w - gw) / 2;
    let gy = (h - gh) / 2;
    // console.log(this.#p)

    const nyquist = this.#p.sampleRate() / 2;
    const divStep = 10;

    console.log(this.#sampleRate);

    console.log(nyquist / divStep);
    const xGridSteps = Array.from({ length: 220 }, (_, i) => 10 + i * 10);
    const xStepFirst = xGridSteps[0];
    const xStepLast = xGridSteps.slice(-1)[0];

    function getHighestDigit(n) {
      if (n === 0) {
        return 0;
      }
      const digits = Math.floor(Math.log10(n));
      return Math.floor(n / 10 ** digits);
    }

    this.#labelsLayer.textFont('monospace');
    this.#labelsLayer.textSize(8);
    this.#labelsLayer.fill(255);

    //this.#labelsLayer.textAlign(this.#p.CENTER, this.#p.CENTER);
    //this.#labelsLayer.textAlign(this.#p.RIGHT, this.#p.BOTTOM);
    this.#labelsLayer.textAlign(this.#p.CENTER, this.#p.BOTTOM);

    this.#gridLayer.strokeWeight(0.5);

    xGridSteps.forEach((hz, idx) => {
      // if (hz === xStepFirst || hz === xStepLast) {
      //   return;
      // }
      const x = this.#p.map(
        Math.log10(hz),
        Math.log10(xStepFirst),
        Math.log10(nyquist),
        0,
        gw
      );
      //const x = this.#p.map(hz, xStepFirst, xStepLast, 0, gw);
      if ((idx + 1) % 10 === 0) {
        //console.log(idx);
        this.#gridLayer.strokeWeight(1);
        this.#labelsLayer.text(`${hz}`, x + gx - lx, lh - gy);
      } else {
        this.#gridLayer.strokeWeight(0.5);
      }
      this.#gridLayer.line(x, 0, x, gh);
      // this.#labelsLayer.text(`${hz}`, x + gx - lx, lh - gy);
    });

    this.lPos = [lx, ly];
    this.lSize = [lw, lh];
    this.gPos = [gx, gy];
    this.gSize = [gw, gh];

    this.#p.image(this.#gridLayer, ...this.gPos);
    this.#p.image(this.#labelsLayer, ...this.lPos);
  }

  draw() {
    this.#p.image(this.#gridLayer, ...this.gPos);
    this.#p.image(this.#labelsLayer, ...this.lPos);
  }
  
  drawSpectrum(spectrum) {
  }
  
  get #sampleRate() {
    return this.#p.sampleRate();
  }
}

const sketch = (p) => {
  let w = p.windowWidth;
  let h = p.windowHeight;
  let bgColor;

  let osc;
  let fft;
  const baseFreq = 440;

  const gridGraph = new GridAndLabels(p);

  p.setup = () => {
    // put setup code here
    soundReset();

    p.createCanvas(w, h);
    p.colorMode(p.HSL, 1, 1, 1);

    bgColor = [0, 0, 0.25];
    p.background(...bgColor);

    fft = new p5.FFT();
    // sound
    const types = ['sine', 'triangle', 'sawtooth', 'square'];
    osc = new p5.Oscillator();
    osc.setType(types[0]);
    const rFrq = baseFreq * p.random();
    // osc.freq(baseFreq + rFrq);
    osc.freq(baseFreq);
    osc.amp(0.4);
    osc.start();

    lfo = new p5.Oscillator(0.25, types[0]); // 速さ
    lfo.amp(440); // 幅
    lfo.start();

    lfo.disconnect();
    lfo.connect(osc.freqNode);

    window._cacheSounds = [osc, lfo];

    gridGraph.setup();
  };

  p.draw = () => {
    // put drawing code here
    p.background(...bgColor);
    const spectrum = fft.analyze();
  };

  p.windowResized = (e) => {
    w = p.windowWidth;
    h = p.windowHeight;
    p.resizeCanvas(w, h);
  };

  function soundReset() {
    // const actx = p.getAudioContext();
    const gain = p.soundOut.output.gain;
    const defaultValue = gain.defaultValue;
    // todo: クリップノイズ対策
    gain.value = -1;
    window._cacheSounds?.forEach((s) => {
      s.stop();
      s.disconnect();
    });

    gain.value = defaultValue;
    p.userStartAudio();
  }
};

new p5(sketch);
