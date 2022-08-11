var songDirectory = `${gameDirectory}/${gameSubDirectories.songs}`;

function beginScan(detectedFn) {
	return (new Promise((resolve,reject)=>{
		var novEnum = deviceStorage.enumerate(songDirectory);
		novEnum.addEventListener('success',(e)=>{
			if(!e.target.done) {
				function proceed() {e.target.continue();}
            
                var file = e.target.result,
                fullFilePath = file.name,
                filePathParsed = parseFilePath(fullFilePath, songDirectory);
				
				if(
					(
						databaseTools.validFileExts.indexOf(filePathParsed.fileExtention) !== -1
					) && (
						filePathParsed.pathArray.length === 2
					)
				) {
					fileReaderA(file, 'arraybuffer')
					.then((fileHash)=>{
						fileHash = md5(fileHash);
						detectedFn(
							file,
							filePathParsed,
							fileHash
						).then(proceed);
					});
				} else {
					proceed();
				}
			} else {
				//done
				resolve();
			}
		});
		novEnum.addEventListener('error',(e)=>{
			console.error(e);
			reject(e);
		});
	}));
}
