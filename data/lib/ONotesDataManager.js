function ONotesDataManager(data, trash) {
  this.data = data;
  this.trash = trash;
}

ONotesDataManager.prototype = {
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

if(typeof exports != 'undefined') exports.ONotesDataManager = ONotesDataManager;