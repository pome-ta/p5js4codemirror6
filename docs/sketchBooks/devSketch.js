import TapIndicator from 'modules/TapIndicator.js';

const sketch = (p) => {
  let tapIndicator;
  
  let cnvs;
  let w = p.windowWidth;
  let h = p.windowHeight;
  
  const v = 360;
  
  let mainTone;
  let lfo;
  let subTone;

  p.setup = () => {
    // put setup code here
    tapIndicator = new TapIndicator(p);

    cnvs = p.createCanvas(w, h);
    cnvs.mouseReleased(p.userStartAudio);
    
    p.colorMode(p.HSL, v, 1, 1);
    
    
    const types = ['sine', 'triangle', 'sawtooth', 'square'];
    
    mainTone = new p5.Oscillator(440 + p.random() * 440, types[3]);
    mainTone.amp(0.4);
    mainTone.start();
    

    
    console.log(mainTone)
    //console.log(mainTone.amp)
    //node.frequency
    
    
    lfo = new p5.Oscillator(0.5, 'sine'); // 速さ
    lfo.amp(5); // 幅
    lfo.start();
    lfo.disconnect();
    lfo.connect(mainTone.output);
    


  };

  p.draw = () => {
    // put drawing code here
    p.background(p.frameCount % v, 1, 0.5);
  };
  
  p.windowResized = (e) => {
    //console.log('windowResized');
    w = p.windowWidth;
    h = p.windowHeight;
    cnvs = p.resizeCanvas(w, h);
  };
};

new p5(sketch);
