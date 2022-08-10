var pauseMenu = (new OptionsMenu('Paused'));
pauseMenu.addOption('Continue');
pauseMenu.addOption('Adjust Volume');
pauseMenu.addOption('Restart');
pauseMenu.addOption('Exit');

var pauseMenuVisible = false;

function pause() {
    if(ended || !ready) {return}
    if(!timerPaused) {timerTogglePause();}
    gameLoopStop();

    clearInterval(unpauseINT);
    unpauseCountdown = 4;
    
    gameAnim(false);

    document.body.classList.remove('hide-navbar');
    if(!pauseMenuVisible) {
        pauseMenuVisible = true;
        pauseMenu.menuViewToggle(true,true);
    }
    curpage = 1;
}

var unpauseINT, unpauseCountdown = 0;
function unpause(immediate) {
    gameLoop();
    gameAnim();

    document.body.classList.add('hide-navbar');
    pauseMenu.menuViewToggle(false);
    pauseMenuVisible = false;

    if(immediate) {
        unpauseReal();
    } else {
        curpage = 2;
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
    curpage = 0;
    timerTogglePause();
}

function unpausingK(k) { //page = 2
    if(keybinds[k.key] === 'pause') {
        pause();
    }
}

function pauseK(k) { //page = 1
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
}

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