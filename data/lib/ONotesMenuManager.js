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
  this.trash = { item: null, menu: null, children: [] };
  
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
  
  for(var i = 0; i < odm.data.length; ++i) {
    this.add(odm.data[i], this.menu, this.items.children);
  }
  for(var i = 0; i < odm.trash.length; ++i) {
    this.add(odm.trash[i], null, this.trash.children);
  }
}

ONotesMenuManager.prototype = {
  get: function(index) {
    var temp = this.items;
    var indexArr = [];
    if(index != '' && index != null) {
      indexArr = index.split('.');
      if(indexArr[0] == 'trash') {
        indexArr.shift();
        temp = this.trash;
      }
    }
    
    for(var i = 0; i < indexArr.length; ++i) temp.children[indexArr[i]];
    return temp;
  },
  
  rebuild: function(index) {
    var itemObj = this.get(index);
    if(itemObj.menu == null) return;
    for(var i = 0; i < itemObj.children.length; ++i) {
      if(itemObj.children[i] == null) continue;
      var item = (itemObj.children[i].menu == null) ? itemObj.children[i].item : itemObj.children[i].menu;
      itemObj.menu.addItem(item);
    }
  },
  
  add: function(ONote, parentMenu, parentArr) {
    if(ONote == null) {
      parentArr.push(null);
      return;
    }
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
    if(parentMenu != null) parentMenu.addItem(item);
  },
  
  move: function(payload) {
    var { source, dest, pos } = payload;
    var { path: sPath, base: sBase } = odm.parsePath(source);
    var { path: dPath, base: dBase } = odm.parsePath(dest);
    var destItemObj = this.get(dest);
    if(destItemObj.menu !== null && pos == 'middle') {
      if(dPath == '') dPath = dBase.toString();
      else dPath = dPath + '.' + dBase;
      if(destItemObj.children.length == 0) dBase = 0;
      else dBase = destItemObj.children.length + 1;
    }
    var sFolder = this.get(sPath);
    var dFolder = this.get(dPath);
    
    if(sPath != dPath) {    
      var temp = sFolder.children[sBase];
      sFolder.children[sBase] = null;
      dFolder.children.splice(dBase, 0, temp);
      this.rebuild(sPath);
    }
    else dFolder.children.splice(dBase, 0, sFolder.children.splice(sBase, 1)[0]);
    this.rebuild(dPath);    
  },
}

if(typeof exports != 'undefined') exports.ONotesMenuManager = ONotesMenuManager;