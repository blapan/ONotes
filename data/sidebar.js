var ONotesArr = [];
var ONotesTrashArr = [];
var ONotesTrash = document.getElementById('ONotesTrash');
var ONotesDiv = document.getElementById('ONotesList');
var ONotesEdit = document.getElementById('ONotesEdit');
var ONotesNewNote = document.getElementById('ONotesNewNote');
var ONotesNewFolder = document.getElementById('ONotesNewFolder');
var ONotesDelete = document.getElementById('ONotesDelete');
var selectedDiv = null;
var selectedIndex = -1;
var bg = null;

ONotesEdit.value = '';
ONotesEdit.disabled = true;

browser.runtime.onMessage.addListener(function(message) {
  if(message.action == 'create-onote') {
    addONote(message.data);
  }
});

initONotes();

async function initONotes() {
  bg = await browser.runtime.getBackgroundPage();
  
  ONotesArr = bg.odm.data;
  ONotesTrashArr = bg.odm.trash;
  
  for(var i = 0; i < ONotesArr.length; ++i) {
    addONote(ONotesArr[i], i);
  }
  
  if(ONotesTrashArr.length > 0) {
    ONotesTrash.getElementsByClassName('ONotesLabel')[0].classList.add('nonEmpty');
    for(var i = 0; i < ONotesTrashArr.length; ++i) {
      addONote(ONotesTrashArr[i], i, ONotesTrash.getElementsByClassName('folderContents')[0]);
    }
  }
  
  var folderEndDiv = document.createElement('div');
  folderEndDiv.className = 'folderEndDiv';
  folderEndDiv.addEventListener('dragenter', onoteDragEnter);
  folderEndDiv.addEventListener('dragover', onoteDragOver);
  folderEndDiv.addEventListener('dragleave', onoteDragLeave);
  folderEndDiv.addEventListener('drop', onoteDrop);
  ONotesTrash.getElementsByClassName('folderContents')[0].appendChild(folderEndDiv);
  
  document.getElementById('ONotesToolbar').addEventListener('dragover', function(event) {
    var displayDiv = document.getElementById('ONotesDisplay');
    if(displayDiv.scrollTop > 0) displayDiv.scrollTop -= 10;
  });
  
  ONotesEdit.addEventListener('keyup', updateONote);
  ONotesEdit.addEventListener('dragover', function(event) {
    event.preventDefault();
    event.dataTransfer.effectAllowed = 'none';
    var displayDiv = document.getElementById('ONotesDisplay');
    if(displayDiv.scrollTop < displayDiv.scrollTopMax) displayDiv.scrollTop += 10;
  });
  ONotesEdit.addEventListener('drop', function() { return false; });
  ONotesNewNote.addEventListener('click', newOnote);
  ONotesNewFolder.addEventListener('click', newOnoteFolder);
  ONotesDelete.addEventListener('click', deleteOnote);
  
  ONotesTrash.children[0].addEventListener('dragenter', onoteDragEnter);
  ONotesTrash.children[0].addEventListener('dragover', onoteDragOver);
  ONotesTrash.children[0].addEventListener('dragleave', onoteDragLeave);
  ONotesTrash.children[0].addEventListener('drop', onoteDrop);
  ONotesTrash.children[0].addEventListener('click', toggleFolder);
}

