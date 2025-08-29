// [p5.js-sound/examples/DelayNoiseEnvelope/sketch.js at main · processing/p5.js-sound · GitHub](https://github.com/processing/p5.js-sound/blob/main/examples/DelayNoiseEnvelope/sketch.js)

/**
 *  Example: p5.Delay w/ p5.Noise, p5.Envelope & p5.Amplitude
 *  
 *  Click the mouse to hear the p5.Delay process a Noise Envelope.
 *  
 *  MouseX controls the p5.Delay Filter Frequency.
 *  MouseY controls both the p5.Delay Time and Resonance.
 */
/**
 * 例: p5.Delay と p5.Noise、p5.Envelope、p5.Amplitude マウスをクリックすると、p5.Delay がノイズ エンベロープを処理する様子が聞こえます。
 *  
 *  MouseX は p5.Delay フィルター周波数を制御します。
 *  MouseY は、p5.Delay Time と Resonance の両方を制御します。
 */



const interactionTraceKitPath =
  '../../sketchBooks/modules/interactionTraceKit.js';

const sketch = (p) => {
  let w, h;

  let pointerTracker;
  let tapIndicator;
  
  let noise, env, analyzer, delay;

  p.preload = () => {
    p.loadModule(interactionTraceKitPath, (m) => {
      const { PointerTracker, TapIndicator } = m;
      pointerTracker = new PointerTracker(p);
      tapIndicator = new TapIndicator(p);
    });
  };

  p.setup = () => {
    // put setup code here
    w = p.windowWidth;
    h = p.windowHeight;

    p.canvas.addEventListener(pointerTracker.move, (e) => e.preventDefault(), {
      passive: false,
    });

    p.createCanvas(w, h);
    
    // other types include 'brown' and 'pink'
    // 他のタイプには'brown' と'pink' があります
    noise = new p5.Noise('white');
    
    // Turn down because we'll control .amp with a p5.Envelope
    // `.amp` をp5.Envelope で制御するので下げます
    noise.amp(0);
    noise.start();
    
    // so we will only hear the p5.Delay effect
    // p5.Delay効果のみが聞こえます
    noise.disconnect();
    
    
    delay = new p5.Delay();
    delay.process(noise, 0.12, 0.7, 2300); // tell delay to process noise

    // the Envelope ADSR: attackTime, decayTime, sustainLevel, releaseTime
    env = new p5.Envelope();
    env.setADSR(0.01, 0.2, 0.2, 0.1)
    env.setRange(1, 0);

    // p5.Amplitude will analyze all sound in the sketch
    analyzer = new p5.Amplitude();

    tapIndicator.setup();
  };


  p.draw = () => {
    // put drawing code here
    p.background(128);
    
    // get volume reading from the p5.Amplitude analyzer
    const level = analyzer.getLevel();
    // then use level to draw a green rectangle
    const levelHeight = p.map(level, 0, .4, 0, h);
    p.fill(100,250,100);
    p.rect(0, h, w, - levelHeight);
  
    // map mouseX and mouseY to p5.Delay parameters
    let filterFreq = p.map(p.mouseX, 0, w, 60, 15000);
    filterFreq = p.constrain(filterFreq, 60, 15000);
    
    let filterRes = p.map(p.mouseY, 0, h, 3, 0.01);
    filterRes = p.constrain(filterRes, 0.01, 3);
    delay.filter(filterFreq, filterRes);
    
    let delTime = p.map(p.mouseY, 0, w, 0.2, 0.01);
    delTime = p.constrain(delTime, 0.01, .2);
    delay.delayTime(delTime);
  };

  /*
  p.mousePressed = (e) => {
  };

  p.mouseReleased = (e) => {
  };
  */
  
  p.touchStarted = (e) => {
    env.play(noise, 0, 0.1, 0);
  };

  p.touchMoved = (e) => {};

  p.touchEnded = (e) => {
  };


  p.windowResized = (e) => {
    w = p.windowWidth;
    h = p.windowHeight;
    p.resizeCanvas(w, h);
  };
};

new p5(sketch);

