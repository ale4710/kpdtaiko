function hideAllScreens() {
	let screens = ecls('fscreen');
	for(let i = 0; i < screens.length; i++) {
		screens[i].classList.add('hidden');
	}
}

function toTitleScreen() {
	let usp = new URLSearchParams();
	usp.set('goto', 'title');
	usp.set('select-random', 0);
	location = '/songselect/index.html#' + usp.toString();
}

let initialPageN = addPage(
	(function(k){
		switch(k.key) {
			case 'Backspace':
			case 'SoftLeft':
				if(imported) {
					messageBox.create(
						'Rescan',
						'Would you like to rescan the song library?',
						{
							right: messageBox.makeOpt(()=>{location = '/songscan/index.html';}, 'yes'),
							left: messageBox.makeOpt(toTitleScreen, 'no'),
							back: messageBox.makeOpt(emptyfn, undefined, true)
						}
					);
				} else {
					toTitleScreen();
				}
				break;
			case 'Enter':
				hideAllScreens();
				eid('progress-display-container').classList.remove('hidden');
				curpage = undefined;
				disableControls = true;
				beginImport();
				break;
		}
	}),
	(function(){return ['back','import']})
);

waitDocumentLoaded().then(()=>{
	eid('main-content').classList.remove('hidden');
	toInitPage();
	eid('initial-screen-location').textContent = `${gameDirectory}/${gameSubDirectories.import}/`;
	curpage = initialPageN;
	updatenavbar();
	disableControls = false;
	preventNavDefault = false;
});