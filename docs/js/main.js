import DomFactory from './utils/domFactory.js';
import createEditorView from './editor/index.js';

import { EditorSelection } from '@codemirror/state';
import {
  cursorCharLeft,
  cursorCharRight,
  cursorLineDown,
  cursorLineUp,
  redo,
  selectAll,
  selectLine,
  toggleComment,
  undo,
} from '@codemirror/commands';

const IS_TOUCH_DEVICE = window.matchMedia('(hover: none)').matches;

/* --- load Source */
async function insertFetchDoc(filePath) {
  const fetchFilePath = async (path) => {
    const res = await fetch(path);
    return await res.text();
  };
  return await fetchFilePath(filePath);
}

const mainSketch = './sketchBooks/mainSketch.js';
const devSketch = './sketchBooks/devSketch.js';

const codeFilePath =
  `${location.protocol}` === 'file:' || `${location.protocol}` === 'http:' || `${location.hostname}` === 'localhost'
    ? devSketch
    : mainSketch;
// const codeFilePath = 1 ? devSketch : mainSketch;

/* --- editor(View) */
const editorDiv = DomFactory.create('div', {
  setAttrs: {
    id: 'editor-div',
  },
  setStyles: {
    width: '100%',
  },
});

const editor = createEditorView(editorDiv);

let isInstanceMode = true;
const createIframeHtml = (userCode, isInstanceMode = true) => `
<!doctype html>
<html lang="ja">
  <head>
    <meta charset="utf-8" />
    <meta
      name="viewport"
      content="width=device-width,initial-scale=1.0,minimum-scale=1.0,maximum-scale=1.0,user-scalable=no"
    />

    <script src="https://cdn.jsdelivr.net/npm/p5/lib/p5.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/p5.sound/dist/p5.sound.js"></script>

    <!--
    <script src="https://cdn.jsdelivr.net/npm/p5@1.11.10/lib/p5.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/p5@1.11.10/lib/addons/p5.sound.js"></script>
    -->

    <script type="importmap">
      {
        "imports": {
          "eruda": "https://esm.sh/eruda",
          "modules/": "./sketchBooks/modules/"
        }
      }
    </script>

    <script type="module">
      import eruda from 'eruda';

      eruda.init();

      const timeStr = new Date().toLocaleTimeString();
      const outLog = 'p5Canvas: ' + timeStr;
      console.log(outLog);
    </script>

    <style>
      html,
      body {
        margin: 0;
        padding: 0;
        overflow: hidden;
      }
      canvas {
        display: block;
      }
    </style>
  </head>

  <script ${isInstanceMode ? 'type="module"' : ''}>

    ${userCode}

    document.addEventListener(
      'touchstart',
      () => {
        if (typeof userStartAudio !== 'undefined') userStartAudio();
      },
      { once: true },
    );
  </script>
  <body></body>
</html>
`;

// xxx: iframe 生成時と書き換え時と併用
const reloadSketchHandleEvent = function (e) {
  const toStringDoc = this.targetEditor.viewState.state.doc.toString();
  this.targetSandbox = this.targetSandbox ? this.targetSandbox : document.getElementById('sandbox');
  this.targetSandbox.srcdoc = createIframeHtml(toStringDoc, isInstanceMode);
};

/* --- iframe */
const sandbox = DomFactory.create('iframe', {
  setAttrs: {
    id: 'sandbox',
    sandbox: 'allow-same-origin allow-scripts',
    allow:
      'accelerometer; ambient-light-sensor; autoplay; bluetooth; camera; encrypted-media; geolocation; gyroscope;  hid; microphone; magnetometer; midi; payment; usb; serial; vr; xr-spatial-tracking',
    loading: 'lazy',
  },
  setStyles: {
    width: '100%',
    height: '100dvh',
    'border-width': '0',
    position: 'fixed',
    top: '0',
    left: '0',
    'z-index': '0',
    //'background-color': 'lightgray',
    'background-color': 'darkgray',
  },
});

