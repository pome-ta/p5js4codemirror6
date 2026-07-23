
import TapIndicator from '../../sketchBooks/modules/TapIndicator.js';

const sketch = (p) => {
  let tapIndicator = new TapIndicator(p);

  let sound;
  let amp;
  

  //p.setup = async () => {
  p.setup = () => {
    // put setup code here
    //tapIndicator = new TapIndicator(p);

    p.createCanvas(400, 400);
    p.textAlign(p.CENTER);
    p.fill(25);



    p.describe('The color of the background changes based on the amplitude of the sound.');
  };

  p.draw = () => {
    // put drawing code here
  };

};

new p5(sketch);

