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

function firstLoad(loaderFn) {
	firstLoad = null;
	
	let chartFolder = urlParams.get('folder');
    let chartFileName = urlParams.get('fileName');
    let chartFileType = urlParams.get('fileType');
    let chartId = urlParams.get('songId');
    
    initializeLocalTimeOffset(chartId);
	
	loaderFn(`${chartFolder}/${chartFileName}`).then((blob)=>{
        fileReaderA(blob,'arraybuffer').then((arrayBuf)=>{
            var gameText = fixTextEncoding(arrayBuf),
            opts = {
                scrollMultiplier: modsList.mods.scrollSpeed.check()
            },
			errorMsg = 'There was a problem while trying to parse your file.',
			sucessfulParse = true;

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
                    //opts.checkAllCourse = true;
                    gameFile = parseTjaFile(gameText, opts);
                    break;
            }
			
			if(!sucessfulParse) {
				postError(errorMsg);
			} else {
				//image
				//checkReadyNeeded++;
				if(gameFile.image && getSettingValue('show-background')) {
					loaderFn(`${chartFolder}/${gameFile.image}`)
					.then((imgBlob)=>{
						printBg(URL.createObjectURL(imgBlob));
						/* setCssVariable(
							'bg-url',
							`url('${URL.createObjectURL(imgBlob)}')`
						); */
						checkReady();
					})
					.catch(checkReady);
				} else {checkReady()}

				//audio
				//checkReadyNeeded++;
				function noAudio() {
					//readyRequired++;
					timerMode = 1;
					showNavbar(true);
					messageBox.create(
						'Warning!',
						'The audio could not be loaded. Would you like to continue?',
						{
							right: messageBox.makeOpt(()=>{
								showNavbar(false);
								checkReady();
							}, 'yes'),
							left: messageBox.makeOpt(exitToSongSelect, 'no'),
							back: messageBox.makeOpt(exitToSongSelect)
						}
					);
				}
				if(gameFile.audio) {
					loaderFn(`${chartFolder}/${gameFile.audio}`)
					.then((audioBlob)=>{
						loadAudio(audioBlob)
						.then(checkReady)
						.catch((e)=>{
							console.error(e);
							noAudio();
						});
					})
					.catch(noAudio);
				} else {noAudio()}
			}
        }).catch(()=>{
			postError('There was a problem when trying to read the file.');
		});
    }).catch(()=>{
        postError('The song could not be found.');
    });
}

(()=>{
	addGlobalReference(0,
		'loader/' + urlParams.get('songSource')
	).then(()=>{
		eid('loading-display-in').textContent = 'Loading...';
	});
})();