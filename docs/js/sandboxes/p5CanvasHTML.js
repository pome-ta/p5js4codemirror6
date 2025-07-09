const erudaScript = `<script type="module">
      import eruda from 'https://cdn.skypack.dev/eruda';
      eruda.init();
      
      const timeStr = new Date().toLocaleTimeString();
      const outLog = 'p5Canvas: ' + timeStr;
      console.log(outLog);
    </script>`;

const buildScript = `<script>
window._p5Instance = null;
window.__p5 = window.p5;

//window.p5 = null;

class p5 extends window.__p5 {
  constructor(sketch, node) {
    super(sketch, node);
    window._p5Instance = this;
  }
}

window.p5 = p5;


document.addEventListener('DOMContentLoaded', () => {
  window.addEventListener('message', (e) => {
    console.log(e)
  });
});



</script>`;

const createSourceHTML = (source, debug = false) => {
  return `<!doctype html>
<html lang="ja">
  <head>
    <meta charset="utf-8">
    <meta name="viewport"
    content="width=device-width,initial-scale=1.0,minimum-scale=1.0,maximum-scale=1.0,user-scalable=no" />
    
    ${debug ? erudaScript : ''}
    
    <script src="https://cdn.jsdelivr.net/npm/p5@1.11.5/lib/p5.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.11.3/addons/p5.sound.min.js"></script>

    <style>
      html, body {
        margin: 0;
        padding: 0;
      }
      canvas {
        display: block;
      }
    </style>
    
    ${buildScript}
    
  </head>
  <body>

    <script id="p5script" defer>${source};</script>

  </body>
</html>`;
};

export default createSourceHTML;
