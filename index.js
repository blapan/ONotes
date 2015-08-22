var { ToggleButton } = require("sdk/ui/button/toggle");
var sb = require("sdk/ui/sidebar");
var cm = require('sdk/context-menu');
var ss = require('sdk/simple-storage');

//var sys = require('sdk/system');
//var fileIO = require('sdk/io/file');
//
//console.log(sys.pathFor('Home') + ' ' + sys.platform);
////platforms: winnt linux darwin
//
//operaNotesFile = sys.pathFor('Home')+"\\AppData\\Roaming\\Opera\\Opera\\notes.adr";
//operaNotesFileData = fileIO.read(operaNotesFile);
//console.log(operaNotesFile + ' ' + operaNotesFileData);

/*
~/Library/Application Support/Opera Any user data of significant size should be placed here.
~/Library/Caches/Opera Any temp/cache data should be placed here.
~/Library/Opera All other preferences should be placed here.

~/.opera Linux Opera user data

*/

var ONotesCreate = cm.Item({
  label: "Create ONote",
  context: cm.SelectionContext(),
  contentScript: 'self.on("click", function() { self.postMessage(window.getSelection().toString()) });',
  onMessage: createONote
});

var ONotesMenu = cm.Menu({
  label: "Insert ONote",
  context: [
    cm.SelectorContext('input[type="text"], textarea'),
    cm.PredicateContext(function() { return ONotesMenu.items.length > 0 }),
  ],
  contentScript: 'self.on("click", function(node, data) { node.value += data; });',
  //items: [
    //cm.Item({ label: "Item 3", data: "item3" })
  //]
});

if(!ss.storage.ONotesTrashArr) ss.storage.ONotesTrashArr = [];
if(!ss.storage.ONotesArr) ss.storage.ONotesArr = [];
else {
  for(var i = 0; i < ss.storage.ONotesArr.length; ++i) {
    ONotesMenu.addItem(cm.Item({ label: ss.storage.ONotesArr[i].label, data: ss.storage.ONotesArr[i].value }));
  }
}

var ONotesSidebarWorker = null;
var ONotesSidebar = sb.Sidebar({
  id: 'onotes-sidebar',
  title: 'ONotes',
  url: "./sidebar.html",
  onHide: function() { ONotesButton.state("window", null); ONotesButton.checked = false; },
  onReady: function(worker) {
    ONotesSidebarWorker = worker;
    var payload = {
      ONotesTrashArr: ss.storage.ONotesTrashArr,
      ONotesArr: ss.storage.ONotesArr,
    };
    ONotesSidebarWorker.port.emit("onotes-data-init", payload);
  }
});

var ONotesButton = ToggleButton({
  id: "onotes-button",
  label: "ONotes",
  icon: {
    "16": "./onotes-icon-16.png",
    "32": "./onotes-icon-32.png",
    "64": "./onotes-icon-64.png"
  },
  onChange: function(state) {
    if(state.checked) ONotesSidebar.show();
    else ONotesSidebar.hide();
  }
});

function createONote(text) {
  if(text.length >= 20) {
    var label = text.substring(0, 20) + '...';
  }
  else {
    var label = text;
  }
  var ONote = {
    label: label,
    value: text,
    pos: ss.storage.ONotesArr.length + 1,
  };
  ss.storage.ONotesArr.push(ONote);
  ONotesMenu.addItem(cm.Item({ label: ONote.label, data: ONote.value }));
  if(ONotesSidebarWorker != null) ONotesSidebarWorker.port.emit("onotes-new", ONote);
}