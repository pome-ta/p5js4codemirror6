// loadModule.js

(function () {
  let _timestamp = Date.now();
  const _loadedModules = new Map();

  /**
   * ESMモジュールを動的に読み込む
   * @param {string} path
   * @returns {Promise<any>}
   */
  const _dynamicImportModule = async function (path) {
    const url = `${path}?ts=${_timestamp}`;
    if (_loadedModules.has(url)) {
      return _loadedModules.get(url);
    }
    const module = await import(url);
    _loadedModules.set(url, module);
    return module;
  };

  /**
   * preload 相当の loadModule()
   * @param {string|string[]} urls
   * @param {function(any|any[]):void} [callback]
   */
  const loadModule = function (urls, callback) {
    const urlList = Array.isArray(urls) ? urls : [urls];
    const self = this;

    const promises = urlList.map((url) => _dynamicImportModule(url));
    Promise.all(promises)
      .then((modules) => {
        const result = modules.length === 1 ? modules[0] : modules;
        if (typeof callback === 'function') {
          callback(result);
        }
      })
      .finally(() => {
        if (typeof self._decrementPreload === 'function') {
          self._decrementPreload();
        }
      });
  };

  // preload用の初期化フック
  p5.prototype.registerMethod('init', function () {
    _timestamp = Date.now(); // キャッシュバスターの更新
  });

  // preloadメソッドとして登録(p5.sound 互換)
  if (typeof p5.prototype.registerPreloadMethod === 'function') {
    p5.prototype.registerPreloadMethod('loadModule', p5.prototype);
  }

  // global mode 用
  if (typeof window !== 'undefined') {
    window.loadModule = loadModule;
  }
})();

