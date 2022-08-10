var ended = false,
endedAllowContinue = false,
modsDisplayEnd = (new ModsView(
	1,
	eid('game-stats-extra-info')
));
function end() {
    ended = true;
    document.body.classList.remove('special');
    outputGameplayInfoFinal();

    var endDispChildren = eid('end-display-in').children;
    for(var i = 0; i < endDispChildren.length; i++) {
        endDispChildren[i].classList.add('hidden');
    }

    var elToShow;
    if(isPerfectAccuracy()) {
        elToShow = eid('end-display-perfect');
    } else if(isFullCombo()) {
        elToShow = eid('end-display-full-combo');
    } else if(autoplayEnabled) {
        elToShow = eid('end-display-autoplay-tried');
    } else {
        elToShow = eid('end-display-normal-complete');
    }
    elToShow.classList.remove('hidden');

    document.body.classList.add('ended');
	
	bottomStage.finish();
	
    setTimeout(()=>{
        if('artistDisplayMode' in gameFile) {
            switch(gameFile.artistDisplayMode) {
                case 0: //hide it
                    outputInfo(
                        gameFile.title,
                        '',
                        gameFile.difficulty
                    );
                    break;
                case 1: //show next to title
                    outputInfo(
                        gameFile.title + ' ' + gameFile.artist,
                        '',
                        gameFile.difficulty
                    );
                    break;
            }
        }

        document.body.classList.add('show-stats');

        gameLoopStop();

        setTimeout(()=>{
			curpage = 3;
			updatenavbar();
			showNavbar(true);
			transparentNavbar(true);
		}, 500);
    },1500);
}

function exitToSongSelect() {location = '/songselect/index.html';}

var showDetailedStatsClassList = 'show-stats-detailed';
function endedK(k) {
	switch(k.key) {
		case 'Enter':
		case 'Backspace':
			exitToSongSelect();
			break;
		case 'SoftLeft':
			document.body.classList.toggle(showDetailedStatsClassList);
			break;
	}
}
function endedNavbar() {
	outputNavbar(
		document.body.classList.contains(showDetailedStatsClassList)? 'hide' : 'details',
		'continue'
	);
}