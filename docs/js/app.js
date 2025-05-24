import createSourceHTML from './sandboxes/defaultHTML.js'
import Editor from './editor.js';

const fsPath = './js/sketchBook/mainSketch.js';
let loadedSource;

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




loadedSource = await fetchSketchFile(fsPath);



// sandbox
const sandbox = document.createElement('iframe');
sandbox.id = 'sandbox';
sandbox.sandbox = `allow-same-origin allow-scripts`;
sandbox.allow = `accelerometer; ambient-light-sensor; autoplay; bluetooth; camera; encrypted-media; geolocation; gyroscope; \ hid; microphone; magnetometer; midi; payment; usb; serial; vr; xr-spatial-tracking`;
sandbox.loading = 'lazy';
sandbox.style.width = '100%';
sandbox.style.height = '32%';
sandbox.style.backgroundColor = 'maroon';
sandbox.src = getBlobURL(createSourceHTML(loadedSource));


const runButton = document.createElement('button');
runButton.id = 'runButton'
runButton.textContent = 'runCode'
runButton.style.margin = '1rem';


const editorDiv = document.createElement('div');
editorDiv.id = 'editor-div';
editorDiv.style.width = '100%';
editorDiv.style.backgroundColor = 'dodgerblue'

const editor = new Editor(editorDiv, loadedSource);


document.body.appendChild(runButton);
document.body.appendChild(sandbox);
document.body.appendChild(editorDiv);
document.body.style.backgroundColor = 'teal'

runButton.addEventListener('click', (e) => reloadSketch(sandbox, editor));
