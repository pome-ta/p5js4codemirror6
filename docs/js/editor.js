import {
  EditorView,
  highlightSpecialChars,
  EditorState,
  StateField,
  StateEffect,
  Decoration,
  initExtensions,
} from './modules/codemirror.bundle.js';


/**
 * backGround Rectangle span
 */
const bgRectangleClassName = 'cm-bgRectangle';
const bgRectangleMark = Decoration.mark({ class: bgRectangleClassName });
const bgRectangleTheme = EditorView.baseTheme({
  // '.cm-bgRectangle': { backgroundColor: '#232323aa' },
  '.cm-bgRectangle': { backgroundColor: '#121212bb' },
});

const bgRectEffect = {
  add: StateEffect.define({ from: 0, to: 0 }),
  remove: StateEffect.define({ from: 0, to: 0 }),
};

const bgRectangleField = StateField.define({
  create() {
    return Decoration.none;
  },
  update(bgRectangles, tr) {
    bgRectangles = bgRectangles.map(tr.changes);
    for (const ef of tr.effects) {
      if (ef.is(bgRectEffect.add)) {
        bgRectangles = bgRectangles.update({
          add: [bgRectangleMark.range(ef.value.from, ef.value.to)],
        });
      } else if (ef.is(bgRectEffect.remove)) {
        bgRectangles = bgRectangles.update({
          // filter: (from, to, value) => {
          //   let shouldRemove =
          //     from === e.value.from &&
          //     to === e.value.to &&
          //     value.spec.class === bgRectangleClassName;
          //   return !shouldRemove;
          // },
          filter: (f, t, value) => !(value.class === bgRectangleClassName),
        });
      }
    }
    return bgRectangles;
  },
  provide: (f) => EditorView.decorations.from(f),
});

function bgRectangleSet(view) {
  const { state, dispatch } = view;
  const { from, to } = state.selection.main.extend(0, state.doc.length);
  if (!from && !to) {
    return;
  }
  const decoSet = state.field(bgRectangleField, false);

  const addFromTO = (from, to) => bgRectEffect.add.of({ from, to });
  const removeFromTO = (from, to) => bgRectEffect.remove.of({ from, to });

  let effects = [];
  effects.push(
    !decoSet ? StateEffect.appendConfig.of([bgRectangleField]) : null
  );
  decoSet?.between(from, to, (decoFrom, decoTo) => {
    if (from === decoTo || to === decoFrom) {
      return;
    }
    effects.push(removeFromTO(from, to));
    effects.push(removeFromTO(decoFrom, decoTo));
    effects.push(decoFrom < from ? addFromTO(decoFrom, from) : null);
    effects.push(decoTo > to ? addFromTO(to, decoTo) : null);
  });
  effects.push(addFromTO(from, to));
  if (!effects.length) {
    return false;
  }
  dispatch({ effects: effects.filter((ef) => ef) });
  return true;
}

/**
 * whitespaceShow
 */
const u22c5 = '⋅'; // DOT OPERATOR
// const ivory = '#abb2bf44'; // todo: oneDark から拝借
const whitespaceShow = highlightSpecialChars({
  render: (code) => {
    let node = document.createElement('span');
    node.classList.add('cm-whoteSpace');
    node.style.color = ivory;
    node.innerText = u22c5;
    node.title = '\\u' + code.toString(16);
    return node;
  },
  // specialChars: /\x20/g,
  addSpecialChars: /\x20/g,
});

const resOutlineTheme = EditorView.baseTheme({
  '&.cm-editor': {
    '&.cm-focused': {
      outline: '0px dotted #212121',
    },
  },
});

/*
const fontSizeTheme = EditorView.theme({
  '&': {
    fontSize: hasTouchScreen ? '0.72rem' : '1.0rem',
  },
});
*/


