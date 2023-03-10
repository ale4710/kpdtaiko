window.addEventListener('beforeunload', window.parent.hideFrame);
window.addEventListener('load', window.parent.showFrame);