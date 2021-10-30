browser.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  if(message.action == 'insert-onote') {
    var el = browser.menus.getTargetElement(message.targetElementId);
    el.value += message.data;
  }
});