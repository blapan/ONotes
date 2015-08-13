var dragData = {};

function onoteDragStart(event) {
  event.dataTransfer.setData('text/plain', getONoteIndex(event.currentTarget));
  event.dataTransfer.effectAllowed = 'move';
  selectOnote(event.currentTarget);
}

function onoteDragEnter(event) {
  event.preventDefault();
  event.dataTransfer.dropEffect = 'move';
  var t = event.currentTarget;  
  var i = getONoteIndex(t);
  t.setAttribute('data-onotespath', i); //This can't be removed onLeave, not sure why
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
  var i = t.dataset.onotespath;
  var relativeYpos = (event.pageY + document.getElementById('ONotesDisplay').scrollTop) - dragData[i].offsetTop;
  
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
  dragData[folderContentsDiv.previousElementSibling.dataset.onotespath].folderOpen = true;
}

function onoteDragLeave(event) {
  event.preventDefault();
  clearTimeout(dragData[event.currentTarget.dataset.onotespath].openFolderTimer);
  clearDropStyles(event.currentTarget);
}

function onoteDrop(event) {
  event.preventDefault();
  clearTimeout(dragData[event.currentTarget.dataset.onotespath].openFolderTimer);
  clearDropStyles(event.currentTarget);
  console.log('dropped ' + getONoteIndex(selectedDiv) + ' over: '+ event.currentTarget.dataset.onotespath + ' ' + dragData[event.currentTarget.dataset.onotespath].pos);
  dragData = {};  
}

function clearDropStyles(t) {
  t.classList.remove('dropAbove', 'dropBelow');
  if(dragData[t.dataset.onotespath].isFolder) {
    if(t != selectedDiv) t.classList.remove('selected'); //Only remove the selected class from target if it isn't the selected div
    if(!dragData[t.dataset.onotespath].folderEmpty) t.nextElementSibling.children[0].classList.remove('dropAbove'); //First item in folder if it exists
    t.parentElement.classList.remove('dropBelow');
  }
}

function onoteMove(source, dest, pos) {
  var sIndex = getONoteIndex(source);
  var dIndex = getONoteIndex(dest);
  var sPath = sIndex.slice(0, sIndex.lastIndexOf('.') > 0 ? sIndex.lastIndexOf('.') : 0);
  var sBase = parseInt(sIndex.slice(sIndex.lastIndexOf('.') + 1));
  var dPath = dIndex.slice(0, dIndex.lastIndexOf('.') > 0 ? dIndex.lastIndexOf('.') : 0);
  var dBase = dIndex == 'trash' ? 'trash' : parseInt(dIndex.slice(dIndex.lastIndexOf('.') + 1));
  var dParrent = dest.parentElement;
  
  if(source.parentElement.classList.contains('folder')) {
    source = source.parentElement;
  }
  
  if(dest.parentElement.classList.contains('folder')) {
    dest = dest.parentElement;
    dParrent = dest.parentElement;
    if(pos == 'middle') {
      var dParrent = dest.getElementsByClassName('folderContents')[0];
      if(dPath == '') dPath = dBase.toString();
      else dPath = dPath + '.' + dBase;
      if(!dParrent.hasChildNodes()) dBase = '0';
      else if(dParrent.lastChild.classList.contains('folder')) dBase = (parseInt(dParrent.lastChild.getElementsByClassName('ONotesLabel')[0].dataset.onotesindex) + 1).toString();
      else dBase = (parseInt(dParrent.lastChild.dataset.onotesindex) + 1).toString();
      dest = null;
    }
  }  
  
  if(pos == 'bottom') {
    ++dBase;
    dest = dest.nextElementSibling;
  }
  
  var shiftUp = false;
  if(sPath == dPath && dBase > sBase) {
    --dBase;
    shiftUp = true;
  }
  
  var sFolder = getONote(sPath);
  var dFolder = getONote(dPath);
  if(sFolder.value != undefined) sFolder = sFolder.value;
  if(dFolder.value != undefined) dFolder = dFolder.value;
  
  if(sPath != dPath) {
    //Clone the source object so isn't deleted in the next step
    var clone = Object.assign({}, sFolder[sBase]);
    //Leave the index intact so that the data-* HTML attributes don't need to be updated in the source folder
    sFolder[sBase] = undefined;
    dFolder.splice(dBase, 0, clone);
  }
  else dFolder.splice(dBase, 0, sFolder.splice(sBase, 1)[0]);
  
  if(dest == null) dParrent.appendChild(source);
  else dest.parentElement.insertBefore(source, dest);
  
  var traverse = source;
  while(traverse != null && ((shiftUp && dBase >= sBase) || dBase <= sBase || sPath != dPath)) {
    if(dFolder[dBase] === undefined || dFolder[dBase].deleted) {
      if(shiftUp) --dBase;
      else ++dBase;
      continue;
    }
    if(traverse.classList.contains('folder')) traverse.getElementsByClassName('ONotesLabel')[0].setAttribute('data-onotesindex', dBase);
    else traverse.setAttribute('data-onotesindex', dBase);
    if(shiftUp) {
      traverse = traverse.previousElementSibling;
      --dBase;
    }
    else {
      traverse = traverse.nextElementSibling;
      ++dBase;  
    } 
  }
}

