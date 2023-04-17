waitDocumentLoaded().then(function(){
	console.log('loaded');
	
	addGlobalReferenceGroup(0, [
		//load stuff for init
		'controlsChanger',
		'bottomStageSettings'
	])
	.then(()=>{
		//initialize stuff that needs to be initialized
		return Promise.all([
			_loadBottomStageSettings()
		]);
	})
	.then(()=>{
		extraLoad = undefined;
		if(location.hash === '#bootup') {
			console.log('app has been started.');
			sessionStorage.setItem('apprunning',true);
			initSettings(0,true);
			
			(new Promise((proceed)=>{
				//create game folders
				if(!deviceStorage) {
					proceed();
				} else {
					let emptyBlob = new Blob();
					let foldersToCheck = Object.values(gameSubDirectories);
					(function checkFolder(){
						let folder = foldersToCheck.pop();
						if(folder) {
							let fullPath = `${gameDirectory}/${folder}/DELETE_ME`;
							addFile(fullPath, emptyBlob)
							.then(()=>{return deleteFile(fullPath);})
							.finally(checkFolder);
						} else {
							proceed();
						}
					})();
			}
			})).then(()=>{
				let rescan = (localStorage.getItem('do-not-rescan') !== '1');
				setTimeout(()=>{
					if(rescan) {
						location = '/songscan/index.html';
					} else {
						let usp = new URLSearchParams();
						usp.set('goto', 'title');
						usp.set('select-random', 1);
						location = '/songselect/index.html#' + usp.toString();
					}
				}, 10);
			});
		} else {
			disableControls = false;
			curpage = mainScreenPageN;
			eid('main').classList.remove('hidden');
			initSettings(0);
			updateHeader();
			updatenavbar();
		}
	});
});