/* --- accessory */
const callButton = DomFactory.create('button', {
  textContent: '🔄',
  setStyles: {
    'font-family': 'Consolas, Menlo, Monaco, source-code-pro, Courier New, monospace',
    padding: '0.5rem 1rem',
    cursor: 'pointer',
  },
  addEventListeners: [
    {
      type: 'click',
      listener: {
        targetSandbox: sandbox,
        targetEditor: editor,
        handleEvent: reloadSketchHandleEvent,
      },
    },
  ],
});

const summaryTextContent = (bool) => `source: ${bool ? 'hide' : 'show'}`;
const initDetailsOpen = false;

const summary = DomFactory.create('summary', {
  setStyles: {
    'font-family': 'Consolas, Menlo, Monaco, source-code-pro, Courier New, monospace',
    //'font-size': '0.8rem',
    padding: '0.5rem 1rem',
  },
  textContent: summaryTextContent(initDetailsOpen),
});

const wrapSummary = DomFactory.create('div', {
  setStyles: {
    display: 'flex',
    'justify-content': 'space-between',
  },
});

const detailsControl = (isDetailsOpen, summaryElement, divElement) => {
  summaryElement.textContent = summaryTextContent(isDetailsOpen);
  divElement.style.display = isDetailsOpen ? '' : 'none';
};

const details = DomFactory.create('details', {
  setAttrs: {
    id: 'details',
    open: `${initDetailsOpen}`,
  },
  setStyles: { cursor: 'pointer' },
  addEventListeners: [
    {
      type: 'toggle',
      listener: {
        targetSummary: summary,
        targetDiv: editorDiv,
        handleEvent: function (e) {
          detailsControl(e.target.open, this.targetSummary, this.targetDiv);
        },
      },
    },
    {
      type: 'build',
      listener: {
        targetSummary: summary,
        targetDiv: editorDiv,
        handleEvent: function (e) {
          detailsControl(e.detail.open, this.targetSummary, this.targetDiv);
        },
      },
    },
  ],
  appendChildren: [summary, wrapSummary],
});

/* --- モード切替ボタン --- */
// const modeToggleButton = DomFactory.create('button', {
//   textContent: isInstanceMode ? '📦 Instance' : '🌍 Global', // 初期テキスト
//   setStyles: {
//     'font-family':
//       'Consolas, Menlo, Monaco, source-code-pro, Courier New, monospace',
//     padding: '0.5rem 1rem',
//     cursor: 'pointer',
//     'background-color': 'transparent',
//     border: '1px solid var(--accessory-button-color-normal)',
//     color: 'var(--accessory-button-color-normal)',
//     'border-radius': '4px',
//     'margin-left': '8px',
//   },
//   addEventListeners: [
//     {
//       type: 'click',
//       listener: {
//         handleEvent: function (e) {
//           // モードを反転
//           isInstanceMode = !isInstanceMode;
//           // ボタンのテキストを更新
//           e.target.textContent = isInstanceMode ? '📦 Instance' : '🌍 Global';

//           // モードが切り替わったら、即座にエディタの内容で再描画する
//           // (エディタとサンドボックスの要素を無理やり渡して再実行)
//           reloadSketchHandleEvent.call({
//             targetEditor: editor,
//             targetSandbox: sandbox,
//           });
//         },
//       },
//     },
//   ],
// });

// // 1. トグルスイッチの動くツマミ(Knob)を作成
// const toggleKnob = DomFactory.create('div', {
//   setStyles: {
//     position: 'absolute',
//     top: '1px',
//     left: '1px',
//     width: '24px',
//     height: '24px',
//     'border-radius': '50%',
//     'background-color': 'var(--accessory-button-color-normal, #e0e0e0)', // 文字色と同じか白系
//     'box-shadow': '0 2px 4px rgba(0,0,0,0.2)',
//     display: 'flex',
//     'align-items': 'center',
//     'justify-content': 'center',
//     'font-size': '12px',
//     // スルッと動くアニメーションを設定
//     transition: 'transform 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)',
//     // 初期状態 (Instance Mode = true なら右側、falseなら左側)
//     transform: isInstanceMode ? 'translateX(28px)' : 'translateX(0px)',
//   },
//   textContent: isInstanceMode ? '📦' : '🌍',
// });