function addONote(ONote, index, parentDiv) {
  if(ONote.deleted) return false;
  if(typeof index == 'undefined') {
    index = ONotesArr.length;
    ONotesArr.push(ONote);
  }
  if(typeof parentDiv == 'undefined') {
    parentDiv = ONotesDiv;
  }
  var e = document.createElement('div');
  var selectableDiv = e;
  
  if(typeof ONote.value == 'object') {
    e.className = 'folder';
    var folderLabel = document.createElement('div');
    var folderContents = document.createElement('div');
    var arrowImg = document.createElement('img');
    var folderImg = document.createElement('img');
    selectableDiv = folderLabel;
    arrowImg.src = 'onotes-triangleright-7.png';
    folderImg.src = 'silk/folder.png';
    arrowImg.setAttribute('draggable', false);
    folderImg.setAttribute('draggable', false);
    folderLabel.appendChild(arrowImg);
    folderLabel.appendChild(folderImg);
    folderContents.className = 'folderContents';
    for(var i = 0; i < ONote.value.length; ++i) {
      //addONote(ONote.value[i], index + '.' + i, folderContents);
      addONote(ONote.value[i], i, folderContents);
    }
    var folderEndDiv = document.createElement('div');
    folderEndDiv.className = 'folderEndDiv';
    folderEndDiv.addEventListener('dragenter', onoteDragEnter);
    folderEndDiv.addEventListener('dragover', onoteDragOver);
    folderEndDiv.addEventListener('dragleave', onoteDragLeave);
    folderEndDiv.addEventListener('drop', onoteDrop);
    folderLabel.className = 'ONotesLabel folderLabel';
    folderLabel.addEventListener('click', toggleFolder);
    folderContents.appendChild(folderEndDiv);
    e.appendChild(folderLabel);
    e.appendChild(folderContents);
  }
  else {
    var noteImg = document.createElement('img');
    noteImg.src = 'silk/note.png';
    noteImg.setAttribute('draggable', false);
    e.appendChild(noteImg);
    e.addEventListener('click', selectOnote);
    e.className = 'ONotesLabel';
  }
  selectableDiv.setAttribute('data-onotesindex', index);
  var span = document.createElement('span');
  span.appendChild(document.createTextNode(ONote.label))
  selectableDiv.appendChild(span);
  selectableDiv.setAttribute('draggable', true);
  selectableDiv.addEventListener('dragstart', onoteDragStart);
  selectableDiv.addEventListener('dragenter', onoteDragEnter);
  selectableDiv.addEventListener('dragover', onoteDragOver);
  selectableDiv.addEventListener('dragleave', onoteDragLeave);
  selectableDiv.addEventListener('drop', onoteDrop);
  
  //FOR TESTING ONLY
  selectableDiv.id = ONote.label;
  
  parentDiv.appendChild(e);
  return e;
}

function getONoteIndex(element) {
  var indexArr = [];
  var temp = element;
  while(temp.id != 'ONotesList' && temp.id != 'ONotesTrash') {
    if(temp.classList.contains('folderContents')) indexArr.unshift(temp.previousElementSibling.dataset.onotesindex);
    else if(temp.classList.contains('ONotesLabel')) indexArr.unshift(temp.dataset.onotesindex);
    temp = temp.parentElement;
  }
  return indexArr.join('.');
}

function getONote(index) {
  var temp = ONotesArr;
  var indexArr = [];
  if(index != '' && index != null) {
    indexArr = index.split('.');
    if(indexArr[0] == 'trash') {
      indexArr.shift();
      temp = ONotesTrashArr;
    }
  }  
  
  for(var i = 0; i < indexArr.length; ++i) {
    if(i == 0) temp = temp[indexArr[i]];
    else temp = temp.value[indexArr[i]];
  }
  return temp;
}

function selectOnote(e) {
  if(selectedDiv != null) selectedDiv.classList.remove('selected');
  var prevSelectedDiv = selectedDiv;
  if(e.currentTarget != undefined) selectedDiv = e.currentTarget;
  else selectedDiv = e;  
  
  if(prevSelectedDiv == selectedDiv) {
    selectedDiv = null;
    selectedIndex = -1;
    ONotesEdit.disabled = true;
    ONotesEdit.value = '';
    ONotesDelete.classList.add('disabled');
  }
  else {  
    selectedIndex = getONoteIndex(selectedDiv);
    selectedDiv.classList.add('selected');
    ONotesEdit.disabled = false;
    ONotesEdit.value = getONote(selectedIndex).value;
    ONotesDelete.classList.remove('disabled');
  }
}

function updateONote() {
  if(ONotesEdit.value.indexOf('\n') != -1) {
    var label = ONotesEdit.value.substring(0, ONotesEdit.value.indexOf('\n'));
  }
  else {
    var label = ONotesEdit.value;
  }
  
  var onoteObj = getONote(selectedIndex);
  if(typeof onoteObj.value != 'object') onoteObj.value = ONotesEdit.value;
  onoteObj.label = label;
  selectedDiv.getElementsByTagName('span')[0].textContent = label;
  if(typeof addon != 'undefined') addon.port.emit('onotes-update', { index: selectedIndex, ONote: onoteObj });
}

