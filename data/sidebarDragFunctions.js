var prevDragPos = '';
var dragPos = '';
var openFolderTimer = null;

function onoteDragStart(event) {
  event.dataTransfer.setData('text/plain', 'This text may be dragged');
  event.dataTransfer.effectAllowed = 'move';
}

function onoteDragEnter(event) {
  event.preventDefault();
  event.dataTransfer.dropEffect = 'move';
}

function onoteDragOver(event) {
  event.preventDefault();
  var t = event.currentTarget;
  var relativeYpos = event.pageY - t.offsetTop;
  
  var pct20 = Math.round(t.clientHeight * 0.2);
  var pct70 = Math.round(t.clientHeight * 0.7);
  
  if(relativeYpos <= pct20) dragPos = 'top';
  else if(relativeYpos <= pct70) dragPos = 'middle';
  else if(relativeYpos > pct70) dragPos = 'bottom';
  
  console.log(relativeYpos + '<->' + pct70 + ' ' + t.clientHeight + ' index: ' + t.dataset.onotesindex + ' ' + dragPos + ' ' + prevDragPos);
  
  if(dragPos != prevDragPos) {
    console.log('POS CHANGE FROM '+prevDragPos+' TO '+dragPos);
    prevDragPos = dragPos;
    t.style.borderTop = '';
    t.style.borderBottom = '';
    if(t.nextElementSibling != null) t.nextElementSibling.style.borderTop = '';
    if(t.parentElement.className == 'folder') {
      t.className = ''; //Folder label div
      t.nextElementSibling.children[0].style.borderTop = ''; //First item in folder
      t.parentElement.nextElementSibling.style.borderTop = ''; //Item after folder
    }
    switch(dragPos) {
      case 'top':
        t.style.borderTop = '1px dashed black';
        console.log('BORDER TOP SET');
        clearTimeout(openFolderTimer);
        openFolderTimer = null;
        break;
      case 'middle':
        if(t.parentElement.className == 'folder') {
          t.className = 'selected';
          var folderContentsDiv = t.parentElement.getElementsByClassName('folderContents')[0];
          if(folderContentsDiv.hasChildNodes() && getComputedStyle(folderContentsDiv).display == 'none' && openFolderTimer == null) {
            openFolderTimer = setTimeout(onoteDragOpenFolder, 500, folderContentsDiv);
          }
          console.log('FOLDER SELECTED');
        }
        else {t.style.borderTop = '1px dashed black'; console.log('BORDER TOP SET FOR MIDDLE')}
        break;
      case 'bottom':
        clearTimeout(openFolderTimer);
        openFolderTimer = null;
        if(t.nextElementSibling == null) {
          t.style.borderBottom = '1px dashed black';
          console.log('BORDER BOTTOM SET');
        }
        else if(t.nextElementSibling.className == 'folderContents') {
          if(getComputedStyle(t.nextElementSibling).display == 'block') {
            t.nextElementSibling.children[0].style.borderTop = '1px dashed black';
            console.log('FIRST FOLDER ITEM BORDER TOP SET');
          }
          else {
            t.parentElement.nextElementSibling.style.borderTop = '1px dashed black';
            console.log('ITEM AFTER FOLDER BORDER TOP SET')
          }
        }
        else {
          t.nextElementSibling.style.borderTop = '1px dashed black';
          console.log('NEXT ELEMENT BORDER TOP SET');
        }
        break;
    }
  }
}

function onoteDragOpenFolder(folderContentsDiv) {
  folderContentsDiv.previousElementSibling.getElementsByTagName('img')[0].src = 'onotes-triangledown-7.png';
  folderContentsDiv.style.display = 'block';
}

function onoteDragLeave(event) {
  event.preventDefault();
  clearTimeout(openFolderTimer);
  openFolderTimer = null;
  var t = event.currentTarget;
  console.log('DRAG LEAVE INDEX: '+t.dataset.onotesindex);
  t.style.borderTop = '';
  t.style.borderBottom = '';
  if(t.nextSibling != null) t.nextSibling.style.borderTop = '';
  if(t.parentElement.className == 'folder') t.className = '';
  dragPos = prevDragPos = '';
}

function onoteDrop(event) {
  event.preventDefault();
  clearTimeout(openFolderTimer);
  openFolderTimer = null;
  var t = event.currentTarget;
  t.style.borderTop = '';
  t.style.borderBottom = '';
  if(t.nextSibling != null) t.nextSibling.style.borderTop = '';
  if(t.parentElement.className == 'folder') t.className = '';
  dragPos = prevDragPos = '';
  console.log('dropped over: '+ t.dataset.onotesindex + ' ' + dragPos);
}