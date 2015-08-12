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

if(typeof addon != 'undefined') {
  addon.port.once("onotes-data-init", initONotes);
  addon.port.on("onotes-new", addONote);
}
else {
  ONotesArr = [
    { label: "TEST0", value: "TEST0" },
    { label: "TEST1", value: "TEST1" },
    { label: "TEST2", value: "TEST2" },
    { label: "TEST3", value: "TEST3" },
    { label: "TEST4", value: "TEST4" },
    { label: "TEST5", value: "TEST5" },
    { label: "TEST6", value: "TEST6" },
    { label: "TEST7", value: "TEST7" },
    { label: "TEST8", value: "TEST8" },
    { label: "TEST9", value: "TEST9" },
    { label: "TEST10 FOLDER", value: [
      { label: "SUBTEST0", value: "SUBTEST0" },
      { label: "SUBTEST1", value: "SUBTEST1" },
      { label: "SUBTEST2 SUBFOLDER", value: [
        { label: "SUBTEST2 SUBFOLDER-SUBTEST0", value: "SUBTEST2 SUBFOLDER-SUBTEST0" },
        { label: "SUBTEST2 SUBFOLDER-SUBTEST1", value: "SUBTEST2 SUBFOLDER-SUBTEST1" }
      ] },
      { label: "SUBTEST3", value: "SUBTEST3" },
      { label: "SUBTEST4", value: "SUBTEST4" },
    ] },    
    { label: "TEST11", value: "TEST11" },
    { label: "TEST12", value: "TEST12" },
    { label: "TEST13", value: "TEST13" },
    { label: "TEST14", value: "TEST14" },
    { label: "TEST15", value: "TEST15" },
    { label: "TEST16", value: "TEST16" },
    { label: "TEST17 EMPTY FOLDER", value: [] },
    { label: "TEST22", value: "TEST22" },
  ];
  ONotesTrashArr = [
    { label: "TEST18", value: "TEST18" },
    { label: "TEST19", value: "TEST19" },
    { label: "TEST FOLDER IN TRASH", value: [
      { label: "TRASH SUBTEST1", value: "TRASH SUBTEST1" },
      { label: "TRASH SUBTEST2", value: "TRASH SUBTEST2" },
      { label: "TRASH SUBTEST3", value: "TRASH SUBTEST3" },
      { label: "TRASH SUBTEST4", value: "TRASH SUBTEST4" },
    ] },
    { label: "TEST20", value: "TEST20" },
    { label: "TEST21", value: "TEST21" },
  ];
  initONotes({ONotesArr: ONotesArr, ONotesTrashArr: ONotesTrashArr});
}

function initONotes(payload) {
  ONotesArr = payload.ONotesArr;
  ONotesTrashArr = payload.ONotesTrashArr;
  for(var i = 0; i < ONotesArr.length; ++i) {
    addONote(ONotesArr[i], i);
  }
  
  if(ONotesTrashArr.length > 0) {
    ONotesTrash.getElementsByClassName('ONotesLabel')[0].classList.add('nonEmpty');
    for(var i = 0; i < ONotesTrashArr.length; ++i) {
      addONote(ONotesTrashArr[i], i, ONotesTrash.getElementsByClassName('folderContents')[0]);
    }
  }
  
  ONotesEdit.addEventListener('keyup', updateONote);
  ONotesNewNote.addEventListener('click', newOnote);
  ONotesNewFolder.addEventListener('click', newOnoteFolder);
  ONotesDelete.addEventListener('click', deleteOnote);
  
  ONotesTrash.children[0].addEventListener('dragenter', onoteDragEnter);
  ONotesTrash.children[0].addEventListener('dragover', onoteDragOver);
  ONotesTrash.children[0].addEventListener('dragleave', onoteDragLeave);
  ONotesTrash.children[0].addEventListener('drop', onoteDrop);
  
  folderDivs = document.getElementsByClassName('folder');
  for(var i = 0; i < folderDivs.length; ++i) {
    folderDivs[i].firstElementChild.addEventListener('click', toggleFolder);
  }
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
    e.appendChild(folderLabel);
    e.appendChild(folderContents);
  }
  else {
    var noteImg = document.createElement('img');
    noteImg.src = 'silk/note.png';
    noteImg.setAttribute('draggable', false);
    e.appendChild(noteImg);
    e.addEventListener('click', selectOnote);
  }
  selectableDiv.className = 'ONotesLabel';
  selectableDiv.setAttribute('data-onotesindex', index);
  selectableDiv.appendChild(document.createTextNode(ONote.label));
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
  if(e.constructor.name == 'MouseEvent') selectedDiv = e.currentTarget;
  else selectedDiv = e;
  
  selectedIndex = getONoteIndex(selectedDiv);
  selectedDiv.classList.add('selected');
  ONotesEdit.disabled = false;
  ONotesEdit.value = getONote(selectedIndex).value;
  ONotesDelete.classList.remove('disabled');;
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
  selectedDiv.textContent = label;
}

function newOnote() {
  newOnoteDiv = addONote({ label: '', value: '' });
  selectOnote(newOnoteDiv);
}

function newOnoteFolder() {
  
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

function toggleFolder(event) {
  if(selectedDiv != null) selectedDiv.classList.remove('selected');
  selectedDiv = event.currentTarget;
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
  if(!folderContentsDiv.hasChildNodes()) return;
  if(folderContentsDiv.classList.contains('open')) {
    selectedDiv.getElementsByTagName('img')[0].src = 'onotes-triangleright-7.png';
    folderContentsDiv.classList.remove('open');
  }
  else {
    selectedDiv.getElementsByTagName('img')[0].src = 'onotes-triangledown-7.png';
    folderContentsDiv.classList.add('open');
  }
}
