var keybinds = {};
var keybindspre = {
    don: ['d','f'],
    kat: ['j','k'],
    pause: ['p','0','Backspace'],
    //autoplayToggle: ['o','8'],
};
var gameActionId = {
    don: 0,
    kat: 1
};

{
	let gameplayKeybinds = JSON.parse(localStorage.getItem('user-controls'));
	[
		'don',
		'kat'
	].forEach((action)=>{
		gameplayKeybinds[action].forEach((key)=>{
			keybindspre[action].push(key);
		});
	});
}

Object.keys(keybindspre).forEach((bindTo)=>{
	keybindspre[bindTo].forEach((key)=>{
		keybinds[key] = bindTo;
	});
});
keybindspre = undefined;

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