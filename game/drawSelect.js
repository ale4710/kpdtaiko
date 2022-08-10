(()=>{
    addGlobalReference(0, 'draw/' + [
        'webgl',
        'canvas',
        'dom'
    ][getSettingValue('note-rendering-mode')]);
})();