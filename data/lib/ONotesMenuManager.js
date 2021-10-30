/**
 * @param {ONotesDataManager} odm
 */
function ONotesMenuManager(odm) {
  this.odm = odm;
  var omm = this;
  
  browser.menus.create({
    id: "create-onote",
    title: "Create ONote",
    contexts: ["selection"]
  });
  
  this.rootMenuId = browser.menus.create({
    id: "insert-onote",
    title: "Insert ONote",
    visible: false,
    contexts: ["editable"]
  });

  browser.menus.onClicked.addListener(this.handler);
  
  this.build();
}

ONotesMenuManager.prototype = {
  handler: async function(info, tab) {
    var [menuId, index] = info.menuItemId.split('_')
    if(menuId == 'create-onote') {
      var sel = info.selectionText;
      //handler functions do not have access to this object and run in the global scope
      var obj = odm.create(sel);
      odm.add(obj);
      omm.add(obj, omm.rootMenuId, omm.items.children, omm.items.children.length.toString());
      var sidebar_open = await browser.sidebarAction.isOpen({});
      if(sidebar_open) {
        await browser.runtime.sendMessage({action: 'create-onote', data: obj});
      }
    }
    else if(menuId == 'onote') {
      var msg = { action: 'insert-onote', targetElementId: info.targetElementId, data: odm.get(index).value};
      console.log('Insert onote: ', menuId, index);
      browser.tabs.sendMessage(tab.id, msg);
    }
  },
  
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
  
  clear: async function(itemsArr) {
    if(typeof itemsArr == 'undefined') itemsArr = this.items.children;
    for(var i = 0; i < itemsArr.length; ++i) {
      if(itemsArr[i].menuId !== null) {
        this.clear(itemsArr[i].children);
        await browser.menus.remove(itemsArr[i].menuId);
      }
      else await browser.menus.remove(itemsArr[i].itemId);
    }
    itemsArr = [];
  },
  
  build: function() {
    this.items = { itemId: null, menuId: this.rootMenuId, children: [] };
    for(var i = 0; i < odm.data.length; ++i) {
      this.add(odm.data[i], this.rootMenuId, this.items.children, i.toString());
    }
    if(this.items.children.length > 0) browser.menus.update(this.rootMenuId, {visible: true});
  },
  
  rebuild: async function() {
    await this.clear();
    this.build();
  },
  
  add: function(ONote, parentMenuId, parentArr, idx) {
    if(ONote == null) {
      parentArr.push(null);
      return;
    }
    var itemObj = { itemId: null, menuId: null, children: [] };
    if(typeof ONote.menuLabel == 'undefined') {
      //The ( .. ) around the assignment statement is required syntax when using object literal destructuring assignment without a declaration.
      ({ label: ONote.label, menuLabel: ONote.menuLabel } = this.odm.createLabel((typeof ONote.value == 'object') ? ONote.label : ONote.value));
    }
    
    if(typeof ONote.value == 'object') {
      var itemId = itemObj.menuId = browser.menus.create({ id: 'onote-folder_'+idx, title: ONote.menuLabel, parentId: parentMenuId, visible: (ONote.value.length > 0) });
      for(var i = 0; i < ONote.value.length; ++i) {
        this.add(ONote.value[i], itemObj.menuId, itemObj.children, idx + '.' + i.toString());
      }
    }
    else {
      var itemId = itemObj.itemId = browser.menus.create({ id: 'onote_'+idx, title: ONote.menuLabel, parentId: parentMenuId });
    }
    parentArr.push(itemObj);
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