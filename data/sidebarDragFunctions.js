var dragData = {};

function onoteDragStart(event) {
  event.dataTransfer.setData('text/plain', event.currentTarget.dataset.onotesindex);
  event.dataTransfer.effectAllowed = 'move';
}

function onoteDragEnter(event) {
  event.preventDefault();
  event.dataTransfer.dropEffect = 'move';
  var t = event.currentTarget;
  var i = t.dataset.onotesindex;
  dragData[i] = {
    pos: '',
    prevPos: '',
    clientHeight: t.clientHeight,
    offsetTop: t.offsetTop,
    pct20: Math.round(this.clientHeight * 0.2),
    pct70: Math.round(this.clientHeight * 0.7),
    isFolder: false,
    isTrash: false,
    folderContentsDiv: null,
    folderOpen: false,
    folderEmpty: true,
    openFolderTimer: null,
  }
  if(t.parentElement.classList.contains('folder')) {
    dragData[i].isFolder = true;
    dragData[i].folderContentsDiv = t.parentElement.getElementsByClassName('folderContents')[0];
    dragData[i].folderOpen = dragData[i].folderContentsDiv.classList.contains('open');
    dragData[i].folderEmpty = !dragData[i].folderContentsDiv.hasChildNodes();
  }
}

function onoteDragOver(event) {
  event.preventDefault();
  event.dataTransfer.dropEffect = 'move';
  var t = event.currentTarget;
  var i = t.dataset.onotesindex;
  var relativeYpos = (event.pageY + document.getElementById('ONotesList').scrollTop) - dragData[i].offsetTop;
  
  if(relativeYpos <= dragData[i].pct20) dragData[i].pos = 'top';
  else if(relativeYpos <= dragData[i].pct70) dragData[i].pos = 'middle';
  else if(relativeYpos > dragData[i].pct70) dragData[i].pos = 'bottom';
  
  if(dragData[i].pos != dragData[i].prevPos) {
    dragData[i].prevPos = dragData[i].pos;
    clearDropStyles(t);

    switch(dragData[i].pos) {
      case 'top':
        clearTimeout(dragData[i].openFolderTimer);
        dragData[i].openFolderTimer = null;
        t.classList.add('dropAbove');
        break;
      case 'middle':
        if(dragData[i].isFolder) {
          t.classList.add('selected');          
          if(!dragData[i].folderEmpty && !dragData[i].folderOpen && dragData[i].openFolderTimer == null) {
            dragData[i].openFolderTimer = setTimeout(onoteDragOpenFolder, 500, dragData[i].folderContentsDiv);
          }
        }
        else {
          t.classList.add('dropAbove');
        }
        break;
      case 'bottom':
        clearTimeout(dragData[i].openFolderTimer);
        dragData[i].openFolderTimer = null;
        if(dragData[i].isFolder) {
          if(dragData[i].folderOpen) {
            dragData[i].folderContentsDiv.children[0].classList.add('dropAbove');
          }
          else {
            t.parentElement.classList.add('dropBelow');
          }
        }
        else {
          t.classList.add('dropBelow');
        }
        break;
    }
  }
}

function onoteDragOpenFolder(folderContentsDiv) {
  folderContentsDiv.classList.add('open');
  folderContentsDiv.previousElementSibling.getElementsByTagName('img')[0].src = 'onotes-triangledown-7.png';
  dragData[folderContentsDiv.previousElementSibling.dataset.onotesindex].folderOpen = true;
}

function onoteDragLeave(event) {
  event.preventDefault();
  clearTimeout(dragData[event.currentTarget.dataset.onotesindex].openFolderTimer);
  clearDropStyles(event.currentTarget);
}

function onoteDrop(event) {
  event.preventDefault();
  clearTimeout(dragData[event.currentTarget.dataset.onotesindex].openFolderTimer);
  clearDropStyles(event.currentTarget);
  console.log('dropped over: '+ event.currentTarget.dataset.onotesindex + ' ' + dragData[event.currentTarget.dataset.onotesindex].pos);
  dragData = {};  
}

function clearDropStyles(t) {
  t.classList.remove('dropAbove', 'dropBelow', 'selected');
  if(dragData[t.dataset.onotesindex].isFolder) {
    if(!dragData[t.dataset.onotesindex].folderEmpty) t.nextElementSibling.children[0].classList.remove('dropAbove'); //First item in folder if it exists
    t.parentElement.classList.remove('dropBelow');
  }
}