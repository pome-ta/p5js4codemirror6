
(function () {
  'use strict';

if (typeof p5 === 'undefined') {
  console.error(
    'p5.js is not loaded. Please make sure to include p5.js before refreshSoundContext.js.'
  );
  return;
}

/*  あとで確認
if (p5?.getAudioContext() === 'undefined') {
  console.error(
    'p5.sound.js is not loaded. Please make sure to include p5.sound.js before refreshSoundContext.js.'
  );
  return;
}

console.log('h');
*/


p5.prototype.refreshSoundContext = function(){
  console.log('I will load a CSV file soon!');
  console.log(this)
};

p5.prototype.registerMethod('beforePreload', p5.prototype.refreshSoundContext);

})();
