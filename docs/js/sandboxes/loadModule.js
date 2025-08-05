(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define('loadModule', ['p5'], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory(require('p5'));
  } else {
    factory(root.p5);
  }
}(this, function(p5) {
  p5.prototype.loadModule = function(pathOrPaths, onSuccess, onError) {
    const p = this;
    const paths = Array.isArray(pathOrPaths) ? pathOrPaths : [pathOrPaths];
    const results = [];
    let remaining = paths.length;

    p._incrementPreload();

    paths.reduce((chain, path, index) => {
      return chain.then(() => import(path).then((mod) => {
        results[index] = mod;
        remaining--;
        if (remaining === 0) {
          p._decrementPreload();
          if (onSuccess) onSuccess(...results);
        }
      }).catch((err) => {
        p._decrementPreload();
        if (onError) onError(err);
      }));
    }, Promise.resolve());

    return null; // preload用関数の戻り値としてはnullで問題ない
  };
}));

