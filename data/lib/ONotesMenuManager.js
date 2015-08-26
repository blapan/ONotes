var cm = require('sdk/context-menu');

function ONotesMenuManager() {
  this.items = [];
  
  this.create = cm.Item({
    label: "Create ONote",
    context: cm.SelectionContext(),
    contentScript: 'self.on("click", function() { self.postMessage(window.getSelection().toString()) });',
    onMessage: createONote
  });
  
  this.menu = cm.Menu({
    label: "Insert ONote",
    context: [
      cm.SelectorContext('input[type="text"], textarea'),
      cm.PredicateContext(function() { return this.menu.items.length > 0 }),
    ],
    contentScript: 'self.on("click", function(node, data) { node.value += data; });',
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
      var item = cm.Item({ label: ONotesArr[i].label, data: ONotesArr[i].value })
      this.items.push()
      ONotesMenu.addItem();
    }
  }
}

if(typeof exports != 'undefined') exports.ONotesMenuManager = ONotesMenuManager;