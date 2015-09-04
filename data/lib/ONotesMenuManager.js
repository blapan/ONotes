var cm = require('sdk/context-menu');

/**
 * @param {ONotesDataManager} odm
 * @param {Worker} sbWorker Sidebar worker set by the sidebar's onReady event handler
 */
function ONotesMenuManager(odm) {
  this.odm = odm;
  this.sbWorker = null;
  var omm = this;
  
  this.menu = cm.Menu({
    label: "Insert ONote",
    context: [
      cm.SelectorContext('input[type="text"], textarea'),
      cm.PredicateContext(function() { return omm.menu.items.length > 0 }),
    ],
    contentScriptFile: './contentScripts/csONotesMenu.js',
  });  
  this.items = { item: null, menu: this.menu, children: [] };
  
  this.createItem = cm.Item({
    label: "Create ONote",
    context: cm.SelectionContext(),
    contentScriptFile: './contentScripts/csONotesCreate.js',
    onMessage: function(text) {
      var { label, menuLabel } = odm.createLabel(text);
      var ONote = {
        label: label,
        menuLabel: menuLabel,
        value: text,
      };
      omm.add(ONote, omm.menu, omm.items.children);
      odm.add(ONote);
      if(omm.sbWorker != null) omm.sbWorker.port.emit("onotes-addon-new", ONote);
    },
  });
}

ONotesMenuManager.prototype = {
  get: function(index) {
    var temp = this.items;
    var indexArr = [];
    if(index != '' && index != null) indexArr = index.split('.');
    
    for(var i = 0; i < indexArr.length; ++i) {
      if(i == 0) temp = temp[indexArr[i]];
      else temp = temp.children[indexArr[i]];
    }
    return temp;
  },
  
  build: function(ONotesArr) {
    for(var i = 0; i < ONotesArr.length; ++i) {
      this.add(ONotesArr[i], this.menu, this.items.children);
    }
  },
  
  add: function(ONote, parentMenu, parentArr) {
    var itemObj = { item: null, menu: null, children: [] };
    if(typeof ONote.menuLabel == 'undefined') {
      //The ( .. ) around the assignment statement is required syntax when using object literal destructuring assignment without a declaration.
      ({ label: ONote.label, menuLabel: ONote.menuLabel } = this.odm.createLabel((typeof ONote.value == 'object') ? ONote.label : ONote.value));
    }
    
    if(typeof ONote.value == 'object') {
      var item = itemObj.menu = cm.Menu({ label: ONote.menuLabel, contentScriptFile: './contentScripts/csONotesMenu.js' });
      for(var i = 0; i < ONote.value.length; ++i) {
        this.add(ONote.value[i], itemObj.menu, itemObj.children);
      }
    }
    else {
      var item = itemObj.item = cm.Item({ label: ONote.menuLabel, data: ONote.value });
    }
    parentArr.push(itemObj);
    parentMenu.addItem(item);
  }
}

if(typeof exports != 'undefined') exports.ONotesMenuManager = ONotesMenuManager;