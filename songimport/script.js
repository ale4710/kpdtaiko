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
				toTitleScreen();
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
	(function(){return ['cancel','import']})
);

waitDocumentLoaded().then(()=>{
	eid('initial-screen-location').textContent = `${gameDirectory}/${gameSubDirectories.import}`;
	curpage = initialPageN;
	updatenavbar();
	disableControls = false;
});