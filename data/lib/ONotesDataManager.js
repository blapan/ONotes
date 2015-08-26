function ONotesMenuManager(data, trash) {
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
  }
}

if(typeof exports != 'undefined') exports.ONotesDataManager = ONotesDataManager;