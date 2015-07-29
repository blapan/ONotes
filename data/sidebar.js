var ONotesArr = [];
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
    { label: "TEST17", value: "TEST17" },
    { label: "TEST18", value: "TEST18", inTrash: true },
    { label: "TEST19", value: "TEST19", inTrash: true },
    { label: "TEST FOLDER IN TRASH", value: [
      { label: "TRASH SUBTEST1", value: "TRASH SUBTEST1" },
      { label: "TRASH SUBTEST2", value: "TRASH SUBTEST2" },
      { label: "TRASH SUBTEST3", value: "TRASH SUBTEST3" },
      { label: "TRASH SUBTEST4", value: "TRASH SUBTEST4" },
    ], inTrash: true },
    { label: "TEST20", value: "TEST20", deleted: true },
    { label: "TEST21", value: "TEST21", deleted: true },
  ];
  initONotes(ONotesArr);
}

function initONotes(payload) {
  ONotesArr = payload;
  for(var i = 0; i < ONotesArr.length; ++i) {
    addONote(ONotesArr[i], i);
  }
  
  ONotesEdit.addEventListener('keyup', updateONote);
  ONotesNewNote.addEventListener('click', newOnote);
  ONotesNewFolder.addEventListener('click', newOnoteFolder);
  ONotesDelete.addEventListener('click', deleteOnote);
  
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
    if(ONote.inTrash) {
      parentDiv = ONotesTrash.getElementsByClassName('folderContents')[0];
      ONotesTrash.getElementsByTagName('div')[0].style.fontWeight = 'bold';
    }
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
    folderLabel.appendChild(arrowImg);
    folderLabel.appendChild(folderImg);
    folderContents.className = 'folderContents';
    for(var i = 0; i < ONote.value.length; ++i) {
      addONote(ONote.value[i], index + '.' + i, folderContents);
    }
    e.appendChild(folderLabel);
    e.appendChild(folderContents);
  }
  else {
    var noteImg = document.createElement('img');
    noteImg.src = 'silk/note.png';
    e.appendChild(noteImg);
    e.addEventListener('click', editOnote);
  }
  selectableDiv.setAttribute('data-onotesindex', index);
  selectableDiv.appendChild(document.createTextNode(ONote.label));
  selectableDiv.setAttribute('draggable', true);
  selectableDiv.addEventListener('dragstart', onoteDragStart);
  selectableDiv.addEventListener('dragenter', onoteDragEnter);
  selectableDiv.addEventListener('dragover', onoteDragOver);
  selectableDiv.addEventListener('dragleave', onoteDragLeave);
  selectableDiv.addEventListener('drop', onoteDrop);
  parentDiv.appendChild(e);
  return e;
}

function getONote(index) {
  var temp = ONotesArr;
  var indexArr = index.split('.');
  for(var i = 0; i < indexArr.length; ++i) {
    if(i == 0) temp = temp[indexArr[i]];
    else temp = temp.value[indexArr[i]];
  }
  return temp;
}

function editOnote(e) {
  if(selectedDiv != null) selectedDiv.className = '';
  if(e.constructor.name == 'MouseEvent') selectedDiv = e.currentTarget;
  else selectedDiv = e;
  
  selectedIndex = selectedDiv.dataset.onotesindex;
  selectedDiv.className = 'selected';
  ONotesEdit.disabled = false;
  ONotesEdit.value = getONote(selectedIndex).value;
  ONotesDelete.className = '';
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
  editOnote(newOnoteDiv);
}

function newOnoteFolder() {
  
}

function deleteOnote() {
  //Nothing selected to delete
  if(!selectedDiv) return false;
  
  //Selected item is the trash itself
  if(selectedDiv.parentElement.id == 'ONotesTrash') return false;
  
  selectedIndex = selectedDiv.dataset.onotesindex;
  
  var nextSelectedDiv = null;
  var sendToTrash = true;
  //selected item is inside the trash
  if(getONote(selectedIndex.split('.')[0]).inTrash) {
    sendToTrash = false;
  }
  //selected item is the first item in a folder
  else if(selectedDiv.previousElementSibling == null && selectedDiv.parentElement.className == 'folderContents') {
    nextSelectedDiv = selectedDiv.parentElement.parentElement.childNodes[0];
  }
  //selected item is after the trash
  else if(selectedDiv.previousElementSibling != null && selectedDiv.previousElementSibling.id == 'ONotesTrash') {
    nextSelectedDiv = null;
  }
  //selected item is after a folder
  else if(selectedDiv.previousElementSibling != null && selectedDiv.previousElementSibling.className == 'folder') {
    nextSelectedDiv = selectedDiv.previousElementSibling.childNodes[0];
  }
  //selected item is after a note
  else if(selectedDiv.previousElementSibling != null) {
    nextSelectedDiv = selectedDiv.previousElementSibling;
  }  
  
  if(sendToTrash) {
    var trashContents = ONotesTrash.getElementsByClassName('folderContents')[0];
    if(selectedDiv.parentElement.className == 'folder') trashContents.appendChild(selectedDiv.parentElement);
    else trashContents.appendChild(selectedDiv);
    ONotesTrash.getElementsByTagName('div')[0].style.fontWeight = 'bold';
    getONote(selectedIndex).inTrash = true;
  }
  else {
    if(selectedDiv.parentElement.className == 'folder') selectedDiv.parentElement.remove();
    else selectedDiv.remove();
    if(ONotesTrash.getElementsByClassName('folderContents')[0].children.length == 0) {
      ONotesTrash.getElementsByTagName('div')[0].getElementsByTagName('img')[0].src = 'onotes-triangleright-7.png';
      ONotesTrash.getElementsByClassName('folderContents')[0].style.display = 'none';
      ONotesTrash.getElementsByTagName('div')[0].style.fontWeight = '';
    }
    getONote(selectedIndex).deleted = true;
  }
  
  if(nextSelectedDiv != null) {
    editOnote(nextSelectedDiv);
  }
  else {
    selectedDiv.className = '';
    selectedDiv = null;
    selectedIndex = -1;
    ONotesDelete.className = 'disabled';
  }
}

function toggleFolder(event) {
  if(selectedDiv != null) selectedDiv.className = '';
  selectedDiv = event.currentTarget;
  selectedIndex = selectedDiv.dataset.onotesindex;
  selectedDiv.className = 'selected';
  if(selectedDiv.parentElement.id == 'ONotesTrash') {
    ONotesEdit.value = '';
    ONotesEdit.disabled = true;
    ONotesDelete.className = 'disabled';
  }
  else {
    ONotesEdit.value =  getONote(selectedIndex).label;
    ONotesEdit.disabled = false;
    ONotesDelete.className = '';
  }
  var folderContentsDiv = selectedDiv.parentElement.getElementsByClassName('folderContents')[0];
  if(!folderContentsDiv.hasChildNodes()) return;
  if(getComputedStyle(folderContentsDiv).display == 'none') {
    selectedDiv.getElementsByTagName('img')[0].src = 'onotes-triangledown-7.png';
    folderContentsDiv.style.display = 'block';
  }
  else {
    selectedDiv.getElementsByTagName('img')[0].src = 'onotes-triangleright-7.png';
    folderContentsDiv.style.display = 'none';
  }
}
