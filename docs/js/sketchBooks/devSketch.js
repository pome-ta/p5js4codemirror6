class GridAndLabels {
  #p;
  #labelsLayer;
  #gridLayer;
  constructor(mainInstance) {
    this.#p = mainInstance;
    this.#labelsLayer = null;
    this.#gridLayer = null;
  }
  setup() {
    const ratio = 0.8;
    let w = this.#p.windowWidth;
    let h = this.#p.windowHeight;
    
    const xLabel = [20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000];
    const yLabel = Array.from({ length: 13 }, (_, i) => -60 + i * 6);
    
    
    this.#labelsLayer = this.#p.createGraphics(w * ratio, h*ratio);
    let lw = this.#labelsLayer.width;
    let lh = this.#labelsLayer.height;
    
    let lx = (w - lw) / 2;
    let ly = (h - lh) / 2;
    
    
    
    this.#gridLayer = this.#p.createGraphics(lw * ratio, lh * ratio);
    let gw = this.#gridLayer.width;
    let gh = this.#gridLayer.height;
    
    
    let gx = (w - gw) / 2;
    let gy = (h - gh) / 2;
    
    this.#labelsLayer.textFont('monospace');
    this.#labelsLayer.textSize(8);
    this.#labelsLayer.fill(255);
    
    this.#labelsLayer.textAlign(this.#p.CENTER, this.#p.BOTTOM);
    
    xLabel.forEach((hz) => {
      const x = this.#p.map(Math.log10(hz), Math.log10(xLabel[0]), Math.log10(xLabel.slice(-1)[0]), gx, gw);
      this.#labelsLayer.text(hz >= 1000 ? `${hz / 1000}k` : `${hz}`, x, lh);
    });
    
    yLabel.forEach((db) => {
      const y = this.#p.map(Math.log10(db), Math.log10(yLabel[0]), Math.log10(yLabel.slice(-1)[0]), gy, gh);
      this.#labelsLayer.text(`${db}`, gx, y);
    });
    
    
    const c = this.#p.color(0,0,0,255);
    
    
    
    this.#gridLayer.noFill();
    this.#gridLayer.stroke(0,255,255);
    this.#gridLayer.rect(0, 0, gw-1, gh-1);
    
    this.#labelsLayer.noFill();
    this.#labelsLayer.stroke(255,0,255);
    this.#labelsLayer.rect(0, 0, lw-1, lh-1);
    
    //this.#labelsLayer.fill(c);
    
    
    //this.#labelsLayer.background(c);
    //this.#gridLayer.background(c);
    
    this.lSize = [lx, ly];
    this.gSize = [gx, gy];
    this.#p.image(this.#labelsLayer, ...this.lSize);
    this.#p.image(this.#gridLayer, ...this.gSize);
    
    this.gridX = gx;
    this.gridY = gy;
    this.gridW = gw;
    this.gridH = gh;
    
  }
  
  draw() {
    this.#p.image(this.#labelsLayer, ...this.lSize);
    this.#p.image(this.#gridLayer, ...this.gSize);
    
  }
}


const sketch = (p) => {
  let w = p.windowWidth;
  let h = p.windowHeight;
  
  let osc;
  const baseFreq = 440;
  
  let fft;
  let bgColor;
  let bgDrawColor;
  
  const pg = new GridAndLabels(p);
  
  
  

  p.setup = () => {
    // put setup code here
    soundReset();
    
    p.createCanvas(w, h);
    p.colorMode(p.HSL, 1, 1, 1);
    
    bgColor = [0,0,0.25];
    bgDrawColor = [...bgColor, 0.05];
    p.background(...bgColor);
    
    
    // sound
    osc = new p5.Oscillator();
    osc.setType('sine');
    const rFrq = baseFreq * p.random();
    osc.freq(baseFreq + rFrq);
    osc.amp(0.4);
    osc.start();
    
    window._cacheSounds = [osc, ];
    
    fft = new p5.FFT();
    pg.setup()
  };

  p.draw = () => {
    // put drawing code here
    //p.blendMode(p.SCREEN);
    p.background(...bgColor);
    pg.draw();
    //p.blendMode(p.BLEND);
    
    const spectrum = fft.analyze();
    //p.noFill();
    p.beginShape();
    // 今後break したい為
    for (const [index, amplitude] of Object.entries(spectrum)) {
      const x = p.map(Math.log10(index), 0, Math.log10(spectrum.length), 0, w, true);
      const y = p.map(amplitude, 0, 255, h, 0);
      p.vertex(x, y);
    }
    p.vertex(0, h);
    p.endShape();
    
    
    
    
  };

  p.windowResized = (e) => {
    w = p.windowWidth;
    h = p.windowHeight;
    p.resizeCanvas(w, h);
  };
  

  function soundReset() {
    const actx = p.getAudioContext();
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