// // 2. トグルスイッチの背景枠(Track)を作成
// const modeToggleSwitch = DomFactory.create('div', {
//   setStyles: {
//     position: 'relative',
//     width: '56px',
//     height: '28px',
//     'border-radius': '14px',
//     background: 'var(--accessory-button-backGround-normal, transparent)',
//     border: '1px solid var(--accessory-button-color-normal)',
//     cursor: 'pointer',
//     'margin-left': '8px',
//     'box-sizing': 'border-box',
//   },
//   appendChildren: [toggleKnob], // 背景の中にツマミを入れる
//   addEventListeners: [
//     {
//       type: 'click',
//       listener: {
//         handleEvent: function (e) {
//           // モードを反転
//           isInstanceMode = !isInstanceMode;

//           // ツマミの移動アニメーションとアイコンの変更
//           toggleKnob.style.transform = isInstanceMode ? 'translateX(28px)' : 'translateX(0px)';
//           toggleKnob.textContent = isInstanceMode ? '📦' : '🌍';

//           // モードが切り替わったら即座に再描画
//           reloadSketchHandleEvent.call({
//             targetEditor: editor,
//             targetSandbox: sandbox,
//           });
//         },
//       },
//     },
//   ],
// });

// 1 上部に表示するテキストラベルを作成
// const toggleLabel = DomFactory.create('div', {
//   setStyles: {
//     'font-family': 'Consolas, Menlo, Monaco, source-code-pro, Courier New, monospace',
//     'font-size': '0.62rem', // スイッチに合わせた小さめのサイズ
//     'color': 'var(--accessory-button-color-normal, #e0e0e0)',
//     'text-align': 'center',
//     'margin-bottom': '3px', // 下にあるスイッチとの隙間
//     'text-transform': 'lowercase', // 小文字に統一してミニマルに
//   },
//   textContent: isInstanceMode ? 'instance mode' : 'global mode', // 初期テキスト
// });

// // 2 トグルスイッチの動くツマミ(Knob)
// const toggleKnob = DomFactory.create('div', {
//   setStyles: {
//     position: 'absolute',
//     top: '1px',
//     left: '1px',
//     width: '24px',
//     height: '24px',
//     'border-radius': '50%',
//     'background-color': 'var(--accessory-button-color-normal, #e0e0e0)',
//     'box-shadow': '0 2px 4px rgba(0,0,0,0.2)',
//     display: 'flex',
//     'align-items': 'center',
//     'justify-content': 'center',
//     'font-size': '12px',
//     transition: 'transform 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)',
//     transform: isInstanceMode ? 'translateX(28px)' : 'translateX(0px)',
//   },
//   textContent: isInstanceMode ? '📦' : '🌍',
// });

// // 3 トグルスイッチの背景枠(Track)
// const modeToggleSwitch = DomFactory.create('div', {
//   setStyles: {
//     position: 'relative',
//     width: '56px',
//     height: '28px',
//     'border-radius': '14px',
//     background: 'var(--accessory-button-backGround-normal, transparent)',
//     border: '1px solid var(--accessory-button-color-normal)',
//     cursor: 'pointer',
//     'box-sizing': 'border-box',
//   },
//   appendChildren: [toggleKnob],
//   addEventListeners: [
//     {
//       type: 'click',
//       listener: {
//         handleEvent: function (e) {
//           // モードを反転
//           isInstanceMode = !isInstanceMode;

