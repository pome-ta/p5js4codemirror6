
(function () {
  'use strict';

  if (typeof p5 === 'undefined') {
    console.error(
      'p5.js is not loaded. Please make sure to include p5.js before loadModule.js.'
    );
    return;
  }

  /**
   * @module p5
   * @submodule io
   */

  /**
   * ES Modules を動的にインポートします。
   *
   * @method loadModule
   * @param  {String}          path              インポートするモジュールのパス (URL)。
   * @param  {Function}        [successCallback] 成功時のコールバック。
   * @param  {Function}        [failureCallback] 失敗時のコールバック。
   * @return {Promise<Object>}                   解決されるとモジュールオブジェクトを返す Promise。
   *
   */
  p5.prototype.loadModule = function (path, successCallback, failureCallback) {
    const p5Inst = this;

    const isPreloading = p5Inst._preload_count > 0;

    if (isPreloading) {
      p5Inst._incrementPreload();
    }

    const promise = import(path);

    promise
      .then((module) => {
        if (typeof successCallback === 'function') {
          successCallback.call(p5Inst, module);
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
  };
})();
