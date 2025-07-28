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
  
  drawSpectrum(spectrum) {
    this.#drawBaseGraphics();
    this.#spectrumLayer.clear();
    
    const [gw, gh] = this.#gridSize;
    const [gx, gy] = this.#gridPosition;
    
    this.#spectrumLayer.noFill();
    this.#spectrumLayer.beginShape();
    this.#spectrumLayer.vertex(gx, gh);
    // 今後break するかも?で、`for`
    for (const [index, amplitude] of Object.entries(spectrum)) {
      const x = this.#p.map(index, 0, spectrum.length, gx, gw);
      const y = this.#p.map(amplitude, 0, 255, gh, gy);
      this.#spectrumLayer.vertex(x, y);
    }
    this.#spectrumLayer.vertex(gw, gh);
    //p.vertex(pgX, pgH + pgY);
    this.#spectrumLayer.endShape();
    this.#p.image(this.#spectrumLayer, ...this.#gridPosition);
  }

  #setLabelsLayer() {
    const [w, h] = this.#labelsSize;
    const [x, y] = this.#labelsPosition;

    this.#labelsLayer.fill(0, 255, 255);
    this.#labelsLayer.rect(0, 0, w, h);
  }

  #setGridLayer() {
    const [w, h] = this.#gridSize;
    const [x, y] = this.#gridPosition;

    this.#gridLayer.fill(255, 0, 255);
    this.#gridLayer.rect(0, 0, w, h);
  }

  setup() {
    this.#setBaseGraphics();
    this.#useWindowResized();
  }
  
  #setBaseGraphics() {
    this.#setSize();
    this.#setLabelsLayer();
    this.#setGridLayer();
    this.#drawBaseGraphics();
  }

  #drawBaseGraphics() {
    const [lx, ly] = this.#labelsPosition;
    const [gx, gy] = this.#gridPosition;
    this.#p.image(this.#labelsLayer, ...this.#labelsPosition);
    this.#p.image(this.#gridLayer, ...this.#gridPosition);
  }

  #setSize() {
    this.#labelsLayer && this.#labelsLayer.remove();
    this.#gridLayer && this.#gridLayer.remove();
    this.#spectrumLayer && this.#spectrumLayer.remove();

    this.#labelsLayer = this.#p.createGraphics(
      this.#p.windowWidth * this.ratio,
      this.#p.windowHeight * this.ratio
    );

    this.#gridLayer = this.#p.createGraphics(
      this.#labelsLayer.width * this.ratio,
      this.#labelsLayer.height * this.ratio
    );

    this.#spectrumLayer = this.#p.createGraphics(
      this.#labelsLayer.width * this.ratio,
      this.#labelsLayer.height * this.ratio
    );

    this.#labelsSize = [this.#labelsLayer.width, this.#labelsLayer.height];
    this.#labelsPosition = [
      (this.#p.windowWidth - this.#labelsLayer.width) / 2,
      (this.#p.windowHeight - this.#labelsLayer.height) / 2,
    ];

    this.#gridSize = [this.#gridLayer.width, this.#gridLayer.height];
    this.#gridPosition = [
      (this.#p.windowWidth - this.#gridLayer.width) / 2,
      (this.#p.windowHeight - this.#gridLayer.height) / 2,
    ];
  }

  #useWindowResized() {
    const instance = this;
    const originalFunction =
      instance.#p.windowResized === void 0
        ? (e) => {}
        : instance.#p.windowResized;
    instance.#p.windowResized = function (...args) {
      const result = originalFunction.apply(this, args);
      instance.#setBaseGraphics();
      return result;
    };
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
    osc.setType(types[1]);
    const rFrq = baseFreq * p.random();
    // osc.freq(baseFreq + rFrq);
    osc.freq(baseFreq);
    osc.amp(0.2);
    osc.start();

    lfo = new p5.Oscillator(0.25, types[0]); // 速さ
    lfo.amp(880); // 幅
    
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
    gridGraph.drawSpectrum(spectrum);
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