//           // ★クリック時に上部の文字ラベルも一緒に書き換える
//           toggleLabel.textContent = isInstanceMode ? 'instance mode' : 'global mode';

//           // ツマミのアニメーションとアイコン変更
//           toggleKnob.style.transform = isInstanceMode ? 'translateX(28px)' : 'translateX(0px)';
//           toggleKnob.textContent = isInstanceMode ? '📦' : '🌍';

//           // スケッチ再描画
//           reloadSketchHandleEvent.call({
//             targetEditor: editor,
//             targetSandbox: sandbox,
//           });
//         },
//       },
//     },
//   ],
// });

// // 4 ラベルとスイッチを縦並び(column)にするための親コンテナ
// const modeToggleContainer = DomFactory.create('div', {
//   setStyles: {
//     display: 'flex',
//     'flex-direction': 'column',
//     'align-items': 'center',
//     'margin-left': '8px', // detailsとの間隔をここで確保
//   },
//   // 上にラベル、下にスイッチの順で入れる
//   appendChildren: [toggleLabel, modeToggleSwitch],
// });

// const labelInstance = DomFactory.create('div', {
//   setStyles: {
//     'grid-area': '1 / 1', // 同じセルに重ねる
//     'font-family': 'Consolas, Menlo, Monaco, source-code-pro, Courier New, monospace',
//     'font-size': '0.62rem',
//     'color': 'var(--accessory-button-color-normal, #e0e0e0)',
//     'text-transform': 'lowercase',
//     'transition': 'opacity 0.2s',
//     'opacity': isInstanceMode ? '1' : '0',
//   },
//   textContent: 'instance mode',
// });

// const labelGlobal = DomFactory.create('div', {
//   setStyles: {
//     'grid-area': '1 / 1', // 同じセルに重ねる
//     'font-family': 'Consolas, Menlo, Monaco, source-code-pro, Courier New, monospace',
//     'font-size': '0.62rem',
//     'color': 'var(--accessory-button-color-normal, #e0e0e0)',
//     'text-transform': 'lowercase',
//     'transition': 'opacity 0.2s',
//     'opacity': isInstanceMode ? '0' : '1',
//   },
//   textContent: 'global mode',
// });

// const toggleLabelContainer = DomFactory.create('div', {
//   setStyles: {
//     'display': 'grid',       // 重ね合わせのためのGrid
//     'justify-items': 'center',
//     'margin-bottom': '4px',
//   },
//   appendChildren: [labelInstance, labelGlobal],
// });

// // 2 【固定値排除ハック】ツマミ(Knob)の相対移動
// // 縦幅(top/bottom)に追従させ、aspect-ratio で自動的に正円(1:1)を維持します。
// const toggleKnob = DomFactory.create('div', {
//   setStyles: {
//     'position': 'absolute',
//     'top': '2px',
//     'bottom': '2px',
//     'aspect-ratio': '1 / 1',
//     'border-radius': '50%',
//     'background-color': 'var(--accessory-button-color-normal, #e0e0e0)',
//     'box-shadow': '0 2px 4px rgba(0,0,0,0.2)',
//     'display': 'flex',
//     'align-items': 'center',
//     'justify-content': 'center',
//     'font-size': '0.75rem',

//     // ★ 変更点1: 生成時は transition を 'none' にしておく(瞬間移動させる)
//     'transition': 'none',

//     'left': isInstanceMode ? 'calc(100% - 2px)' : '2px',
//     'transform': isInstanceMode ? 'translateX(-100%)' : 'translateX(0)',
//   },
//   textContent: isInstanceMode ? '📦' : '🌍',
// });

// // ★ 変更点2: 要素が作られた直後に(少しだけ時間を空けて)本来のアニメーションを付与する
// setTimeout(() => {
//   toggleKnob.style.transition = 'left 0.3s cubic-bezier(0.4, 0.0, 0.2, 1), transform 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)';
// }, 100); // 50ミリ秒だけ待つのがコツ

