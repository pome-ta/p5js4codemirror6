//const title = 'Spectrum analyzer';

class PointerEventMapper {
  #p;

  constructor(mainInstance) {
    //const IS_TOUCH_DEVICE = window.matchMedia('(hover: none)').matches;
    this.#p = mainInstance;
    this.x = null;
    this.y = null;
    [this.click, this.start, this.move, this.end, this.isTouchDevice] =
      /iPhone|iPad|iPod|Android/.test(navigator.userAgent)
        ? ['click', 'touchstart', 'touchmove', 'touchend', true]
        : ['click', 'mousedown', 'mousemove', 'mouseup', false];
  }

  updateXY() {
    this.isTouchDevice ? this.#touchUpdate() : this.#mouseUpdate();
  }

  #touchUpdate() {
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

class TapMarkScreen {
  #p;
  #pg;

  constructor(mainInstance) {
    this.#p = mainInstance;
    this.#pg = null;
    this.onTap = false;
  }

  setup() {
    console.log('TapMarkScreen');
    this.#pg = this.#p.createGraphics(this.#p.width, this.#p.height);

    this.#p.image(this.#pg, 0, 0);
    // console.log(this.#p.touchStarted);
    this.#setUseHooks();
    // this.#useDraw();
  }

  #setUseHooks = () => {
    this.#useDraw();
    this.#useTouchEvents();
  };

  #drawHook = () => {
    console.log(this.onTap);
  };

  #touchStartedHook = (e) => {
    // console.log(e);
    console.log('touchStartedHook');
  };

  #touchMovedHook = (e) => {
    // console.log(e);
    console.log('touchMovedHook');
  };

  #touchEndedHook = (e) => {
    // console.log(e);
    console.log('touchEndedHook');
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
}

const sketch = (p) => {
  let w = p.windowWidth;
  let h = p.windowHeight;

  const pointerEvents = new PointerEventMapper(p);
  const tapMark = new TapMarkScreen(p);

  p.setup = () => {
    console.log('setup');
    // put setup code here
    p.canvas.addEventListener(pointerEvents.move, (e) => e.preventDefault(), {
      passive: false,
    });

    p.createCanvas(w, h);
    p.colorMode(p.RGB, 1);
    p.background(0.5);

    tapMark.setup();
  };
  p.draw = () => {
    // put drawing code here
    // console.log('draw')
    p.background(p.random());
  };

  p.touchStarted = (e) => {
    // console.log('main] touchStarted');
  };

  p.windowResized = (event) => {
    w = p.windowWidth;
    h = p.windowHeight;
    p.resizeCanvas(w, h);
  };
};

new p5(sketch);
