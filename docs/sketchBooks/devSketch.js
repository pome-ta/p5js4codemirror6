// --- # example: DOM 要素

import * as Tone from 'tone';

import TapIndicator from 'modules/TapIndicator.js';
import SpectrumAnalyzer from 'modules/SpectrumAnalyzer.js';

const sketch = (p) => {
  // --- Plugins
  const tapIndicator = new TapIndicator(p);
  const spectrumAnalyzer = new SpectrumAnalyzer(p, 2048);

  // --- Tone.js
  const ctx = p.getAudioContext();
  Tone.setContext(ctx);
  const BPM = Tone.getTransport().bpm;

  // --- Sketch
  let cnvs;
  let w = p.windowWidth;
  let h = p.windowHeight;

  let bpm = 92;
  const minTempo = 60;
  const maxTempo = 360;

  let domContainer;
  let titleBPM;
  let valueBPM;
  let ctrContainer;
  let plusBtn;
  let minusBtn;
  let slider;

  p.setup = () => {
    // put setup code here
    cnvs = p.createCanvas(w, h);

    BPM.value = bpm;

    const click = new Tone.Synth({
      oscillator: { type: 'sine' },
    }).toDestination();
    const seq = new Tone.Sequence(
      (time, noteNum) => {
        click.triggerAttackRelease(`A${noteNum}`, '32n', time);
      },
      [5, 4, 4, 4],
      '4n',
    ).start(0);
    Tone.getTransport().start();

    domContainer = p.createDiv();
    domContainer
      //.style('background-color', 'lightblue')
      .style('font-family', 'monospace')
      .style('text-align', 'center');
    //   .style('margin', '2rem');
    //   .style('align-items', 'center');

    titleBPM = p.createDiv();
    titleBPM.parent(domContainer);
    titleBPM.html(`BPM`);

    valueBPM = p.createP(zeroPadValue(bpm));
    valueBPM.style('font-size', '1.25rem');
    valueBPM.parent(titleBPM);

    minusBtn = p.createButton('-', '-1');
    //minusBtn.style('width', '100%').style('height', '100%');
    minusBtn.style('font-size', '4rem');
    plusBtn = p.createButton('+', '1');
    minusBtn.mouseReleased(handleButtonClick);
    plusBtn.mouseReleased(handleButtonClick);

    slider = p.createSlider(minTempo, maxTempo, bpm);
    slider.style('width', '100%');
    slider.input(onSliderInput);

    ctrContainer = p.createDiv();
    ctrContainer.parent(domContainer);
    ctrContainer
      //.style('background-color', 'magenta')
      .style('display', 'grid')
      .style('grid-template-columns', 'auto 1fr auto')
      .style('gap', '1rem')
      .style('align-items', 'center')
      .style('margin', '1rem 0');

    minusBtn.parent(ctrContainer);
    slider.parent(ctrContainer);
    plusBtn.parent(ctrContainer);

    const btns = [minusBtn, plusBtn];

    const btnMaxSize = [...btns]
      //   .flatMap((btn) => [btn.size?.().width ?? 0, btn.size?.().height ?? 0])
      .flatMap((btn) => {
        //btn.style('width', '100%').style('height', '100%');
        //btn.style('font-size', '4rem');
        return [btn.width ?? 0, btn.height ?? 0];
      })
      .reduce((max, val) => Math.max(max, val), -Infinity);

    btns.forEach((btn) => {
      //btn.size(btnMaxSize, btnMaxSize);
      btn.style('border-radius', '50%')
      
    });

    tapIndicator.setup();
    spectrumAnalyzer.targetNodes(click);

    domSetLayout();

    //p.noLoop();
  };

  p.draw = () => {
    // put drawing code here
    p.background(80);
    p.rect(0, 0, w / 2, h / 2);
    spectrumAnalyzer.drawGraph();
  };

  p.windowResized = (e) => {
    console.log('windowResized');
    w = p.windowWidth;
    h = p.windowHeight;
    cnvs = p.resizeCanvas(w, h);
    domSetLayout();
  };

  const domSetLayout = () => {
    console.log('layout');
    console.log(minusBtn);
    console.log('--- minusBtn');
    console.log(minusBtn.width);
    console.log(minusBtn.size().width);
    console.log(minusBtn.height);
    console.log(minusBtn.size().height);
    console.log('--- plusBtn');
    console.log(plusBtn.width);
    console.log(plusBtn.size().width);
    console.log(plusBtn.height);
    console.log(plusBtn.size().height);
    console.log(plusBtn.size());

    // const btnMaxSize = [minusBtn, plusBtn]
    //   .flatMap(Object.values)
    //   .reduce((max, val) => Math.max(max, val), -Infinity);
    // console.log(btnMaxSize);

    // const btns = [minusBtn, plusBtn];

    // const btnMaxSize = [...btns]
    //   //   .flatMap((btn) => [btn.size?.().width ?? 0, btn.size?.().height ?? 0])
    //   .flatMap((btn) => [btn.width ?? 0, btn.height ?? 0])
    //   .reduce((max, val) => Math.max(max, val), -Infinity);

    // btns.forEach((btn) => btn.size(btnMaxSize, btnMaxSize));
    // console.log(btnMaxSize);
    domContainer.size(w * 0.8, '100%');

    const cw = domContainer.size().width;
    const ch = domContainer.size().height;

    console.log('--- width');
    console.log(domContainer.width);
    console.log(domContainer.size().width);
    console.log('--- height');
    console.log(domContainer.height);
    console.log(domContainer.size().height);

    domContainer.position(w / 2 - cw / 2, h / 2 - ch / 2);

    // btns.forEach((btn) => btn.size(btnMaxSize *2, btnMaxSize*2));
  };

  function onSliderInput() {
    bpm = Math.min(Math.max(this.value()), maxTempo);
    valueBPM.html(zeroPadValue(bpm));
    BPM.value = bpm;
  }

  function handleButtonClick() {
    const delta = Math.trunc(Number(this.value())) ?? 0;
    bpm = Math.min(Math.max(bpm + delta, minTempo), maxTempo);
    valueBPM.html(zeroPadValue(bpm));
    BPM.value = bpm;
  }

  const zeroPadValue = (value) => `${String(value).padStart(3, '0')}`;
};

new p5(sketch);
