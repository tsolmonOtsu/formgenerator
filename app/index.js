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
function takeScreenshot2(filename){
  return html2canvas(document.getElementById('form').firstChild, {
    foreignObjectRendering: false,
    logging: false
  }).then(function(canvas){
    var link = document.createElement('a');
    link.download = filename + '.jpeg';
    link.href = canvas.toDataURL('image/jpeg', 0.8);
    link.click();
    return;
  })
}

function clearBody(){
  var form = document.getElementById('form');
  while(form.firstChild){
    form.removeChild(form.firstChild);
  }
}

function generateForm(elementCount, iterationCount, json){
  if(!iterationCount) return;
  
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
  takeScreenshot2(iterationCount).then(function(){
    generateForm(elementCount, iterationCount - 1, json)
  });
}

function downloadJSON(json){
  var a = document.createElement("a");
  var file = new Blob([JSON.stringify(json)], {type: 'application/json'});
  a.href = URL.createObjectURL(file);
  a.download = 'data.json';
  a.click();
}

window.onload = function () {
  document.getElementById('formGenerator').addEventListener('submit', (e)=>{
    e.preventDefault();
    var elementCount = document.getElementById('elementCount').value || 5;
    var formCount = document.getElementById('formCount').value || 1;
    
    var json = {};
    generateForm(elementCount, formCount, json);
    downloadJSON(json);
  })  
}