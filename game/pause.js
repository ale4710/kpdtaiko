var pauseMenu = (new OptionsMenu('Paused'));
pauseMenu.addOption('Continue');
pauseMenu.addOption('Adjust Volume');
pauseMenu.addOption('Restart');
pauseMenu.addOption('Exit');

var pauseMenuVisible = false;

var pauseMenuPageN;
var unpausingMenuPageN;

function pause() {
    if(ended || !ready) {return}
    if(!timerPaused) {timerTogglePause();}
    gameLoopStop();

    clearInterval(unpauseINT);
    unpauseCountdown = 4;
    
    gameAnim(false);

    document.body.classList.remove('hide-navbar');
    document.body.classList.add('paused');
    if(!pauseMenuVisible) {
        pauseMenuVisible = true;
        pauseMenu.menuViewToggle(true,true);
    }
    curpage = pauseMenuPageN;
}

var unpauseINT, unpauseCountdown = 0;
function unpause(immediate) {
    gameLoop();
    gameAnim();

    document.body.classList.add('hide-navbar');
    document.body.classList.remove('paused');
    pauseMenu.menuViewToggle(false);
    pauseMenuVisible = false;

    if(immediate) {
        unpauseReal();
    } else {
        curpage = unpausingMenuPageN;
        postJudge({
            text: 'Ready!',
            className: 'judge-white'
        });
        unpauseINT = setInterval(()=>{
            unpauseCountdown--;
            if(unpauseCountdown === 0) {
                clearInterval(unpauseINT);
                postJudgeHide();
                unpauseReal();
            } else {
                postJudge({
                    text: unpauseCountdown,
                    className: 'number'
                });
            }
        }, 1000);
    }
}
function unpauseReal() {
    curpage = gamePageN;
    timerTogglePause();
}

unpausingMenuPageN = addPage(
	(function unpausingK(k) {
		if(keybinds[k.key] === 'pause') {
			pause();
		}
	}),
	emptyfn //navbar
);

pauseMenuPageN = addPage(
	(function pauseK(k) {
		switch(k.key) {
			case 'ArrowUp':
				var u = -1;
			case 'ArrowDown':
				pauseMenu.navigate(u || 1);
				break;
			case 'Enter':
				switch(actEl().tabIndex) {
					case 0: //continue
						unpause();
						break;
					case 1: //volume adjustment
						pauseMenu.menuViewToggle(false);
						volumeControl.show(()=>{pauseMenu.menuViewToggle(true);});
						break;
					case 2: //restart
						reset();
						unpause(true);
						break;
					case 3:
						exitToSongSelect();
						break;
				}
				break;
		}
	}),
	(function pauseNavbar(){return ['','select']})
)

//handlers
if('mozAudioChannelManager' in navigator) {
    navigator.mozAudioChannelManager.addEventListener('headphoneschange', ()=>{
        if(!navigator.mozAudioChannelManager.headphones) {
            pause();
        }
    });
}
document.addEventListener('visibilitychange',()=>{
    if(document.visibilityState === 'hidden') {
        pause();
    }
});