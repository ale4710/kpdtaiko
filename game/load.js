var urlParams = (new URLSearchParams(location.hash.substr(1)));

function postError(msg) {
	showNavbar(true);
	messageBox.create(
		'Error!',
		msg,
		{
			center: messageBox.makeOpt(exitToSongSelect,'ok'),
			back: messageBox.makeOpt(exitToSongSelect)
		}
	);
}

function updateCornerLoadingDisplay(t) {
	if(t === false) {
		eid('loading-display-corner').remove();
		updateCornerLoadingDisplay = undefined;
	} else {
		eid('loading-display-corner').textContent = t;
	}
}

function firstLoad(loaderFn) {
	firstLoad = null;
	
	let chartFolder = urlParams.get('folder');
    let chartFileName = urlParams.get('fileName');
    let chartFileType = urlParams.get('fileType');
    let chartId = urlParams.get('songId');
    
    initializeLocalTimeOffset(chartId);
	
	let promises = [
		waitDrawReady(),
		checkBottomStageReady(),
		loadTopCharacter()
	];
	
	updateCornerLoadingDisplay('Loading chart...');
	loaderFn(`${chartFolder}/${chartFileName}`).then((blob)=>{
        fileReaderA(blob,'arraybuffer').then((arrayBuf)=>{
            let gameText = fixTextEncoding(arrayBuf);
            let opts = {
                scrollMultiplier: modsList.mods.scrollSpeed.check()
            };
			let errorMsg = 'There was a problem while trying to parse your file.';
			let sucessfulParse = true;

            switch(chartFileType) {
                case 'osu':
					try {
						gameFile = parseOsuFile(gameText, opts);
					} catch(e) {
						if(typeof(e) === 'string') {
							var emsg = {
								['not taiko']: 'The provided osu file is not in the taiko game mode.',
								['not osu file']: 'Could not confirm the file to be of the osu file format.'
							};
							if(e in emsg) {
								errorMsg = emsg[e];
							}
						}
						sucessfulParse = false;
					}
                    break;
                case 'tja':
                    opts.targetCourse = urlParams.get('targetDifficulty');
                    gameFile = parseTjaFile(gameText, opts);
                    break;
            }
			
			if(!sucessfulParse) {
				postError(errorMsg);
			} else {
				//image
				if(gameFile.image && getSettingValue('show-background')) {
					promises.push(
						loaderFn(`${chartFolder}/${gameFile.image}`)
						.then((imgBlob)=>{
							printBg(URL.createObjectURL(imgBlob));
						})
					);
				}

				//audio
				promises.push(new Promise(function(resolve){
					function noAudio() {
						timerMode = 1;
						originalTimerMode = 1;
						mediaPlayMode = 2
						initAudioControl();
						showNavbar(true);
						messageBox.create(
							'Warning!',
							'The audio could not be loaded. Would you like to continue?',
							{
								right: messageBox.makeOpt(()=>{
									showNavbar(false);
									resolve();
								}, 'yes'),
								left: messageBox.makeOpt(exitToSongSelect, 'no'),
								back: messageBox.makeOpt(exitToSongSelect)
							}
						);
						updatenavbar();
					}
					
					if(gameFile.audio) {
						loaderFn(`${chartFolder}/${gameFile.audio}`)
						.then((audioBlob)=>{
							loadAudio(audioBlob)
							.then(resolve)
							.catch((e)=>{
								console.error(e);
								noAudio();
							});
						})
						.catch(noAudio);
					} else {noAudio()}
				}));
			}
			
			updateCornerLoadingDisplay('Loading resources...');
			Promise.allSettled(promises).then(start);
        }).catch(()=>{
			postError('There was a problem when trying to read the file.');
		});
    }).catch(()=>{
        postError('The song could not be found.');
    });
}

(()=>{
	let scriptsToLoad = [];
	
	//data loader
	scriptsToLoad.push('loader/' + urlParams.get('songSource'));
	
	//risky mod
	if(modsList.mods.risky.check() !== 0) {
		scriptsToLoad.push('modRisky');
	}
	
	//load it
	addGlobalReferenceGroup(0, scriptsToLoad);
})();

waitDocumentLoaded().then(function(){
	document.body.classList.add('loading-started');
	//fucking adverts
	advertManager.initialize();
});