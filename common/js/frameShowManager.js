window.addEventListener('beforeunload', window.parent.hideFrame);
waitDocumentLoaded().then(window.parent.showFrame);