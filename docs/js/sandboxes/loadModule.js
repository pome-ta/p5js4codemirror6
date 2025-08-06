
(function () {
  'use strict';

  if (typeof p5 === 'undefined') {
    console.error(
      'p5.js is not loaded. Please make sure to include p5.js before loadModule.js.'
    );
    return;
  }
  
  const p5Inst = this;


  p5.prototype.registerMethod('init', function () {
    // preloadメソッドの登録
    p5.prototype.registerPreloadMethod('loadModule', p5.prototype);
    

    // 非同期ロード処理を定義する
    p5.prototype.loadModule = function (path, successCallback, failureCallback) {
      const _promise = _loadModule(path, successCallback, failureCallback);
      _promise.then(() => {
        p5Inst._decrementPreload(); // これを忘れると setup() が動かない。
      });
    }

  });
  
  const _loadModule = function (path, successCallback, failureCallback) {
    const _msTime = Date.now(); // Cache回避のために現在ミリ秒を取得する
    const _url = `${path}?ts=${_msTime}`; // Cache回避対策
    const promise = import(_url);
    
    promise
      .then((module) => {
        if (typeof successCallback === 'function') {
          successCallback.call(p5Inst, module);
          console.log('aaa')
        }
      })
      .catch((err) => {
        if (typeof failureCallback === 'function') {
          failureCallback.call(p5Inst, err);
        } else {
          console.error(err);
        }
      })
      .finally(() => {
        if (isPreloading) {
          p5Inst._decrementPreload();
        }
      });

    return promise;
  }

  
})();

