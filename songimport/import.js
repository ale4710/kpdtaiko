let summaryPageN = addPage(
	(function(k){
		switch(k.key) {
			case 'Backspace':
			case 'Enter':
				messageBox.create(
					'Rescan',
					'Would you like to rescan the song library?',
					{
						center: messageBox.makeOpt(()=>{location = '/songscan/index.html';}, 'yes'),
						right: messageBox.makeOpt(toTitleScreen, 'no'),
						left: messageBox.makeOpt(messageBox.defaultCb, 'cancel'),
						back: messageBox.makeOpt(messageBox.defaultCb)
					}
				);
				break;
			default:
				eid('import-summary-list').focus();
				break;
		}
	}),
	(function(){return ['','continue']})
);

function beginImport() {
	let songDirectory = `${gameDirectory}/${gameSubDirectories.songs}`;
	
	let queue = [];
	
	let filesImported = [];
	
	function updateProgress(msg) {
		eid('progress-display').textContent = msg;
	};
	
	updateProgress('collecting files');
	enumerateFiles(`${gameDirectory}/${gameSubDirectories.import}`, (file)=>{
		let fileExt = parseFilePath(file.name).fileExtention;
		console.log(fileExt);
		if([
			'osz',
			'zip'
		].indexOf(fileExt) !== -1) {
			//add to queue
			queue.push(file);
			console.log(file.name + ' added to queue');
		}
	}).then(()=>{
		//all files collected
		updateProgress('files collected!');
		console.log('--all files collected--');
		//process them
		return new Promise((topProceed)=>{
			if(queue.length !== 0) {
				(function processQueue(){
					let zipFile = queue.pop();
					if(zipFile) {
						let zipFilePathParsed = parseFilePath(zipFile.name);
						let zipFileName = zipFilePathParsed.filename;
						updateProgress('opening ' + zipFileName);
						
						let filesExtracted = false;
						
						JSZip().loadAsync(zipFile)
						.then((zip)=>{
							updateProgress('reading ' + zipFileName);
							//note down game files
							let gameFilePaths = [];
							zip.forEach((path)=>{
								let pathParsed = parseFilePath(path);
								if([
									'osu',
									'tja'
								].indexOf(pathParsed.fileExtention) !== -1) {
									gameFilePaths.push(pathParsed);
								}
							});
							//process the game files
							return new Promise((proceed)=>{
								//array for the files that are related to the game files
								let remainingFilesToWrite = [];
								
								(function readGameFiles(){
									let gameFilePath = gameFilePaths.pop();
									if(gameFilePath) {
										//parse the game files
										if(gameFilePath.filePathFull in zip.files) {
											zip.files[gameFilePath.filePathFull].async('text').then((gameFile)=>{
												console.log('parsing' + gameFilePath.filePathFull);
												//only write out the file if it is valid
												let validFile = false;
												switch(gameFilePath.fileExtention) {
													case 'osu':
														let osuFile;
														try {
															osuFile = parseOsuFile(gameFile);
														} catch(err) {}
														
														if(osuFile) {
															validFile = true;
															//audio file
															[
																osuFile.audio,
																osuFile.image
															].forEach((fileName)=>{
																if(
																	!!fileName &&
																	(remainingFilesToWrite.indexOf(fileName) === -1)
																) {
																	remainingFilesToWrite.push(fileName);
																}
															});
														}
														break;
													case 'tja':
														let tjaFileSummary = parseTjaFile(gameFile, {checkAllCourse: true});
														if(
															tjaFileSummary &&
															(tjaFileSummary.length !== 0)
														) {
															validFile = true;
															tjaFileSummary.forEach((tjaFile)=>{
																if(
																	!!tjaFile.audio &&
																	(remainingFilesToWrite.indexOf(tjaFile.audio) === -1)
																) {
																	remainingFilesToWrite.push(tjaFile.audio);
																}
															});
														}
														break;
												}
												
												let writePromise;
												if(validFile) {
													filesExtracted = true;
													//only write out if its valid
													updateProgress(`writing ${zipFileName}/${gameFilePath.filePathFull}`);
													writePromise = addFile(`${songDirectory}/${zipFileName}/${gameFilePath.filePathFull}`, new Blob([gameFile]))
													.catch((err)=>{console.error(err);})
												} else {
													writePromise = Promise.resolve();
												}
												
												writePromise.then(readGameFiles)
											});	
										} else {
											readGameFiles();
										}
									} else {
										console.log('--parsing done--');
										gameFilePaths = undefined;
										proceed(remainingFilesToWrite);
									}
								})();
							})
							.then((remainingFilesToWrite)=>{
								console.log('now printing remaining files');
								return new Promise((proceed)=>{
									//write the remaining files
									(function writeRemFiles(){
										let rfile = remainingFilesToWrite.pop();
										if(rfile) {
											let rfileCheckWrite;
											if(rfile in zip.files) {
												rfileCheckWrite = zip.files[rfile].async('blob')
												.then((blob)=>{
													updateProgress(`writing ${zipFileName}/${rfile}`);
													return addFile(`${songDirectory}/${zipFileName}/${rfile}`, blob);
												})
												.catch((err)=>{console.error(err);})
											} else {
												rfileCheckWrite = Promise.resolve();
											}
											rfileCheckWrite.then(writeRemFiles);
										} else {
											console.log('--remaining files printed--');
											proceed();
										}
									})();
								})
							})
							.then(()=>{
								if(filesExtracted) {
									filesImported.push(zipFileName);
								}
							});
						})
						.catch((err)=>{
							console.error(err);
							failedFiles.push(file.name);
						})
						.finally(processQueue);
					} else {
						topProceed(true);
					}
				})();
			} else {
				//queue is length 0
				return Promise.resolve(true);
			}
		});
	}).catch((err)=>{
		//a big error occured?
		console.error(err);
		
		function toinitpage(){
			eid('progress-display-container').classList.add('hidden');
			eid('initial-screen').classList.remove('hidden');
			curpage = initialPageN;
		};
		
		let msg = (typeof(err) === 'string' && err) || 'Unknown error occurred.';
		if(
			'target' in err &&
			'error' in err.target &&
			err.target.error.name === 'NotFoundError'
		) {
			msg = 'The folder was not found. Check to see if the folder exists and try again.';
		}
		
		messageBox.create(
			'An error occured.',
			msg,
			{
				center: messageBox.makeOpt(toinitpage, 'ok'),
				back: messageBox.makeOpt(toinitpage)
			}
		);
		disableControls = false;
		updatenavbar();
		
		return Promise.resolve(false); //dont proceed...
	})
	.then((success)=>{
		if(!success) {return}
		
		console.log('!!! ALL DONE !!!');
		updateProgress = undefined;
		
		//reset this
		resetDirectoryChangedStatus();
		
		//page visibility
		eid('progress-display-container').classList.add('hidden');
		eid('import-summary').classList.remove('hidden');
		
		filesImported.sort(); //default alphabet sorting
		eid('import-summary-count').textContent = filesImported.length;
		filesImported.forEach((filename)=>{
			let el = document.createElement('div');
			el.textContent = filename;
			eid('import-summary-list').appendChild(el);
		});
		filesImported = undefined;
		
		disableControls = false;
		curpage = summaryPageN;
		updatenavbar();
	});
}