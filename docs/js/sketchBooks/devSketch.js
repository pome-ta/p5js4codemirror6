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
  #pointerEvent;
  #markSize;
  #pgColor;

  baseColorHSB = [0.5, 0.7, 0.6];


  constructor(mainInstance, markSize = 48) {
    this.#p = mainInstance;
    this.#pg = null;
    this.#pointerEvent = new PointerEventMapper(mainInstance);
    this.#markSize = markSize;

    this.onTap = null;
  }

  setup() {
    this.#pg = this.#p.createGraphics(this.#p.width, this.#p.height);

    this.#pg.colorMode(this.#pg.HSB, 1.0, 1.0, 1.0, 1.0);
    this.#pgColor = this.#pg.color(...this.baseColorHSB);
    this.#pgColor.setAlpha(0.5);
    this.#pg.fill(this.#pgColor);
    this.#pg.noStroke();

    this.#pg.ellipseMode(this.#pg.CENTER);
    this.#pg.rectMode(this.#pg.RADIUS);


    // this.#p.image(this.#pg, 0, 0);
    this.onTap = false;
    this.#setUseHooks();
  }

  #showMark = () => {
    // this.#pg.erase();
    this.#pg.circle(this.#pointerEvent.x, this.#pointerEvent.y, this.#markSize);
    // this.#pg.noErase();
    this.#p.image(this.#pg, 0, 0);

  };


  #drawHook = () => {
    // console.log(this.onTap);
    // console.log(this.#pg)
    // this.#pg.remove();
    // this.#pg.remove();
    this.#pg.clear();
    this.#pg.reset();
    //console.log(this.#pg)

    //this.#pg.remove();
    //this.#pg.background(1.0, 1.0, 1.0, 1.0);
    //this.#pg.background(1.0, 1.0, 1.0, 0.0);
    // console.log(this.#pg.canvas)
    // this.#p.image(this.#fb, 0, 0);
    this.#pg.erase(255,255);
    this.#pg.rect(this.#p.width/2, this.#p.height/2, this.#p.width/2, this.#p.height/2);
    this.#pg.noErase();


    if (!this.onTap) {
      return;
    }
    // this.#pg.clear();
    // this.#pg = this.#p.createGraphics(this.#p.width, this.#p.height);
    // console.log('d');
    this.#showMark();


  };

  #touchStartedHook = (e) => {
    this.onTap = true;

    this.#pointerEvent.updateXY();
    //this.#pg.clear();
    // this.#drawHook();

  };

  #touchMovedHook = (e) => {
    // console.log(e);
    // console.log('touchMovedHook');
    this.#pointerEvent.updateXY();
    //this.#pg.clear();
    // this.#drawHook();

  };

  #touchEndedHook = (e) => {
    // console.log(e);
    // console.log('touchEndedHook');
    this.onTap = false;

    this.#pointerEvent.updateXY();
    //this.#pg.clear();
    // this.#showMark();

  };

  #setUseHooks = () => {
    this.#useDraw();
    this.#useTouchEvents();
  };

  #useDraw() {
    const instance = this;
    const originalFunction = instance.#p.draw;

    instance.#p.draw = function (...args) {
      //instance.#pg.clear();
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
        ? (e) => {
        }
        : instance.#p.touchStarted;
    instance.#p.touchStarted = function (...args) {
      const result = touchStartedFunction.apply(this, args);
      instance.#touchStartedHook(args);
      return result;
    };

    // touchMoved
    const touchMovedFunction =
      instance.#p.touchMoved === void 0
        ? (e) => {
        }
        : instance.#p.touchMoved;
    instance.#p.touchMoved = function (...args) {
      const result = touchMovedFunction.apply(this, args);
      instance.#touchMovedHook(args);
      return result;
    };

    // touchEnded
    const touchEndedFunction =
      instance.#p.touchEnded === void 0
        ? (e) => {
        }
        : instance.#p.touchEnded;
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
  const v = 360;

  const pointerEvents = new PointerEventMapper(p);
  const tapMark = new TapMarkScreen(p);

  p.setup = () => {
    // put setup code here
    p.canvas.addEventListener(pointerEvents.move, (e) => e.preventDefault(), {
      passive: false,
    });
    p.frameRate(10);

    p.createCanvas(w, h);

    p.colorMode(p.HSL, v, 1, 1);
    // p.background(p.frameCount % v, 1, 0.25);



    tapMark.setup();
  };
  p.draw = () => {
    // put drawing code here
    // p.background(p.frameCount % v, 1, 0.25);
    // console.log('draw');
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