// // 3 スイッチの背景枠(Track)
// // pxでの決め打ちを捨て、フォントサイズに連動する「em」を基準に設計します。
// const modeToggleSwitch = DomFactory.create('div', {
//   setStyles: {
//     'position': 'relative',
//     'width': '3.5em',        // フォントサイズに対して自然な横幅
//     'height': '1.75em',      // 横幅のちょうど半分の縦幅(美しい比率)
//     'border-radius': '0.875em', // heightの半分の値
//     'background': 'var(--accessory-button-backGround-normal, transparent)',
//     'border': '1px solid var(--accessory-button-color-normal)',
//     'cursor': 'pointer',
//     'box-sizing': 'border-box',
//   },
//   appendChildren: [toggleKnob],
//   addEventListeners: [
//     {
//       type: 'click',
//       listener: {
//         handleEvent: function (e) {
//           isInstanceMode = !isInstanceMode;

//           // 文字数を変えるのではなく、重なったラベルの不透明度(opacity)を切り替える
//           // これにより、コンテナの横幅は1ミリも変動しません
//           labelInstance.style.opacity = isInstanceMode ? '1' : '0';
//           labelGlobal.style.opacity = isInstanceMode ? '0' : '1';

//           // ツマミを滑らかに相対移動させる
//           toggleKnob.style.left = isInstanceMode ? 'calc(100% - 2px)' : '2px';
//           toggleKnob.style.transform = isInstanceMode ? 'translateX(-100%)' : 'translateX(0)';
//           toggleKnob.textContent = isInstanceMode ? '📦' : '🌍';

//           // スケッチ再描画
//           reloadSketchHandleEvent.call({
//             targetEditor: editor,
//             targetSandbox: sandbox,
//           });
//         },
//       },
//     },
//   ],
// });

// // 4 全体をまとめる親コンテナ
// const modeToggleContainer = DomFactory.create('div', {
//   setStyles: {
//     'display': 'flex',
//     'flex-direction': 'column',
//     'align-items': 'center',
//     'margin-left': '8px',
//   },
//   appendChildren: [toggleLabelContainer, modeToggleSwitch],
// });

// --- 1. 共通設定の定義(マジックナンバーや重複文字列の排除) ---
const FONT_FAMILY = 'Consolas, Menlo, Monaco, source-code-pro, Courier New, monospace';
const COLOR_NORMAL = 'var(--accessory-button-color-normal, #e0e0e0)';

// --- 2. UI部品の生成 ---

// ラベル生成ヘルパー(重複コードを排除)
const createLabel = (text, isVisible) =>
  DomFactory.create('div', {
    setStyles: {
      'grid-area': '1 / 1',
      'font-family': FONT_FAMILY,
      'font-size': '0.62rem',
      color: COLOR_NORMAL,
      'text-transform': 'lowercase',
      transition: 'opacity 0.2s ease',
      opacity: isVisible ? '1' : '0',
    },
    textContent: text,
  });

const labelInstance = createLabel('instance mode', isInstanceMode);
const labelGlobal = createLabel('global mode', !isInstanceMode);

const toggleLabelContainer = DomFactory.create('div', {
  setStyles: {
    display: 'grid',
    'justify-items': 'center',
    'margin-bottom': '4px',
  },
  appendChildren: [labelInstance, labelGlobal],
});

// ツマミ(サイズ固定値を排除した相対設計)
const toggleKnob = DomFactory.create('div', {
  setStyles: {
    position: 'absolute',
    top: '2px',
    bottom: '2px',
    'aspect-ratio': '1 / 1',
    'border-radius': '50%',
    'background-color': COLOR_NORMAL,
    'box-shadow': '0 2px 4px rgba(0,0,0,0.2)',
    display: 'flex',
    'align-items': 'center',
    'justify-content': 'center',
    'font-size': '0.75rem',
    transition: 'left 0.3s ease, transform 0.3s ease', // 素直にtransitionを設定
    left: isInstanceMode ? 'calc(100% - 2px)' : '2px',
    transform: isInstanceMode ? 'translateX(-100%)' : 'translateX(0)',
  },
  textContent: isInstanceMode ? '📦' : '🌍',
});

