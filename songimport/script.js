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
				eid('initial-screen').classList.add('hidden');
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
	eid('initial-screen-location').textContent = `${gameDirectory}/${gameSubDirectories.import}/`;
	curpage = initialPageN;
	updatenavbar();
	disableControls = false;
	preventNavDefault = false;
});