function newOnote() {
  if(typeof addon != 'undefined') addon.port.emit('onotes-sidebar-new', { label: '', value: '' });
  newOnoteDiv = addONote({ label: '', value: '' });
  selectOnote(newOnoteDiv);
}

function newOnoteFolder() {
  if(typeof addon != 'undefined') addon.port.emit('onotes-folder-new', { label: '', value: [] });
  newFolderDiv = addONote({ label: '', value: []});
  toggleFolder(newFolderDiv);
}

function deleteOnote() {
  //Nothing selected to delete
  if(!selectedDiv) return false;
  
  //Selected item is the trash itself
  if(selectedDiv.parentElement.id == 'ONotesTrash') return false;
  
  var nextSelectedDiv = null;
  var sendToTrash = true;
  var prevElement = (selectedDiv.parentElement.classList.contains('folder')) ? selectedDiv.parentElement.previousElementSibling : selectedDiv.previousElementSibling;
  //selected item is inside the trash
  if(selectedIndex.split('.')[0] == 'trash') {
    sendToTrash = false;
    if(!confirm('Are you sure you want to permanently delete this item?')) {
      return false;
    }
  }
  //selected item is the first item in a folder
  else if(prevElement == null && selectedDiv.parentElement.classList.contains('folderContents')) {
    nextSelectedDiv = prevElement.parentElement.childNodes[0];
  }
  //selected item is after a folder
  else if(prevElement != null && prevElement.classList.contains('folder')) {
    nextSelectedDiv = prevElement.childNodes[0];
  }
  //selected item is after a note
  else if(prevElement != null) {
    nextSelectedDiv = prevElement;
  }
  
  if(sendToTrash) {
    onoteMove(selectedDiv, ONotesTrash.getElementsByClassName('ONotesLabel')[0], 'middle');
    ONotesTrash.getElementsByClassName('ONotesLabel')[0].classList.add('nonEmpty');
  }
  else {
    if(selectedDiv.parentElement.classList.contains('folder')) selectedDiv.parentElement.remove();
    else selectedDiv.remove();
    if(ONotesTrash.getElementsByClassName('folderContents')[0].children.length == 0) {
      ONotesTrash.getElementsByClassName('ONotesLabel')[0].getElementsByTagName('img')[0].src = 'onotes-triangleright-7.png';
      ONotesTrash.getElementsByClassName('folderContents')[0].classList.remove('open');
      ONotesTrash.getElementsByClassName('ONotesLabel')[0].classList.remove('nonEmpty');
    }
    getONote(selectedIndex).deleted = true;
    if(typeof addon != 'undefined') addon.port.emit('onotes-delete', selectedIndex);
  }
  
  if(nextSelectedDiv != null) {
    selectOnote(nextSelectedDiv);
  }
  else {
    selectedDiv.classList.remove('selected');
    selectedDiv = null;
    selectedIndex = -1;
    ONotesDelete.classList.add('disabled');
  }
}

function toggleFolder(e, noToggle) {
  if(selectedDiv != null) selectedDiv.classList.remove('selected');
  if(e.currentTarget != undefined) selectedDiv = e.currentTarget;
  else selectedDiv = e;
  selectedIndex = getONoteIndex(selectedDiv);
  selectedDiv.classList.add('selected');
  if(selectedDiv.parentElement.id == 'ONotesTrash') {
    ONotesEdit.value = '';
    ONotesEdit.disabled = true;
    ONotesDelete.classList.add('disabled');
  }
  else {
    ONotesEdit.value =  getONote(selectedIndex).label;
    ONotesEdit.disabled = false;
    ONotesDelete.classList.remove('disabled');
  }
  var folderContentsDiv = selectedDiv.parentElement.getElementsByClassName('folderContents')[0];
  if(folderContentsDiv.children.length <= 1) return;
  if(!noToggle) {
    if(folderContentsDiv.classList.contains('open')) {
      selectedDiv.getElementsByTagName('img')[0].src = 'onotes-triangleright-7.png';
      folderContentsDiv.classList.remove('open');
    }
    else {
      selectedDiv.getElementsByTagName('img')[0].src = 'onotes-triangledown-7.png';
      folderContentsDiv.classList.add('open');
    }
  }

}
