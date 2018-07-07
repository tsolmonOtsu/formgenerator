var html2canvas = require('html2canvas');
var domtoimage = require('dom-to-image');


function randomLength(min, max){
  return parseInt(min + Math.random()*10 % (max-min));
}

function randomText(){
  var length = randomLength(5, 10);
  var text = "";
  var possible = "abcdefghijklmnopqrstuvwxyz ";

  for (var i = 0; i < length; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}

function randomNumber(){
  var length = randomLength(5, 10);
  return Math.random().toString().slice(-length)
}

function createElement(element, classes){
  var element = document.createElement(element);
  element.classList.add(...classes.split(" "));
  return element;
}

function createLabel(labelText){
  var text = document.createTextNode(labelText);
  var label = createElement('label', 'uk-form-label');
  label.appendChild(text);
  return label;
}

function addInputElement(type, value, label, form){
  var row = createElement('div', 'uk-margin-small');
  var label = createLabel(label);
  var container = createElement('div', 'uk-form-controls');

  var input = createElement('input', 'uk-input uk-form-small');
  input.setAttribute('type', type);
  input.setAttribute('value', value);

  container.appendChild(input);
  row.appendChild(label);
  row.appendChild(container);
  
  form.appendChild(row);
}

function addButton(buttonText, form){
  var text = document.createTextNode(buttonText);
  var row = createElement('div', 'uk-margin');
  var button = createElement('button', 'uk-button uk-button-small');
  button.appendChild(text);
  row.appendChild(button);
  form.appendChild(row);
}

function addHr(form){
  form.appendChild(document.createElement('hr'));
}

var elements = [
  function(form){addInputElement('text', randomText(), randomText(), form);},
  function(form){addInputElement('number', randomNumber(), randomText(), form);},
  function(form){addInputElement('password', randomText(), randomText(), form);},
  function(form){addHr(form);},
  function(form){addButton(randomText(), form);}
]

function addRandomElement(form){
  var index = parseInt(Math.random() * 100) % elements.length;
  elements[index](form);
}

/**
 * Takes screenshot using dom-to-image
 * @param {string} filename 
 */
function takeScreenshot1(filename){
  return domtoimage.toJpeg(document.getElementById('form').firstChild, {quality:0.8}).then(function(dataUrl){
    var link = document.createElement('a');
    link.download = filename + '.jpeg';
    link.href = dataUrl;
    link.click();
    return;
  })
}

/**
 * Takes screenshot using html2canvas
 * @param {string} filename 
 */
function takeScreenshot2(filename, data){
  return html2canvas(document.getElementById('form').firstChild, {
    foreignObjectRendering: false,
    logging: false,
  }).then(function(canvas){
    var ctx = canvas.getContext('2d');
    ctx.scale(scaleFactor, scaleFactor);
    ctx.drawImage(canvas, 0, 0);

    var smallCanvas = document.createElement('canvas');   
    smallCanvas.width = canvas.width*scaleFactor;
    smallCanvas.height = canvas.height*scaleFactor; 
    ctx = smallCanvas.getContext('2d');
    ctx.drawImage(canvas, 0, 0);

    var imageData = ctx.getImageData(0, 0, smallCanvas.width, smallCanvas.height);
    var offset = (parseInt(filename) - 1) * smallCanvas.width * smallCanvas.height;
    for (let i = 0, j=0; i < imageData.data.length; i+=4, j++) {
      data[offset+j] = imageData.data[i];
      // console.log(imageData.data[i] + ' ' + imageData.data[i+1] + ' ' + imageData.data[i+2])
    }    
    
    // ctx.putImageData(imageData, 0, 0);
    // var link = document.createElement('a');
    // link.download = filename + '.jpeg';
    // link.href = smallCanvas.toDataURL('image/jpeg', 0.8);
    // link.click();
    return;
  })
}

function clearBody(){
  var form = document.getElementById('form');
  while(form.firstChild){
    form.removeChild(form.firstChild);
  }
}

function generateForm(elementCount, iterationCount, json, data){
  console.log(iterationCount)
  if(!iterationCount) {
    downloadJSON(json);
    downloadData(data);
    return;
  }
  
  clearBody();
  var form = createElement('form', 'uk-form-stacked');
  var totalElements = elementCount;
  while (totalElements) {
    addRandomElement(form);
    totalElements--;
  }
  var $form = document.getElementById('form');
  $form.appendChild(form);
  json[iterationCount] = $form.innerHTML
  $form.firstChild.style.height = (66*elementCount) +"px";
  takeScreenshot2(iterationCount, data).then(function(){
    generateForm(elementCount, iterationCount - 1, json, data)
  });
}

function downloadJSON(json){
  var a = document.createElement("a");
  var file = new Blob([JSON.stringify(json)], {type: 'application/json'});
  a.href = URL.createObjectURL(file);
  a.download = 'data.json';
  a.click();
}

function downloadData(data){
  var a = document.createElement("a");
  var blob = new Blob(data, {type: "octet/stream"}),
      url = window.URL.createObjectURL(blob);
  a.href = url;
  a.download = "image.bin";
  a.click();
  window.URL.revokeObjectURL(url);
}


var scaleFactor = .8;

window.onload = function () {
  document.getElementById('formGenerator').addEventListener('submit', (e)=>{
    e.preventDefault();
    var elementCount = parseInt(document.getElementById('elementCount').value) || 5;
    var formCount = parseInt(document.getElementById('formCount').value) || 1;
    
    var json = {};
    var length = (66*elementCount + 10)*120*formCount*scaleFactor*scaleFactor;
    var data = new Uint8Array(length);
    console.log(length);

    
    generateForm(elementCount, formCount, json, data);
    
  })  
}