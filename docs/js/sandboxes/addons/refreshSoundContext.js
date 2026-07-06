(function () {
  'use strict';

  if (typeof p5 === 'undefined') {
    console.error('p5.js is not loaded.');
    return;
  }

  // p5.jsの標準メソッドである remove を拡張して、音のクリーンアップを挟む
  const originalRemove = p5.prototype.remove;

  p5.prototype.remove = function () {
    // 1. コード書き換え時の「ブツッ」というポップノイズを防ぐためのフェードアウト
    try {
      if (typeof this.outputVolume === 'function') {
        this.outputVolume(0, 0.05); // 0.05秒かけてマスターを無音にする
      }
    } catch(e) {
      console.warn("outputVolume fade failed", e);
    }

    // 2. 音声関連の破棄(v2系は内部管理が綺麗なため、公式のdisposeSoundを信じて任せる)
    if (typeof this.disposeSound === 'function') {
      try {
        this.disposeSound();
      } catch(e) {
        console.warn("disposeSound failed", e);
      }
    }

    // 3. 本来のインスタンス破棄処理(Canvas等の削除)を実行
    originalRemove.call(this);
  };

  // ライブコーディングで新しいスケッチが起動した際、フェードアウトしたボリュームを元に戻す
  p5.prototype.registerMethod('beforeSetup', function() {
    if (typeof this.outputVolume === 'function') {
      this.outputVolume(1.0);
    }
  });

})();


/*

(function () {
  'use strict';

  if (typeof p5 === 'undefined') {
    console.error('p5.js is not loaded. Please make sure to include p5.js before refreshSoundContext.js.');
    return;
  }

  if (!p5.prototype.getAudioContext) {
    console.error('p5.sound.js is not loaded. Please make sure to include p5.sound.js before refreshSoundContext.js.');
    return;
  }

  p5.prototype.refreshSoundContext = function () {
    if (!this.getAudioContext) {
      return;
    }

    // wip: クリップノイズ対策
    this.disposeSound();

    const soundArray = this.soundOut.soundArray;
    for (let soundIdx = soundArray.length - 1; soundIdx >= 0; soundIdx--) {
      const sound = soundArray[soundIdx];
      // todo: 過剰処理?
      sound?.stop && sound.stop();
      sound?.dispose && sound.dispose();
      sound?.disconnect && sound.disconnect();
      soundArray.splice(soundIdx, 1);
    }

    const parts = this.soundOut.parts;
    for (let partIdx = parts.length - 1; partIdx >= 0; partIdx--) {
      const phrases = parts[partIdx].phrases;
      for (let phraseIdx = phrases.length - 1; phraseIdx >= 0; phraseIdx--) {
        phrases.splice(phraseIdx, 1);
      }
      parts.splice(partIdx, 1);
    }

    this.soundOut.soundArray = [];
    this.soundOut.parts = [];
    this.soundOut.extensions = []; // todo: 対応必要?

    this.userStartAudio();
  };

  // wip: 直接書いてもいいかも？
  p5.prototype.registerMethod('beforePreload', p5.prototype.refreshSoundContext);
})();
*/