// --- 3. 状態管理とイベント処理 ---

// UIの見た目を更新する専用関数(関心の分離)
const updateToggleUI = () => {
  labelInstance.style.opacity = isInstanceMode ? '1' : '0';
  labelGlobal.style.opacity = isInstanceMode ? '0' : '1';
  toggleKnob.style.left = isInstanceMode ? 'calc(100% - 2px)' : '2px';
  toggleKnob.style.transform = isInstanceMode ? 'translateX(-100%)' : 'translateX(0)';
  toggleKnob.textContent = isInstanceMode ? '📦' : '🌍';
};
const modeToggleSwitch = DomFactory.create('div', {
  setStyles: {
    position: 'relative',
    width: '4rem',
    height: '1.75rem',
    'border-radius': '0.875rem',
    background: 'var(--accessory-button-backGround-normal, transparent)',
    border: `1px solid ${COLOR_NORMAL}`,
    // cursor: 'pointer', ← ここから親に移動するため削除
    'box-sizing': 'border-box',
  },
  appendChildren: [toggleKnob],
});

// --- 4. 親コンテナ ---
const modeToggleContainer = DomFactory.create('div', {
  setStyles: {
    display: 'flex',
    'flex-direction': 'column',
    'align-items': 'center',
    margin: '0 1rem',
    cursor: 'pointer', // ★ 追加: 親コンテナ全体(文字+スイッチ)をクリッカブルにする
  },
  appendChildren: [toggleLabelContainer, modeToggleSwitch],
  addEventListeners: [
    {
      type: 'click',
      listener: {
        handleEvent: function () {
          // 1. 状態を反転
          isInstanceMode = !isInstanceMode;
          // 2. UIを描画
          updateToggleUI();
          // 3. スケッチを再実行
          reloadSketchHandleEvent.call({
            targetEditor: editor,
            targetSandbox: sandbox,
          });
        },
      },
    },
  ],
});

const headerControlWrap = DomFactory.create('div', {
  setStyles: {
    display: 'grid',
    'grid-template-columns': 'auto 1fr auto',
    'align-items': 'center',
  },
  appendChildren: [callButton, details, modeToggleContainer],
});

const headerHandleEvent = function () {
  const header = document.querySelector('#header');
  const offsetTop = Math.max(0, window.visualViewport.offsetTop);
  //header.style.top = `${offsetTop}px`;
  header.style.transform = `translateY(${offsetTop}px)`;
  //header.style.overflow = 'hidden'
};

/* --- accessory-header */
const header = DomFactory.create('header', {
  setAttrs: {
    id: 'header',
  },
  setStyles: {
    background: `var(--accessory-backGround-color-scheme)`,
    'background-blend-mode': `var(--accessory-backGround-background-blend-mode)`,
    //'backdrop-filter': `var(--accessory-backGround-backdrop-filter)`,
    position: 'sticky',
    width: '100%',
    top: '0',
    'z-index': '1',
  },
  targetAddEventListeners: [
    {
      target: window.visualViewport,
      type: 'resize',
      listener: {
        handleEvent: headerHandleEvent,
      },
    },
    {
      target: window.visualViewport,
      type: 'scroll',
      listener: {
        handleEvent: headerHandleEvent,
      },
    },
    /*
    {
      target: sandbox,
      type: 'resize',
      listener: {
        handleEvent: headerHandleEvent,
      },
    },
    {
      target: sandbox,
      type: 'scroll',
      listener: {
        handleEvent: headerHandleEvent,
      },
    },
    */
  ],
  appendChildren: [headerControlWrap],
});

