var { ToggleButton } = require("sdk/ui/button/toggle");
var sb = require("sdk/ui/sidebar");
//var cm = require('sdk/context-menu');
var ss = require('sdk/simple-storage');

var { ONotesDataManager } = require('./data/lib/ONotesDataManager');
var { ONotesMenuManager } = require('./data/lib/ONotesMenuManager');

if(!ss.storage.ONotesTrashArr) ss.storage.ONotesTrashArr = [];
if(!ss.storage.ONotesArr) ss.storage.ONotesArr = [];

var odm = new ONotesDataManager(ss.storage.ONotesArr, ss.storage.ONotesTrashArr);
var omm = new ONotesMenuManager();

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
    ONotesSidebarWorker.port.on("onotes-sidebar-new", function(payload) { console.log('onotes-sidebar-new', payload); });
    ONotesSidebarWorker.port.on("onotes-new-folder", function(payload) { console.log('onotes-folder-new', payload); });
    ONotesSidebarWorker.port.on("onotes-delete", function(payload) { console.log('onotes-delete', payload); });
    ONotesSidebarWorker.port.on("onotes-update", function(payload) { console.log('onotes-update', payload); });
    ONotesSidebarWorker.port.on("onotes-move", function(payload) { console.log('onotes-move', payload); });
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
  if(text.indexOf('\n') != -1) var label = text.substring(0, text.indexOf('\n'));
  else var label = text;
  
  if(label.length >= 20) var menuLabel = label.substring(0, 20) + '...';
  else var menuLabel = label;
  
  var ONote = {
    label: label,
    value: text,
    pos: ss.storage.ONotesArr.length + 1,
  };
  ss.storage.ONotesArr.push(ONote);
  ONotesMenu.addItem(cm.Item({ label: menuLabel, data: ONote.value }));
  if(ONotesSidebarWorker != null) ONotesSidebarWorker.port.emit("onotes-addon-new", ONote);
}