function testMove() {
  console.log('TEST 01 - TEST14 above TEST1');
  onoteMove(document.getElementById('TEST14'), document.getElementById('TEST1'), 'top');
  if(!checkTree(document.getElementById('ONotesList'))) return false;
  if(!checkTree(document.getElementById('ONotesTrash').getElementsByClassName('folderContents')[0])) return false;
  console.log('TEST 02 - TEST11 below TEST10 FOLDER');
  onoteMove(document.getElementById('TEST11'), document.getElementById('TEST10 FOLDER'), 'bottom');
  if(!checkTree(document.getElementById('ONotesList'))) return false;
  if(!checkTree(document.getElementById('ONotesTrash').getElementsByClassName('folderContents')[0])) return false;
  console.log('TEST 03 - TEST14 into TEST10 FOLDER');
  onoteMove(document.getElementById('TEST14'), document.getElementById('TEST10 FOLDER'), 'middle');
  if(!checkTree(document.getElementById('ONotesList'))) return false;
  if(!checkTree(document.getElementById('ONotesTrash').getElementsByClassName('folderContents')[0])) return false;
  console.log('TEST 04 - TEST10 FOLDER below TEST12');
  onoteMove(document.getElementById('TEST10 FOLDER'), document.getElementById('TEST12'), 'bottom');
  if(!checkTree(document.getElementById('ONotesList'))) return false;
  if(!checkTree(document.getElementById('ONotesTrash').getElementsByClassName('folderContents')[0])) return false;
  console.log('TEST 05 - TEST1 below TEST16');
  onoteMove(document.getElementById('TEST1'), document.getElementById('TEST16'), 'bottom');
  if(!checkTree(document.getElementById('ONotesList'))) return false;
  if(!checkTree(document.getElementById('ONotesTrash').getElementsByClassName('folderContents')[0])) return false;
  console.log('TEST 06 - TEST3 below SUBTEST2 SUBFOLDER-SUBTEST1');
  onoteMove(document.getElementById('TEST3'), document.getElementById('SUBTEST2 SUBFOLDER-SUBTEST1'), 'bottom');
  if(!checkTree(document.getElementById('ONotesList'))) return false;
  if(!checkTree(document.getElementById('ONotesTrash').getElementsByClassName('folderContents')[0])) return false;
  console.log('TEST 07 - TEST16 above SUBTEST2 SUBFOLDER-SUBTEST0');
  onoteMove(document.getElementById('TEST6'), document.getElementById('SUBTEST2 SUBFOLDER-SUBTEST0'), 'top');
  if(!checkTree(document.getElementById('ONotesList'))) return false;
  if(!checkTree(document.getElementById('ONotesTrash').getElementsByClassName('folderContents')[0])) return false;
  console.log('TEST 08 - TEST2 into TEST17 EMPTY FOLDER');
  onoteMove(document.getElementById('TEST2'), document.getElementById('TEST17 EMPTY FOLDER'), 'middle');
  if(!checkTree(document.getElementById('ONotesList'))) return false;
  if(!checkTree(document.getElementById('ONotesTrash').getElementsByClassName('folderContents')[0])) return false;
  console.log('TEST 09 - TEST0 below TEST17 EMPTY FOLDER');
  onoteMove(document.getElementById('TEST0'), document.getElementById('TEST17 EMPTY FOLDER'), 'bottom');
  if(!checkTree(document.getElementById('ONotesList'))) return false;
  if(!checkTree(document.getElementById('ONotesTrash').getElementsByClassName('folderContents')[0])) return false;
  console.log('TEST 10 - SUBTEST2 SUBFOLDER into TEST17 EMPTY FOLDER');
  onoteMove(document.getElementById('SUBTEST2 SUBFOLDER'), document.getElementById('TEST17 EMPTY FOLDER'), 'middle');
  if(!checkTree(document.getElementById('ONotesList'))) return false;
  if(!checkTree(document.getElementById('ONotesTrash').getElementsByClassName('folderContents')[0])) return false;
  console.log('TEST 11 - TEST4 below TEST22');
  onoteMove(document.getElementById('TEST4'), document.getElementById('TEST22'), 'bottom');
  if(!checkTree(document.getElementById('ONotesList'))) return false;
  if(!checkTree(document.getElementById('ONotesTrash').getElementsByClassName('folderContents')[0])) return false;
  console.log('TEST 12 - TEST17 EMPTY FOLDER below TEST4');
  onoteMove(document.getElementById('TEST17 EMPTY FOLDER'), document.getElementById('TEST4'), 'bottom');
  if(!checkTree(document.getElementById('ONotesList'))) return false;
  if(!checkTree(document.getElementById('ONotesTrash').getElementsByClassName('folderContents')[0])) return false;
  console.log('TEST 13 - TEST18 below TEST8');
  onoteMove(document.getElementById('TEST18'), document.getElementById('TEST8'), 'bottom');
  if(!checkTree(document.getElementById('ONotesList'))) return false;
  if(!checkTree(document.getElementById('ONotesTrash').getElementsByClassName('folderContents')[0])) return false;
  console.log('TEST 14 - TEST FOLDER IN TRASH into TEST10 FOLDER');
  onoteMove(document.getElementById('TEST FOLDER IN TRASH'), document.getElementById('TEST10 FOLDER'), 'middle');
  if(!checkTree(document.getElementById('ONotesList'))) return false;
  if(!checkTree(document.getElementById('ONotesTrash').getElementsByClassName('folderContents')[0])) return false;
  console.log('TEST 15 - TEST17 EMPTY FOLDER above SUBTEST4');
  onoteMove(document.getElementById('TEST17 EMPTY FOLDER'), document.getElementById('SUBTEST4'), 'top');
  if(!checkTree(document.getElementById('ONotesList'))) return false;
  if(!checkTree(document.getElementById('ONotesTrash').getElementsByClassName('folderContents')[0])) return false;
  console.log('TEST COMPLETE');
  return true;
}

function checkTree(root) {
  var noErrors = true;
  var noErrorsFolder = true;
  for(var i = 0; i < root.children.length; ++i) {
    var onotediv = root.children[i];
    if(onotediv.classList.contains('folder')) {
      onotediv = onotediv.getElementsByClassName('ONotesLabel')[0];
    }
    var onoteIndex = getONoteIndex(onotediv);
    if(!onoteIndex) {
      console.error('COULD NOT GET INDEX FOR', onotediv);
      return false;
    }
    var onoteData = getONote(onoteIndex);
    if(!onoteData) {
      console.error('COULD NOT GET DATA FOR INDEX', onoteIndex, '@', onotediv);
      return false;
    }
    if(onotediv.textContent != onoteData.label) {
      console.error(onotediv.textContent, 'DOES NOT MATCH', onoteData.label, 'AT INDEX', onoteIndex);
      noErrors = false;
    }
    if(onotediv.parentElement.classList.contains('folder')) {
      noErrorsFolder = checkTree(onotediv.parentElement.getElementsByClassName('folderContents')[0]);
    }
  }
  return noErrors && noErrorsFolder;
}