const buttonFactory = (buttonIconChar, actionHandle) => {
  function createFrame(width, height) {
    return DomFactory.create('div', {
      setStyles: {
        'min-width': `${width}`,
        height: `${height}`,
        display: 'flex',
        'justify-content': 'center',
        'align-items': 'center',
        //background: 'rgba(255, 0, 0, 0.5)',
      },
    });
  }

  const num = 2.5;
  const btnW = `${num}rem`;
  const btnH = `${num * 0.8}rem`;
  // const btnRadius = '16%';

  const createActionButton = (iconChar) => {
    const icon = DomFactory.create('span', {
      textContent: `${iconChar}`,
      setStyles: {
        'font-family': 'Consolas, Menlo, Monaco, source-code-pro, Courier New, monospace',
        'font-size': '1.0rem',
        'font-style': 'normal',
        'font-weight': '400',
        'line-height': '28px',
        color: `var(--accessory-button-color-normal)`,
      },
    });

    const button = DomFactory.create(createFrame('88%', '98%'), {
      setStyles: {
        //'background-color': '#8e8e93', // light gray
        background: `var(--accessory-button-backGround-normal)`,
        'mix-blend-mode': `var(--accessory-button-background-blend-mode-normal)`,
        'box-shadow': `var(--accessory-button-box-shadow)`,
        'border-radius': `var(--accessory-button-border-radius)`,
      },
      appendChildren: [icon],
    });

    return DomFactory.create(createFrame(btnW, btnH), {
      setStyles: {
        cursor: 'pointer',
      },
      appendChildren: [button],
    });
  };

  const actionButton = createActionButton(buttonIconChar);
  actionButton.addEventListener('click', actionHandle);

  return actionButton;
};

// wip: 最大数問題
const buttons = Object.entries({
  '//': {
    targetEditor: editor,
    handleEvent: function () {
      toggleComment(this.targetEditor);
      this.targetEditor.focus();
    },
  },
  '▭': {
    targetEditor: editor,
    handleEvent: function () {
      selectLine(this.targetEditor);
      this.targetEditor.focus();
    },
  },
  '←': {
    targetEditor: editor,
    handleEvent: function () {
      cursorCharLeft(this.targetEditor);
      this.targetEditor.focus();
    },
  },
  '↓': {
    targetEditor: editor,
    handleEvent: function () {
      cursorLineDown(this.targetEditor);
      this.targetEditor.focus();
    },
  },
  '↑': {
    targetEditor: editor,
    handleEvent: function () {
      cursorLineUp(this.targetEditor);
      this.targetEditor.focus();
    },
  },
  '→': {
    targetEditor: editor,
    handleEvent: function () {
      cursorCharRight(this.targetEditor);
      this.targetEditor.focus();
    },
  },
  '⎁': {
    targetEditor: editor,
    handleEvent: function () {
      selectAll(this.targetEditor);
      this.targetEditor.focus();
    },
  },
  '⤻': {
    targetEditor: editor,
    handleEvent: function () {
      redo(this.targetEditor);
      this.targetEditor.focus();
    },
  },
  '⤺': {
    targetEditor: editor,
    handleEvent: function () {
      undo(this.targetEditor);
      this.targetEditor.focus();
    },
  },
}).map(([str, fnc]) => {
  return buttonFactory(str, fnc);
});

const buttonsWrap = DomFactory.create('div', {
  setStyles: {
    width: '100%',
    'box-sizing': 'border-box',
    padding: '0.6rem 1rem',
    display: 'flex',
    'justify-content': 'space-between',
  },

  appendChildren: [...buttons],
});

let caret, headLine, endLine;
const divStep = 16;
let swipeAreaWidth, stepValue;
let startX = 0;

