import p5Origin from 'p5/';
import DomFactory from '../utils/domFactory.js';

window._p5Instance = null;

function importRefresh() {

  class p5 extends p5Origin {
    constructor(sketch, node) {
      super(sketch, node);
      window._p5Instance = this;
    }
  }

  window.p5 = p5;

}

function runSketch(code) {
  if (window._p5Instance) {
    window._p5Instance.remove();
    window._p5Instance = null;
  }
  importRefresh();


  const script = DomFactory.create('script', {
    setAttrs: {
      // id: 'p5SourceScript',
      type: 'text/javascript',
    },
    // xxx: スコープを切る
    textContent: `{
      ${code}
    }`,
    appendParent: document.body,
  });

  if (window._p5Instance === null) {
    try {
      window._p5Instance = new p5();
    } catch (e) {
      console.log('Error: ' + e.message);
    }
  }

  document.body.removeChild(script);
}

window.addEventListener('message', (e) => {
  const sourceCode = e.data;
  runSketch(sourceCode);
});

importRefresh();
// await import('p5/lib/addons/p5.sound');

// window._p5Instance = null;
//
// window.__p5 = window.p5;
// delete window.p5;
//
// class p5 extends window.__p5 {
//   constructor(sketch, node) {
//     super(sketch, node);
//     window._p5Instance = this;
//   }
// }
//
// window.p5 = p5;
// delete window.__p5;
