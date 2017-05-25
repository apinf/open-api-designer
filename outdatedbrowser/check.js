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
addLoadEvent(function() {
  outdatedBrowser({
    bgColor: '#f25648',
    color: '#ffffff',
    lowerThan: 'transform',
    languagePath: 'outdatedbrowser/lang/en.html'
  });
});
