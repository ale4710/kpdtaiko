var imported = false;
var errorLog = [];
var errorLogMessages = {
	'zipReadError': 'Failed to read archive.',
	'SecurityError': 'Write permission denied.',
	'NoModificationAllowedError': 'The existing file cannot be modified.',
	'NotSupportedError': 'Unsupported operation.'
};
var summaryPageN = addPage(
	(function(k){
		switch(k.key) {
			case 'Backspace':
			case 'Enter':
			{
				errorLog.length = 0;
				toInitPage();
			} break;
			case 'SoftRight': {
				if(errorLog.length !== 0) {
					let dummyElement = document.createElement('div');
					errorLog.forEach((error)=>{
						let entry = document.createElement('div');
						entry.style.padding = '5px 0';
						entry.textContent = error.filename;
						
						let reason = document.createElement('div');
						reason.style.paddingLeft = '5px';
						reason.textContent = (
							(error.error in errorLogMessages)? 
								errorLogMessages[error.error] :
								`Unknown error. (${error.error})`
						);
						entry.appendChild(reason);
						
						dummyElement.appendChild(entry);
					});
					
					let a = messageBox.makeOpt(messageBox.defaultCb, 'ok');
					messageBox.create(
						'Error Log',
						dummyElement.innerHTML,
						{
							center: a,
							back: a
						}
					);
				}
			} break;
			default: {
				eid('import-summary-list').focus();
			} break;
		}
	}),
	(function(){return [
		'',
		'continue',
		(errorLog.length === 0? '' : 'errors')
	]})
);

function toInitPage(){
	hideAllScreens();
	eid('initial-screen').classList.remove('hidden');
	curpage = initialPageN;
};

function beginImport() {
	let songDirectory = `${gameDirectory}/${gameSubDirectories.songs}`;
	
	let queue = [];
	
	let filesImported = [];
	
	errorLog.length = 0;
	
	function updateProgress(msg) {
		eid('progress-display').textContent = msg;
	};
	
	function writeError(err, filename) {
		let elEntry = {
			filename: filename,
			error: null
		};
		if(
			'error' in err &&
			err.error instanceof DOMError
		) {
			elEntry.error = err.error.name;
		}
		return elEntry;
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
						let errorOccurred = false;
						
						JSZip().loadAsync(zipFile, {decodeFileName: fixTextEncoding})
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
											zip.files[gameFilePath.filePathFull].async('arraybuffer').then((gameFile)=>{
												console.log('parsing' + gameFilePath.filePathFull);
												gameFile = fixTextEncoding(gameFile);
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
													.catch((err)=>{
														errorOccurred = true;
														console.error(err);
														errorLog.push(writeError(err));
													})
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
												.catch((err)=>{
													errorOccurred = true;
													console.error(err);
													errorLog.push(writeError(err));
													
												})
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
									imported = true;
									filesImported.push(zipFileName);
								}
							});
						})
						.catch((err)=>{
							console.error(err);
							errorLog.push({
								error: 'zipReadError',
								filename: file.name
							});
						})
						.finally(processQueue);
					} else {
						topProceed(true);
					}
				})();
			} else {
				//queue is length 0
				topProceed(true);
			}
		});
	}).catch((err)=>{
		//a big error occured?
		console.error(err);
		
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
				center: messageBox.makeOpt(toInitPage, 'ok'),
				back: messageBox.makeOpt(toInitPage)
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
		
		//printing file summary
		filesImported.sort(); //default alphabet sorting
		eid('import-summary-count').textContent = filesImported.length;
		if(filesImported.length === 0) {
			let nonEl = document.createElement('div');
			nonEl.textContent = '(No archives imported)';
			nonEl.classList.add('center', 'text-center', 'no-archives');
			eid('import-summary-list').appendChild(nonEl);
		} else {
			filesImported.forEach((filename)=>{
				let el = document.createElement('div');
				el.textContent = filename;
				el.classList.add('archive-entry');
				eid('import-summary-list').appendChild(el);
			});
		}
		filesImported = undefined;
		
		//error notification
		eid('import-summary-error-occurred').classList.toggle('hidden', errorLog.length === 0);
		
		//misc
		disableControls = false;
		curpage = summaryPageN;
		updatenavbar();
	});
}