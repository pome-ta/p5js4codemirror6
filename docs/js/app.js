import createSourceHTML from './sandboxes/defaultHTML.js'
import Editor from './editor.js';


//let loadedSource;
let isShowEditor = true;

const mainSketch = './js/sketchBook/mainSketch.js';
const devSketch = './js/sketchBook/devSketch.js';

const filePath =`${location.protocol}` === 'file:' ? devSketch : mainSketch;

const loadedSource = await fetchSketchFile(filePath);



/* -- load Source */
async function fetchSketchFile(path) {
  const res = await fetch(path);
  const sketchText = await res.text();
  return sketchText;
}

const getBlobURL = (sourceCode) => {
  const sourceBlob = new Blob([sourceCode], { type: 'text/html' });
  const blobURL = URL.createObjectURL(sourceBlob);
  return blobURL;
}

const reloadSketch = (iframeElement, editorObject) => {
  const sourceCode = createSourceHTML(editorObject.toString);
  iframeElement.src = getBlobURL(sourceCode);
}

const hideCode = (divElement) => {
  if (isShowEditor) {
    divElement.style.display = 'none';
    hideButton.textContent = 'showCode'
  } else {
    divElement.style.display = 'grid';
    hideButton.textContent = 'hideCode';
  }
  isShowEditor = !isShowEditor;
}



// sandbox
const sandbox = document.createElement('iframe');
sandbox.id = 'sandbox';
sandbox.sandbox = `allow-same-origin allow-scripts`;
sandbox.allow = `accelerometer; ambient-light-sensor; autoplay; bluetooth; camera; encrypted-media; geolocation; gyroscope; \ hid; microphone; magnetometer; midi; payment; usb; serial; vr; xr-spatial-tracking`;
sandbox.loading = 'lazy';
sandbox.style.width = '100%';
sandbox.style.height = '100dvh';
sandbox.style.borderWidth = 0;
sandbox.style.position = 'fixed';
sandbox.style.top = 0;
sandbox.style.left = 0;
sandbox.style.zIndex = 0;
sandbox.style.backgroundColor = 'lightgray';
sandbox.src = getBlobURL(createSourceHTML(loadedSource));




const editorDiv = document.createElement('div');
editorDiv.id = 'editor-div';
editorDiv.style.width = '100%';
//editorDiv.style.height = '100dvh';
editorDiv.style.position = 'relative';
editorDiv.style.display = 'grid';
editorDiv.style.gridTemplateRows = '1fr auto';
editorDiv.style.overflow = 'auto';
//editorDiv.style.backgroundColor = 'dodgerblue'
//editorDiv.style.opacity = 0.33;





const runButton = document.createElement('button');
runButton.id = 'runButton'
runButton.textContent = 'runCode'
runButton.style.margin = '1rem';
runButton.style.height = '2rem';
runButton.style.position = 'fixed';
runButton.style.top = 0;
runButton.style.right = 0;

const hideButton = document.createElement('button');
hideButton.id = 'hideButton'
hideButton.textContent = 'hideCode'
hideButton.style.margin = '1rem';
hideButton.style.height = '2rem';
hideButton.style.position = 'fixed';
hideButton.style.top = '4rem';
hideButton.style.right = 0;



const editor = new Editor(editorDiv, loadedSource);

document.body.appendChild(sandbox);
document.body.appendChild(editorDiv);
document.body.appendChild(runButton);
document.body.appendChild(hideButton);
// document.body.style.backgroundColor = 'teal'

runButton.addEventListener('click', (e) => reloadSketch(sandbox, editor));
hideButton.addEventListener('click', (e) => hideCode(editorDiv));