const footerHandleEvent = function () {
  const footer = document.querySelector('#footer');
  if (!this.targetEditor.hasFocus && footer) {
    footer.style.display = 'none';
    return;
  }
  if (!IS_TOUCH_DEVICE) {
    return;
  }
  footer.style.display = '';

  const offsetTop = window.visualViewport.offsetTop;
  const offsetBottom = window.innerHeight - window.visualViewport.height + offsetTop - window.visualViewport.pageTop;
  const tOffsetTop = visualViewport.offsetTop + visualViewport.height - document.documentElement.clientHeight;
  //footer.style.bottom = `${offsetBottom}px`;
  footer.style.transform = `translateY(${tOffsetTop}px)`;
};

/* --- accessory-footer */
const footer = DomFactory.create('footer', {
  setAttrs: {
    id: 'footer',
  },
  setStyles: {
    background: `var(--accessory-backGround-color-scheme)`,
    'background-blend-mode': `var(--accessory-backGround-background-blend-mode)`,
    'backdrop-filter': `var(--accessory-backGround-backdrop-filter)`,
    position: 'sticky',
    width: '100%',
    bottom: '0',
    display: 'none',
  },
  targetAddEventListeners: [
    {
      target: window.visualViewport,
      type: 'resize',
      listener: {
        targetEditor: editor,
        handleEvent: footerHandleEvent,
      },
    },
    {
      target: window.visualViewport,
      type: 'scroll',
      listener: {
        targetEditor: editor,
        handleEvent: footerHandleEvent,
      },
    },
  ],
  addEventListeners: [
    {
      type: 'touchstart',
      listener: {
        targetEditor: editor,
        handleEvent: function (e) {
          //e.preventDefault(); // xxx: 変化要確認
          if (!this.targetEditor.hasFocus) {
            return;
          }

          const selectionMain = this.targetEditor.state.selection.main;
          caret = selectionMain.anchor;
          headLine = this.targetEditor.moveToLineBoundary(selectionMain, 0).anchor;
          endLine = this.targetEditor.moveToLineBoundary(selectionMain, 1).anchor;

          swipeAreaWidth = document.querySelector('#footer').clientWidth;
          stepValue = swipeAreaWidth / divStep;
          startX = e.changedTouches[0].clientX;
        },
      },
    },

    {
      type: 'touchmove',
      listener: {
        targetEditor: editor,
        handleEvent: function (e) {
          e.preventDefault(); // xxx: 変化要確認
          if (!this.targetEditor.hasFocus) {
            return;
          }

          const swipeX = e.changedTouches[0].clientX;

          const moveDistance = swipeX - startX;
          const moveCache = Math.abs(moveDistance) < stepValue ? caret : caret + Math.round(moveDistance / stepValue);

          if (caret === moveCache) {
            return;
          }

          const moveValue = moveCache < headLine ? headLine : moveCache >= endLine ? endLine : moveCache;

          this.targetEditor.dispatch({
            selection: EditorSelection.create([EditorSelection.cursor(moveValue)]),
          });
          this.targetEditor.focus();
        },
      },
    },
  ],
  appendChildren: [buttonsWrap],
});

const setLayout = () => {
  const rootMain = DomFactory.create('div', {
    setAttrs: {
      id: 'rootMain',
    },
    setStyles: {
      display: 'grid',
      'grid-template-rows': 'auto 1fr auto',
      height: '100%',
      overflow: 'auto',
    },
    appendChildren: [header, editorDiv],
  });

  if (IS_TOUCH_DEVICE) {
    rootMain.appendChild(footer);
  }
  document.body.appendChild(sandbox);
  document.body.appendChild(rootMain);
};

document.addEventListener('DOMContentLoaded', () => {
  setLayout();

  insertFetchDoc(codeFilePath).then((loadedSource) => {
    // todo: 事前に`doc` が存在するなら、`doc` 以降にテキストを挿入
    editor.dispatch({
      changes: { from: editor.state?.doc.length, insert: loadedSource },
    });
    document.getElementById('sandbox').srcdoc = createIframeHtml(loadedSource, isInstanceMode);
  });
});
