//[p5js4codemirror6/docs/js/sketchBooks/250720_2236.js at main · pome-ta/p5js4codemirror6 · GitHub](https://github.com/pome-ta/p5js4codemirror6/blob/main/docs/js/sketchBooks/250720_2236.js)


//const title = 'LFO';

class PointerTracker {
  #p;

  constructor(mainInstance) {
    this.#p = mainInstance;

    this.x = null;
    this.y = null;

    [this.click, this.start, this.move, this.end, this.isTouchDevice] =
      window.matchMedia('(hover: none)').matches
        ? ['click', 'touchstart', 'touchmove', 'touchend', true]
        : ['click', 'mousedown', 'mousemove', 'mouseup', false];
  }

  updateXY() {
    this.isTouchDevice ? this.#touchUpdate() : this.#mouseUpdate();
  }

  #touchUpdate() {
    // xxx: 最初の指だけなら`[0]`、マルチなら座標並列
    for (let touch of this.#p.touches) {
      this.x = 0 <= touch.x && touch.x <= this.#p.width ? touch.x : null;
      this.y = 0 <= touch.y && touch.y <= this.#p.height ? touch.y : null;
    }
  }

  #mouseUpdate() {
    if (!this.#p.mouseIsPressed) {
      this.x = null;
      this.y = null;
      return;
    }
    this.x =
      0 <= this.#p.mouseX && this.#p.mouseX <= this.#p.width
        ? this.#p.mouseX
        : null;
    this.y =
      0 <= this.#p.mouseY && this.#p.mouseY <= this.#p.height
        ? this.#p.mouseY
        : null;
  }
}

class TapIndicator {
  #p;
  #pg;
  #pointerTracker;
  #markSize;
  #pgColor;

  baseColorHSB = [0.0, 0.0, 1.0];

  constructor(mainInstance, markSize = 48) {
    this.#p = mainInstance;
    this.#pg = null;
    this.#pointerTracker = new PointerTracker(mainInstance);
    this.#markSize = markSize;

    this.isTapped = null;
  }

  setup() {
    this.isTapped = false;

    this.#initCreateGraphics();
    this.#setUseHooks();
  }

  #initCreateGraphics = () => {
    this.#pg && this.#pg.remove();
    this.#pg = this.#p.createGraphics(this.#p.width, this.#p.height);

    this.#pg.colorMode(this.#pg.HSB, 1.0, 1.0, 1.0, 1.0);
    this.#pgColor = this.#pg.color(...this.baseColorHSB);
    this.#pgColor.setAlpha(0.5);
    this.#pg.fill(this.#pgColor);
    this.#pg.noStroke();

    this.#pg.ellipseMode(this.#pg.CENTER);
  };

  #showMark = () => {
    this.#pg.circle(
      this.#pointerTracker.x,
      this.#pointerTracker.y,
      this.#markSize
    );
    this.#p.image(this.#pg, 0, 0);
  };

  #drawHook = () => {
    this.#pg.clear();
    if (
      !this.isTapped ||
      this.#pointerTracker.x === null ||
      this.#pointerTracker.y === null
    ) {
      return;
    }
    this.#showMark();
  };

  #touchStartedHook = (e) => {
    this.isTapped = true;
    this.#pointerTracker.updateXY();
  };
  #touchMovedHook = (e) => {
    this.#pointerTracker.updateXY();
  };
  #touchEndedHook = (e) => {
    this.isTapped = false;
    // xxx: `ended` 判定で`null` が取れるが必要か?
    this.#pointerTracker.updateXY();
  };

  #setUseHooks = () => {
    this.#useDraw();
    this.#useTouchEvents();
    this.#useWindowResized();
  };

  #useDraw() {
    const instance = this;
    const originalFunction = instance.#p.draw;

    instance.#p.draw = function (...args) {
      const result = originalFunction.apply(this, args);
      instance.#drawHook();
      return result;
    };
  }

  #useTouchEvents() {
    const instance = this;

    // touchStarted
    const touchStartedFunction =
      instance.#p.touchStarted === void 0
        ? (e) => {}
        : instance.#p.touchStarted;
    instance.#p.touchStarted = function (...args) {
      const result = touchStartedFunction.apply(this, args);
      instance.#touchStartedHook(args);
      return result;
    };

    // touchMoved
    const touchMovedFunction =
      instance.#p.touchMoved === void 0 ? (e) => {} : instance.#p.touchMoved;
    instance.#p.touchMoved = function (...args) {
      const result = touchMovedFunction.apply(this, args);
      instance.#touchMovedHook(args);
      return result;
    };

    // touchEnded
    const touchEndedFunction =
      instance.#p.touchEnded === void 0 ? (e) => {} : instance.#p.touchEnded;
    instance.#p.touchEnded = function (...args) {
      const result = touchEndedFunction.apply(this, args);
      instance.#touchEndedHook(args);
      return result;
    };
  }

  #useWindowResized() {
    const instance = this;
    const originalFunction =
      instance.#p.windowResized === void 0
        ? (e) => {}
        : instance.#p.windowResized;
    instance.#p.windowResized = function (...args) {
      const result = originalFunction.apply(this, args);
      instance.#initCreateGraphics();
      return result;
    };
  }
}

