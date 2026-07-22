class TapIndicator {
  #p;
  #pg;
  #markSize;
  baseColorHSB = [0.3, 0.1, 0.9];

  constructor(p, markSize = 48) {
    this.#p = p;
    this.#markSize = markSize;

    this.#initGraphics();
    this.#hookDraw();
  }

  #hookDraw() {
    const originalDraw = this.#p.draw;
    this.#p.draw = (...args) => {
      /*
      if (typeof originalDraw === 'function') {
        originalDraw.apply(this.#p, args);
      }
      */
      typeof originalDraw === 'function' && originalDraw.apply(this.#p, args);
      this.#render();
    };
  }

  #initGraphics() {
    /*
    if (this.#pg) {
      this.#pg.remove();
    }
    */
    this.#pg && this.#pg.remove();
    this.#pg = this.#p.createGraphics(this.#p.width, this.#p.height);

    // スタイル設定(白の半透明 + 黒枠線)
    this.#pg.fill(255, 255, 255, 180);
    this.#pg.stroke(0, 0, 0, 220);
    this.#pg.strokeWeight(3);
    this.#pg.ellipseMode(this.#pg.CENTER);
  }

  // 毎フレーム p.draw() の直後に走る描画処理
  #render() {
    if (!this.#pg) return;

    // キャンバスリサイズ(p.resizeCanvas)への自動追従
    if (this.#pg.width !== this.#p.width || this.#pg.height !== this.#p.height) {
      this.#initGraphics();
    }

    this.#pg.clear();
    let hasInput = false;

    // 1. スマホ等のタッチ入力チェック (マルチタッチ対応)
    if (Array.isArray(this.#p.touches) && this.#p.touches.length > 0) {
      for (const touch of this.#p.touches) {
        if (this.#isInsideCanvas(touch.x, touch.y)) {
          this.#pg.circle(touch.x, touch.y, this.#markSize);
          hasInput = true;
        }
      }
    }
    // 2. PC等のマウス入力チェック (タッチがない場合)
    else if (this.#p.mouseIsPressed) {
      if (this.#isInsideCanvas(this.#p.mouseX, this.#p.mouseY)) {
        this.#pg.circle(this.#p.mouseX, this.#p.mouseY, this.#markSize);
        hasInput = true;
      }
    }

    // 入力がある場合のみメインキャンバスの最前面に転送
    hasInput && this.#p.image(this.#pg, 0, 0);
    /*
    if (hasInput) {
      this.#p.image(this.#pg, 0, 0);
    }
    */
  }

  #isInsideCanvas(x, y) {
    return x >= 0 && x <= this.#p.width && y >= 0 && y <= this.#p.height;
  }

  destroy() {
    if (this.#pg) {
      this.#pg.remove();
      this.#pg = null;
    }
  }
}

const sketch = (p) => {
  const v = 360;
  let tapIndicator;

  p.setup = () => {
    //p.noCanvas();
    // put setup code here
    p.createCanvas(v, v);
    p.colorMode(p.HSL, v, 1, 1);

    tapIndicator = new TapIndicator(p);
  };

  p.draw = () => {
    // put drawing code here
    //p.background(p.frameCount % v, 1, 0.5);
    //tapIndicator.destroy()
  };
};

new p5(sketch);
