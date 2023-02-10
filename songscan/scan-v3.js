var songDirectory = `${gameDirectory}/${gameSubDirectories.songs}`;

function beginScan(detectedFn) {
	return new Promise(function(resolve, reject){
		let dsEnum = deviceStorage.enumerate(songDirectory);
		let fileIterate = dsEnum.values();
		
		function reciever(iterateRetv) {
			if(iterateRetv.done) {
				resolve();
			} else {
				let file = iterateRetv.value;
				let fullFilePath = file.name;
				let filePathParsed = parseFilePath(fullFilePath, songDirectory);
				
				if(
					(
						databaseTools.validFileExts.indexOf(filePathParsed.fileExtention) !== -1
					) && (
						filePathParsed.pathArray.length === 2
					)
				) {
					outputProgress(`now scanning ${filePathParsed.filename}`);
					fileReaderA(file, 'arraybuffer')
					.then((fileHash)=>{
						fileHash = md5(fileHash);
						detectedFn(
							file,
							filePathParsed,
							fileHash
						).then(next);
					});
				} else {
					next()
				}
			}
		};
		
		function next() {fileIterate.next().then(reciever)}
		
		next();
	});
}
