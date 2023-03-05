var keybinds = {},
keybindspre = {
    don: ['d','f','4','6'],
    kat: ['j','k','1','3'],
    pause: ['p','0','Backspace'],
    //autoplayToggle: ['o','8'],
},
gameActionId = {
    don: 0,
    kat: 1
};

(()=>{
    Object.keys(keybindspre).forEach((bindTo)=>{
        keybindspre[bindTo].forEach((key)=>{
            keybinds[key] = bindTo;
        });
    });
    keybindspre = null;
})();

disableControls = false;
window.removeEventListener('keydown', globalKeyHandler);
var gamePageN = 'gameplay';
function gameKeyHandler(k) {
	if(curpage === gamePageN) {
		if(k.key === 'Backspace') {k.preventDefault()}
		if(!k.repeat) {
			if(!ended) {
				if(k.key in keybinds) {
					var action = keybinds[k.key];
					switch(action) {
						case 'don':
						case 'kat':
							if(!autoplayEnabled) {
								playerAction(gameActionId[action]);
							}
							break;
						case 'pause':
							pause();
							updatenavbar();
							break;
						/* case 'autoplayToggle':
							autoplayEnabled = !autoplayEnabled;
							modsDisplay.updateDisplay('auto', autoplayEnabled);
							break; */
						/* case 'begin':
							firstLoad();
							break; */
					}
				}
			}
		}
	} else {
		globalKeyHandler(k);
	}
}
window.addEventListener('keydown', gameKeyHandler);