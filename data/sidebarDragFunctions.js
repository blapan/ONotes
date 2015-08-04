var prevDragPos = '';
var dragPos = '';
var openFolderTimer = null;

var dropData = {
  pos: '',
  prevPos: '',
  clientHeight: 0,
  offsetTop: 0,
  isFolder: false,
  folderContentsDiv: null,
  folderOpen: false,
  folderEmpty: true,
  openFolderTimer: null,
}

function onoteDragStart(event) {
  event.dataTransfer.setData('text/plain', 'This text may be dragged');
  event.dataTransfer.effectAllowed = 'move';
}

function onoteDragEnter(event) {
  event.preventDefault();
  event.dataTransfer.dropEffect = 'move';
  var t = event.currentTarget;
  dropData.offsetTop = t.offsetTop;
  dropData.clientHeight = t.clientHeight;
  if(t.parentElement.classList.contains('folder')) {
    dropData.isFolder = true;
    dropData.folderContentsDiv = t.parentElement.getElementsByClassName('folderContents')[0];
    dropData.folderOpen = dropData.folderContentsDiv.classList.contains('open');
    dropData.folderEmpty = dropData.folderContentsDiv.hasChildNodes();
  }
  else {
    dropData.isFolder = false;
    dropData.folderContentsDiv = null;
    dropData.folderOpen = false;
    dropData.folderEmpty = true;
  }
}

function onoteDragOver(event) {
  event.preventDefault();
  event.dataTransfer.dropEffect = 'move';
  var t = event.currentTarget;
  var relativeYpos = (event.pageY + document.getElementById('ONotesList').scrollTop) - t.offsetTop;
  
  var pct20 = Math.round(t.clientHeight * 0.2);
  var pct70 = Math.round(t.clientHeight * 0.7);
  
  if(relativeYpos <= pct20) dragPos = 'top';
  else if(relativeYpos <= pct70) dragPos = 'middle';
  else if(relativeYpos > pct70) dragPos = 'bottom';
  
  console.log(relativeYpos + '<->' + pct70 + ' ' + t.clientHeight + ' ' + event.pageY + '/' + event.clientY + '-' + t.offsetTop + ' index: ' + t.dataset.onotesindex + ' ' + dragPos + ' ' + prevDragPos);
  
  if(dragPos != prevDragPos) {
    console.log('POS CHANGE FROM '+prevDragPos+' TO '+dragPos);
    prevDragPos = dragPos;
    clearDropStyles(t);
    if(t.parentElement.classList.contains('folder')) {
      var folderContentsDiv = t.parentElement.getElementsByClassName('folderContents')[0];
    }
    switch(dragPos) {
      case 'top':
        clearTimeout(openFolderTimer);
        openFolderTimer = null;
        t.classList.add('dropAbove');
        console.log('BORDER TOP SET');
        break;
      case 'middle':
        if(t.parentElement.classList.contains('folder')) {
          t.classList.add('selected');          
          if(folderContentsDiv.hasChildNodes() && !folderContentsDiv.classList.contains('open') && openFolderTimer == null) {
            openFolderTimer = setTimeout(onoteDragOpenFolder, 500, folderContentsDiv);
          }
          console.log('FOLDER SELECTED');
        }
        else {
          t.classList.add('dropAbove');
          console.log('BORDER TOP SET FOR MIDDLE')
        }
        break;
      case 'bottom':
        clearTimeout(openFolderTimer);
        openFolderTimer = null;
        if(t.parentElement.classList.contains('folder')) {
          if(folderContentsDiv.classList.contains('open')) {
            folderContentsDiv.children[0].classList.add('dropAbove');
            console.log('FIRST FOLDER ITEM BORDER TOP SET');
          }
          else {
            t.parentElement.classList.add('dropBelow');
            console.log('ITEM AFTER FOLDER BORDER TOP SET')
          }
        }
        else {
          t.classList.add('dropBelow');
          console.log('NEXT ELEMENT BORDER TOP SET');
        }
        break;
    }
  }
}

function onoteDragOpenFolder(folderContentsDiv) {
  folderContentsDiv.previousElementSibling.getElementsByTagName('img')[0].src = 'onotes-triangledown-7.png';
  folderContentsDiv.classList.add('open');
}

function onoteDragLeave(event) {
  event.preventDefault();
  clearTimeout(openFolderTimer);
  openFolderTimer = null;
  clearDropStyles(event.currentTarget);
  console.log('DRAG LEAVE INDEX: ' + event.currentTarget.dataset.onotesindex);
  dragPos = prevDragPos = '';
}

function onoteDrop(event) {
  event.preventDefault();
  clearTimeout(openFolderTimer);
  openFolderTimer = null;
  clearDropStyles(event.currentTarget);
  dragPos = prevDragPos = '';
  console.log('dropped over: '+ event.currentTarget.dataset.onotesindex + ' ' + dragPos);
}

function clearDropStyles(t) {
  t.classList.remove('dropAbove', 'dropBelow');
  if(t.parentElement.classList.contains('folder')) {
    t.classList.remove('selected'); //Folder label div
    if(t.nextElementSibling.hasChildNodes()) t.nextElementSibling.children[0].classList.remove('dropAbove'); //First item in folder if it exists
    t.parentElement.classList.remove('dropBelow');
  }
}