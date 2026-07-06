import DomFactory from '../utils/domFactory.js';

async function runSketch(code) {
  if (window._p5Instance) {
    // 拡張した remove() が呼ばれ、フェードアウトと停止処理が走る
    window._p5Instance.remove();
    window._p5Instance = null;
   
    // クリックノイズ防止のため、フェードアウトが完了するまで少し待つ
    await new Promise(resolve => setTimeout(resolve, 50));
  }

  const script = DomFactory.create('script', {
    setAttrs: {
      type: 'text/javascript',
    },
    textContent: `{
      // ボリュームを元に戻す処理を自動挿入
      if (typeof masterVolume === 'function') { masterVolume(1.0); }
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

/*
function runSketch(code) {
  if (window._p5Instance) {
    window._p5Instance.remove();
    window._p5Instance = null;
  }

  const script = DomFactory.create('script', {
    setAttrs: {
      // id: 'p5SourceScript',
      type: 'text/javascript',
      //type: 'defer',
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
*/

window.addEventListener('message', (e) => {
  const sourceCode = e.data;
  runSketch(sourceCode);
});

window._p5Instance = null;

window.__p5 = window.p5;
delete window.p5;

class p5 extends window.__p5 {
  constructor(sketch, node) {
    super(sketch, node);
    window._p5Instance = this;
  }
}

window.p5 = p5;
delete window.__p5;
