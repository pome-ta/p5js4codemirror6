import DomFactory from '../utils/domFactory.js';

console.log(`[sandbox] top`);

function runSketch(code, isInstanceMode) {
  const script = DomFactory.create('script', {
    setAttrs: {
      type: isInstanceMode ? 'module' : 'text/javascript',
    },
    // xxx: スコープを切る
    textContent: isInstanceMode ? `${code}` : `{\n${code}\n}`,
    appendParent: document.body,
  });

  isInstanceMode ? null : new p5();
  // document.body.removeChild(script);
}

window.addEventListener('message', (e) => {
  const sourceCode = e.data.code;
  const isInstance = e.data.isInstanceMode;

  runSketch(sourceCode, isInstance);
});
