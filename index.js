var { ToggleButton } = require("sdk/ui/button/toggle");
var sb = require("sdk/ui/sidebar");
//var cm = require('sdk/context-menu');
var ss = require('sdk/simple-storage');

//Destructuring assignment
var { ONotesDataManager } = require('./data/lib/ONotesDataManager');
var { ONotesMenuManager } = require('./data/lib/ONotesMenuManager');

if(!ss.storage.ONotesTrashArr) ss.storage.ONotesTrashArr = [];
if(!ss.storage.ONotesArr) ss.storage.ONotesArr = [];

var testArr = [
  { label: "TEST0", value: "TEST0" },
  { label: "TEST1 FOLDER", value: [
    { label: "SUBTEST0", value: "SUBTEST0" },
    { label: "SUBTEST1", value: "SUBTEST1" },
  ] },
  { label: "TEST2", value: "TEST2" },
];
var testTrash = [];

//var odm = new ONotesDataManager(ss.storage.ONotesArr, ss.storage.ONotesTrashArr);
var odm = new ONotesDataManager(testArr, testTrash);
var omm = new ONotesMenuManager(odm);

var ONotesSidebar = sb.Sidebar({
  id: 'onotes-sidebar',
  title: 'ONotes',
  url: "./sidebar.html",
  onHide: function() { ONotesButton.state("window", null); ONotesButton.checked = false; },
  onReady: function(worker) {
    omm.sbWorker = worker;
    var payload = {
      ONotesTrashArr: ss.storage.ONotesTrashArr,
      ONotesArr: ss.storage.ONotesArr,
    };
    omm.sbWorker.port.emit("onotes-data-init", payload);
    omm.sbWorker.port.on("onotes-sidebar-new", function(payload) { console.log('onotes-sidebar-new', payload); });
    omm.sbWorker.port.on("onotes-new-folder", function(payload) { console.log('onotes-folder-new', payload); });
    omm.sbWorker.port.on("onotes-delete", function(payload) { console.log('onotes-delete', payload); });
    omm.sbWorker.port.on("onotes-update", function(payload) { console.log('onotes-update', payload); });
    omm.sbWorker.port.on("onotes-move", function(payload) { console.log('onotes-move', payload); });
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
