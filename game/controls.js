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
function gameKeyHandler(k) {
	if(curpage === 0) {
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

function keyHandler(k) {
    switch(curpage) {
        case 1: /* pausemenu */ pauseK(k); break;
        case 2: /* unpausing */ unpausingK(k); break;
		case 3: /* ended */ endedK(k); break;
    }
}

function localupdatenavbar() {
    switch(curpage) {
        case 1: outputNavbar('','select'); break;
		case 3: endedNavbar(); break;
    }
}