// loadModule.js

(function (root) {
  /**
   * preload フェーズで実行される関数の登録用
   * p5.js 実行時に自動で呼び出される
   */
  function registerPreloadMethod() {
    if (typeof p5 !== 'undefined' && typeof p5.prototype.registerMethod === 'function') {
      p5.prototype.registerMethod('preload', preloadModulesFromQueue);
    }
  }

  // モジュール読み込み待ちのキュー
  const moduleLoadQueue = [];

  // preload 時に呼び出される：順番に直列読み込み
  async function preloadModulesFromQueue() {
    for (const task of moduleLoadQueue) {
      try {
        const mod = await import(task.url);
        task.resolve(task.extract(mod));
      } catch (err) {
        task.reject(err);
      }
    }
    moduleLoadQueue.length = 0; // 消去
  }

  /**
   * モジュールを読み込み、preload 中に待機させる。
   * preload 外で呼ばれた場合は即 import 実行。
   *
   * @param {string} url - ESM モジュールの URL（例: 'https://esm.sh/dayjs'）
   * @param {(mod: any) => any} [extract] - 取得後の加工関数（default export を返すなど）
   * @returns {any} - preload 中は undefined、preload 後は同期的に取得できる
   *
   * @example
   * // preload 時に書く
   * function preload() {
   *   dayjs = loadModule('https://esm.sh/dayjs');
   * }
   */
  function loadModule(url, extract = m => m.default ?? m) {
    let result;
    const isPreloading = typeof window._isPreloading === 'boolean' ? window._isPreloading : true;

    if (isPreloading && typeof p5 !== 'undefined') {
      // p5 の preload フェーズ中であれば defer 処理
      moduleLoadQueue.push({
        url,
        extract,
        resolve: value => result = value,
        reject: err => {
          console.error(`Failed to load module: ${url}`, err);
        }
      });
    } else {
      // preload 外なら即時読み込み（async）
      import(url)
        .then(mod => {
          result = extract(mod);
        })
        .catch(err => {
          console.error(`Failed to load module: ${url}`, err);
        });
    }

    return result; // preload 中は undefined（p5 が preload 後に自動で更新）
  }

  // グローバルへ export（p5 global / instance mode 両対応）
  root.loadModule = loadModule;

  registerPreloadMethod();

})(typeof window !== 'undefined' ? window : this);
