const createSourceHTML = (source) => {
  return `<!doctype html>
<html lang="ja">
  <head>
    <meta charset="utf-8">
    <meta name="viewport"
    content="width=device-width,initial-scale=1.0,minimum-scale=1.0,maximum-scale=1.0,user-scalable=no" />
    <!--<script type="module">
      import eruda from 'https://cdn.skypack.dev/eruda';
      eruda.init();
    </script>-->
    
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

    
  </head>
  <body>
    <script>${source}</script>
  </body>
</html>`;
}

export default createSourceHTML;
