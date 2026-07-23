// [p5.sound.js/examples/002-Amplitude-VisualizingLoudness/sketch.js at main · processing/p5.sound.js · GitHub](https://github.com/processing/p5.sound.js/blob/main/examples/002-Amplitude-VisualizingLoudness/sketch.js)
let sound, amp;

async function setup() {
  sound = loadSound('https://tonejs.github.io/audio/berklee/gong_1.mp3');
  
  console.log(sound)
  createCanvas(400, 400);
  textAlign(CENTER);
  fill(25);

  amp = new p5.Amplitude();
  sound.connect(amp);

  describe('The color of the background changes based on the amplitude of the sound.');
}
 
function mousePressed() {
  sound.play();
}
 
function draw() {
  let level = amp.getLevel();
  level = map(level, 0, 0.2, 0, 255);
  background(level, 0, 0);
  text('click to play', width/2, height/2);
}

/*
import TapIndicator from '../../sketchBooks/modules/TapIndicator.js';

const sketch = (p) => {
  let tapIndicator;

  let sound;
  let amp;
  

  p.setup = async () => {
    // put setup code here
    tapIndicator = new TapIndicator(p);

    sound = p.loadSound('https://tonejs.github.io/audio/berklee/gong_1.mp3');
    console.log(sound)
    p.createCanvas(400, 400);
    p.textAlign(p.CENTER);
    p.fill(255);

    amp = new p5.Amplitude();
    sound.connect(amp);

    p.describe('The color of the background changes based on the amplitude of the sound.');
  };

  p.draw = () => {
    // put drawing code here
    let level = amp.getLevel();
    level = p.map(level, 0, 0.2, 0, 255);
    p.background(level, 0, 0);
    p.text('click to play', p.width/2, p.height/2);
  };
  
  p.mousePressed = () => {
  sound.play();
}


};

new p5(sketch);
*/