const chalky = '#e5c07b',
  coral = '#e06c75',
  cyan = '#56b6c2',
  invalid = '#ffffff',
  ivory = '#abb2bf',
  stone = '#7d8799', // Brightened compared to original to increase contrast
  malibu = '#61afef',
  sage = '#98c379',
  whiskey = '#d19a66',
  violet = '#c678dd',
  darkBackground = '#2c313a80', // 元は、`highlightBackground` の色
  highlightBackground = '#282c3480', // 元は、`darkBackground` の色
  background = '#282c3400',
  tooltipBackground = '#353a42',
  selection = '#528bff80',
  // cursor = '#528bff';
  cursor = '#fff';

const transparentTheme = EditorView.theme({
  //const transparentTheme = EditorView.baseTheme({
  /*
    '&': {
        backgroundColor: background,
        //fontSize: '0.72rem',
      },
      '.cm-gutters': {
        backgroundColor: background,
        color: stone,
        border: 'none',
      },
      '.cm-activeLine': { backgroundColor: highlightBackground },
      '.cm-activeLineGutter': {
        backgroundColor: highlightBackground,
      },
  //});
  }, { dark: true });
  */
  '&': {
    color: ivory,
    backgroundColor: background,
  },
  '.cm-content': {
    caretColor: cursor,
  },
  '.cm-cursor, .cm-dropCursor': { borderLeftColor: cursor },
  '&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection':
    { backgroundColor: selection },
  '.cm-panels': { backgroundColor: darkBackground, color: ivory },
  '.cm-panels.cm-panels-top': { borderBottom: '2px solid black' },
  '.cm-panels.cm-panels-bottom': { borderTop: '2px solid black' },
  '.cm-searchMatch': {
    backgroundColor: '#72a1ff59',
    outline: '1px solid #457dff',
  },
  '.cm-searchMatch.cm-searchMatch-selected': {
    backgroundColor: '#6199ff2f',
  },
  '.cm-activeLine': { backgroundColor: highlightBackground },
  '.cm-selectionMatch': { backgroundColor: '#aafe661a' },
  '&.cm-focused .cm-matchingBracket, &.cm-focused .cm-nonmatchingBracket': {
    backgroundColor: '#bad0f847',
    outline: '1px solid #515a6b',
    // outline: '1px solid #aa5a6b',
  },
  '.cm-gutters': {
    backgroundColor: background,
    color: stone,
    border: 'none',
  },
  '.cm-activeLineGutter': {
    backgroundColor: highlightBackground,
  },
  '.cm-foldPlaceholder': {
    backgroundColor: 'transparent',
    border: 'none',
    color: '#ddd',
  },
  '.cm-tooltip': {
    border: 'none',
    backgroundColor: tooltipBackground,
  },
  '.cm-tooltip .cm-tooltip-arrow:before': {
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  '.cm-tooltip .cm-tooltip-arrow:after': {
    borderTopColor: tooltipBackground,
    borderBottomColor: tooltipBackground,
  },
  '.cm-tooltip-autocomplete': {
    '& > ul > li[aria-selected]': {
      backgroundColor: highlightBackground,
      color: ivory,
    },
  },
},
  { dark: true }
);

const _extensions = [
  transparentTheme,
  //fontSizeTheme,
  ...initExtensions,
  // whitespaceShow,
  resOutlineTheme,
  bgRectangleTheme,
];

class Editor {
  constructor(editorDiv, doc = '', extensions = null) {
    this.updateCallback = EditorView.updateListener.of((update) => update.docChanged && this.onChange(update.state.doc.toString()));
    this.editorDiv = editorDiv
    //this._doc = doc
    //this.extensions = extensions ? [..._extensions, ...extensions] : _extensions;
    this.extensions = [..._extensions, this.updateCallback];

    this.state = EditorState.create({
      doc: doc,
      extensions: this.extensions,
    });
    this.editor = new EditorView({
      state: this.state,
      parent: this.editorDiv,
    });

    bgRectangleSet(this.editor);
  }


  onChange(docs) {
    bgRectangleSet(this.editor);
  }

  get toString() {
    return this.editor.viewState.state.doc.toString();
  }

}


export default Editor;
