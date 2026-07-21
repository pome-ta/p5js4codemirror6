class PointerTracker {
  #p;

  constructor(mainInstance) {
    this.#p = mainInstance;

    this.x = null;
    this.y = null;

    [this.click, this.start, this.move, this.end, this.isTouchDevice] = window.matchMedia('(hover: none)').matches
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
    this.x = 0 <= this.#p.mouseX && this.#p.mouseX <= this.#p.width ? this.#p.mouseX : null;
    this.y = 0 <= this.#p.mouseY && this.#p.mouseY <= this.#p.height ? this.#p.mouseY : null;
  }
}

const sketch = (p) => {
  const v = 360;
  let pt;

  p.setup = () => {
    // put setup code here
    p.createCanvas(v, v);
    p.colorMode(p.HSL, v, 1, 1);
    pt = new PointerTracker(p);
  };

  p.draw = () => {
    // put drawing code here
    p.background(p.frameCount % v, 1, 0.5);
    pt.updateXY();
    p.text(`x: ${pt.x}`, 20, 140);
    p.text(`y: ${pt.y}`, 20, 160);
  };
};

new p5(sketch);
