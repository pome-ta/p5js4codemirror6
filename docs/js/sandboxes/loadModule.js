// loadModule.js
(function () {
  /**
   * preload 互換の空関数(何もしない)
   */
  function loadModule(path, callback) {
    // ここではまだ何もしないが、
    // p5.js に「これは preload 対象だよ」と伝えるために必要
    console.log(`loadModule: ${path}`)
  }

  // preload 対象として p5.js に登録する
  if (typeof p5 !== 'undefined' && typeof p5.prototype.registerPreloadMethod === 'function') {
    p5.prototype.registerPreloadMethod('loadModule', p5.prototype);
  }

  // グローバルモード用に公開
  if (typeof window !== 'undefined') {
    window.loadModule = loadModule;
  }
})();
