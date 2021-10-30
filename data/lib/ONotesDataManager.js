function ONotesDataManager() {
  this.loaded = false;
}

ONotesDataManager.prototype = {
  load: async function() {
    var temp = await browser.storage.local.get(null);
    if(typeof temp.ONotesArr == 'undefined') {
      temp.ONotesArr = [];
      await browser.storage.local.set({ONotesArr: []});
    }
    if(typeof temp.ONotesTrashArr == 'undefined') {
      temp.ONotesTrashArr = [];
      await browser.storage.local.set({ONotesTrashArr: []});
    }
    this.data = temp.ONotesArr;
    this.trash = temp.ONotesTrashArr;
    this.loaded = true;
  },
  save: async function() {
    await browser.storage.local.set({ONotesArr: this.data, ONotesTrashArr: this.trash});
  },
  get: function(index) {
    var temp = this.data;
    var indexArr = [];
    if(index != '' && index != null) {
      indexArr = index.split('.');
      if(indexArr[0] == 'trash') {
        indexArr.shift();
        temp = this.trash;
      }
    }
    
    for(var i = 0; i < indexArr.length; ++i) {
      if(i == 0) temp = temp[indexArr[i]];
      else temp = temp.value[indexArr[i]];
    }
    return temp;
  },
  
  add: function(ONote) {
    this.data.push(ONote);
  },
  
  create: function(text, type) {
    var labels = this.createLabel(text);
    if(type == 'folder') {
      var ret = { label: labels.label, menuLabel: labels.menuLabel, value: [] };
    }
    else {
      var ret = { label: labels.label, menuLabel: labels.menuLabel, value: text };
    }
    return ret;
  },
  
  createLabel: function(text) {
    var ret = { label: '', menuLabel: ''};
    if(text.indexOf('\n') != -1) ret.label = text.substring(0, text.indexOf('\n'));
    else ret.label = text;
    
    if(ret.label.length >= 20) ret.menuLabel = ret.label.substring(0, 20) + '...';
    else ret.menuLabel = ret.label;
    return ret;
  },
  
  parsePath: function(index) {
    var ret = {};
    ret.path = index.slice(0, index.lastIndexOf('.') > 0 ? index.lastIndexOf('.') : 0);
    ret.base = index == 'trash' ? 'trash' : parseInt(index.slice(index.lastIndexOf('.') + 1));
    return ret;
  }
}