const sketch = (p) => {
  let w = p.windowWidth;
  let h = p.windowHeight;
  const v = 360;

  const pointerTracker = new PointerTracker(p);
  const tapIndicator = new TapIndicator(p);

  let osc;
  let lfo;
  let fft;
  
  let maxNum = 0;
  let minNum = 99999;

  const baseFreq = 440;

  const sampleRate = p.sampleRate();

  p.setup = () => {
    // put setup code here
    soundReset();
    p.canvas.addEventListener(pointerTracker.move, (e) => e.preventDefault(), {
      passive: false,
    });

    p.createCanvas(w, h);
    p.colorMode(p.HSL, v, 1, 1);
    //p.background(p.frameCount % v, 1, 0.25);
    p.background(0, 0, 0.25);
    //p.frameRate(23);

    // sound
    osc = new p5.Oscillator(baseFreq, 'sine');
    osc.amp(0.4);
    //osc.start();

    lfo = new p5.Oscillator(0.3, 'sine'); // 速さ
    lfo.amp(129); // 幅
    lfo.start();
    osc.start();

    lfo.disconnect();
    lfo.connect(osc.freqNode);
    

    // todo: どれを格納するか要精査
    window._cacheSounds = [osc, lfo];
    fft = new p5.FFT();

    // label
    p.textAlign(p.CENTER, p.CENTER);
    p.textSize(32);

    tapIndicator.setup();
    console.log(p.soundOut.output);
  };

  p.draw = () => {
    // put drawing code here

    let spectrum = fft.analyze();
    const centroid = calcSpectralCentroid(spectrum);
    maxNum = Math.max(maxNum, centroid);
    minNum = Math.min(minNum === 0 ? centroid : minNum, centroid);
    

    //p.background(p.frameCount % v, 1, 0.25);
    p.background(0, 0, 0.25);
    p.fill(0.0, 0.0, 0.8);
    p.text(`${minNum.toFixed(2)}\n${centroid.toFixed(2)}\n${maxNum.toFixed(2)}`, p.width / 2, p.height / 2);
  };

  function calcSpectralCentroid(spectrumArray) {
    const binWidth = sampleRate / 2 / spectrumArray.length;

    let sumEnergy = 0;
    let weightedSum = 0;

    spectrumArray.forEach((energy, idx) => {
      const freq = idx * binWidth;
      sumEnergy += energy;
      weightedSum += freq * energy;
    });

    return sumEnergy > 0 ? weightedSum / sumEnergy : 0;
  }

  function soundReset() {
    window._cacheSounds?.forEach((s) => {
      s.stop();
      s.disconnect();
    });
    p.userStartAudio();
  }

  p.windowResized = (e) => {
    w = p.windowWidth;
    h = p.windowHeight;
    p.resizeCanvas(w, h);
  };
};

new p5(sketch);
