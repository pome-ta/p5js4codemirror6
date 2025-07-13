const erudaScript = `<script type="module">
      import eruda from 'https://esm.sh/eruda';
      eruda.init();

      
      const timeStr = new Date().toLocaleTimeString();
      const outLog = 'p5Canvas: ' + timeStr;
      console.log(outLog);
    </script>`;

const createSourceHTML = (source, debug = false) => {
  return `<!doctype html>
<html lang="ja">
  <head>
    <meta charset="utf-8">
    <meta name="viewport"
    content="width=device-width,initial-scale=1.0,minimum-scale=1.0,maximum-scale=1.0,user-scalable=no" />
    
    ${debug ? erudaScript : ''}
    
    <script src="https://unpkg.com/p5@1.11.8/lib/p5.js"></script>
    <script src="https://unpkg.com/p5@1.11.8/lib/addons/p5.sound.js"></script>

    <style>
      html, body {
        margin: 0;
        padding: 0;
      }
      canvas {
        display: block;
      }
    </style>

    
  </head>
  <body>
    <script id="p5script" defer>
      ${
    source
  };
    </script>
  </body>
</html>`;
};

export default createSourceHTML;