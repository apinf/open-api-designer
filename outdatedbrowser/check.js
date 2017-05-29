//This code is from https://github.com/burocratik/outdated-browser
//event listener: DOM ready
function addLoadEvent(func) {
  var oldonload = window.onload;
  if (typeof window.onload != 'function') {
    window.onload = func;
  } else {
    window.onload = function() {
      if (oldonload) {
        oldonload();
      }
      func();
    };
  }
}
//call plugin function after DOM ready
addLoadEvent(function() {
  outdatedBrowser({
    bgColor: '#f25648',
    color: '#ffffff',
    lowerThan: 'IE10',
    languagePath: 'outdatedbrowser/lang/en.html'
  });
});
