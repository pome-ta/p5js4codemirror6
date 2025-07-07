import Dom from './utils/dom.js';
import createEditorView from './editor/index.js';
import createSourceHTML from './sandboxes/p5CanvasHTML.js';


import { EditorSelection } from './editor/codemirror/state.js';
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
} from './editor/codemirror/commands.js';

const IS_TOUCH_DEVICE = window.matchMedia('(hover: none)').matches;
const addEruda = true;

/* --- load Source */
async function insertFetchDoc(filePath) {
  const fetchFilePath = async (path) => {
    const res = await fetch(path);
    return await res.text();
  };
  return await fetchFilePath(filePath);
}


const getBlobURL = (sourceCode) => {
  const sourceBlob = new Blob([sourceCode], { type: 'text/html' });
  const blobURL = URL.createObjectURL(sourceBlob);
  return blobURL;
}



const mainSketch = './js/sketchBooks/mainSketch.js';
const devSketch = './js/sketchBooks/devSketch.js';
const filePath = `${location.protocol}` === 'file:' ? devSketch : mainSketch;
// const codeFilePath = './js/editor/index.js';
// const codeFilePath = './js/main.js';
const codeFilePath = filePath;

/* --- iframe */
const sandbox = Dom.create('iframe', {
  setAttrs: {
    id: 'sandbox',
    sandbox: 'allow-same-origin allow-scripts',
    allow: 'accelerometer; ambient-light-sensor; autoplay; bluetooth; camera; encrypted-media; geolocation; gyroscope; \ hid; microphone; magnetometer; midi; payment; usb; serial; vr; xr-spatial-tracking',
    loading: 'lazy',
    //src: getBlobURL(createSourceHTML(insertFetchDoc(codeFilePath), addEruda)),
  },
  setStyles: {
    width: '100%',
    height: '100dvh',
    'border-width': '0',
    position: 'fixed',
    top: '0',
    left: '0',
    'z-index': '0',
    'background-color': 'lightgray',
  },
  
});


/* --- editor(View) */
const editorDiv = Dom.create('div', {
  setAttrs: {
    id: 'editor-div',
  },
  setStyles: {
    width: '100%',
    //'box-sizing': 'border-box',
  },
});

const editor = createEditorView(editorDiv);

/* --- accessory */
const reloadSketchHandleEvent = function () {
  const toStringDoc = this.targetEditor.viewState.state.doc.toString();
  const sourceCode = createSourceHTML(toStringDoc, addEruda);
  this.targetSandbox.src = getBlobURL(sourceCode);
};

const callButton = Dom.create('button', {
  textContent: '🔄',
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

const summary = Dom.create('summary', {
  setStyles: {
    'font-family':
      'Consolas, Menlo, Monaco, source-code-pro, Courier New, monospace',
    //'font-size': '0.8rem',
    padding: '0.5rem 1rem',
  },
  textContent: summaryTextContent(initDetailsOpen),
});

const wrapSummary = Dom.create('div', {
  setStyles: {
    display: 'flex',
    'justify-content': 'space-between',
  },
});

const detailsControl = (isDetailsOpen, summaryElement, divElement) => {
  summaryElement.textContent = summaryTextContent(isDetailsOpen);
  divElement.style.display = isDetailsOpen ? '' : 'none';
};

const details = Dom.create('details', {
  setAttrs: {
    id: 'details',
    open: `${initDetailsOpen}`,
  },
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

const headerControlWrap = Dom.create('div', {
  setStyles: {
    display: 'grid',
    'grid-template-columns': 'auto 1fr',
  },
  appendChildren: [callButton, details],
});

const headerHandleEvent = function () {
  const header = document.querySelector('#header');
  const offsetTop = window.visualViewport.offsetTop;
  header.style.top = `${offsetTop}px`;
};

/* --- accessory-header */
const header = Dom.create('header', {
  setAttrs: {
    id: 'header',
  },
  setStyles: {
    background: `var(--accessory-backGround-color-scheme)`,
    'background-blend-mode': `var(--accessory-backGround-background-blend-mode)`,
    'backdrop-filter': `var(--accessory-backGround-backdrop-filter)`,
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
  ],
  appendChildren: [headerControlWrap],
});

const buttonFactory = (buttonIconChar, actionHandle) => {
  function createFrame(width, height) {
    return Dom.create('div', {
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
    const icon = Dom.create('span', {
      textContent: `${iconChar}`,
      setStyles: {
        'font-family':
          'Consolas, Menlo, Monaco, source-code-pro, Courier New, monospace',
        'font-size': '1.0rem',
        'font-style': 'normal',
        'font-weight': '400',
        'line-height': '28px',
        color: `var(--accessory-button-color-normal)`,
      },
    });

    const button = Dom.create(createFrame('88%', '98%'), {
      setStyles: {
        //'background-color': '#8e8e93', // light gray
        background: `var(--accessory-button-backGround-normal)`,
        'mix-blend-mode': `var(--accessory-button-background-blend-mode-normal)`,
        'box-shadow': `var(--accessory-button-box-shadow)`,
        'border-radius': `var(--accessory-button-border-radius)`,
      },
      appendChildren: [icon],
    });

    return Dom.create(createFrame(btnW, btnH), {
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

const buttonsWrap = Dom.create('div', {
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
  if (!this.targetEditor.hasFocus) {
    footer.style.display = 'none';
    return;
  }
  footer.style.display = '';

  const offsetTop = window.visualViewport.offsetTop;
  const offsetBottom =
    window.innerHeight -
    window.visualViewport.height +
    offsetTop -
    window.visualViewport.pageTop;
  footer.style.bottom = `${offsetBottom}px`;
};

/* --- accessory-footer */
const footer = Dom.create('footer', {
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
          headLine = this.targetEditor.moveToLineBoundary(
            selectionMain,
            0
          ).anchor;
          endLine = this.targetEditor.moveToLineBoundary(
            selectionMain,
            1
          ).anchor;

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
          const moveCache =
            Math.abs(moveDistance) < stepValue
              ? caret
              : caret + Math.round(moveDistance / stepValue);

          if (caret === moveCache) {
            return;
          }

          const moveValue =
            moveCache < headLine
              ? headLine
              : moveCache >= endLine
              ? endLine
              : moveCache;

          this.targetEditor.dispatch({
            selection: EditorSelection.create([
              EditorSelection.cursor(moveValue),
            ]),
          });
          this.targetEditor.focus();
        },
      },
    },
  ],
  appendChildren: [buttonsWrap],
});

const setLayout = () => {
  const rootMain = Dom.create('div', {
    setAttrs: {
      id: 'rootMain',
    },
    setStyles: {
      display: 'grid',
      'grid-template-rows': 'auto 1fr auto',
      height: '100%',
      overflow: 'auto',
      //'background-color': 'magenta',
      //position: 'relative',
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
    const editorDoc = editor.viewState.state.doc.toString()
    sandbox.src = getBlobURL(createSourceHTML(editorDoc, addEruda));
    
  });
});
