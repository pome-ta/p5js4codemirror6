(function () {
  'use strict';

  if (typeof p5 === 'undefined') {
    console.error(
      'p5.js is not loaded. Please make sure to include p5.js before loadModule.js.'
    );
    return;
  }

  p5.prototype.registerMethod('init', function () {
    const _p = this;
    // preloadメソッドの登録
    p5.prototype.registerPreloadMethod('loadModule', p5.prototype);

    // 非同期ロード処理を定義する
    p5.prototype.loadModule = function (
      path,
      successCallback,
      failureCallback
    ) {
      const _promise = _loadModule(path, successCallback, failureCallback);
      _promise.then(() => {
        _p._decrementPreload(); // これを忘れると setup() が動かない。
      });
    };
  });

  const _loadModule = function (path, successCallback, failureCallback) {
    const _p = this;

    const _msTime = Date.now(); // Cache回避のために現在ミリ秒を取得する
    const _url = `${path}?ts=${_msTime}`; // Cache回避対策
    const promise = import(_url);

    promise
      .then((module) => {
        if (typeof successCallback === 'function') {
          successCallback.call(_p, module);
        }
      })
      .catch((err) => {
        if (typeof failureCallback === 'function') {
          failureCallback.call(_p, err);
        } else {
          console.error(err);
        }
      });

    return promise;
  };
})();
