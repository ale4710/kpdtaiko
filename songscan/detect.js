(function(){
	let unseenSongs = [].concat(database.songsIds);
	
	let scanBeginner;
	
	function beginScanForReal() {
		beginScanForReal = undefined;

		scanBeginner(function(file, filePathParts, fileHash){
			return (new Promise(function(resolve, reject){
				let thisFileInfo = {
					changed: false,
					newFile: false
				};
				
				let existingSongSearchQuery = {
					hash: database.songsDb({hash: fileHash}),
					path: database.songsDb({filePath: filePathParts.filePath})
				};
				
				let songDatabaseExistance = (
					(existingSongSearchQuery.hash.count() !== 0) +
					((existingSongSearchQuery.path.count() !== 0) << 1)
				);
				
				//remove existing songs from unseenSongs list
				if(songDatabaseExistance !== 0) {
					//exists
					let sidList = existingSongSearchQuery.hash.select('id');
					sidList.concat(existingSongSearchQuery.path.select('id'));
					
					sidList.forEach((id)=>{
						arraySearchAndRemove(
							unseenSongs,
							id
						);
					});
				}
				
				let proceedToScan = false;
				console.log(songDatabaseExistance);
				switch(songDatabaseExistance) {
					// 0 0
					// | |hash exists
					// |path exists

					case 0b10: //path is the same, but file contents changed.
						database.songsDb({filePath: filePathParts.filePath}).remove();
						proceedToScan = true;
						thisFileInfo.changed = true;
						break;

					case 0b00: //completely new
						proceedToScan = true;
						break;

					case 0b01: //hash is the same, but the song was moved.
						database.songsDb({hash: fileHash}).update({filePath: filePathParts.filePath});
						thisFileInfo.changed = true; //counts as changed
						break;

					/* case 0b11: //file completely unchanged...
						break; */
				}
				
				if(proceedToScan) {
					databaseTools.autoParseFile(
						file,
						filePathParts.fileExtention
					).then(function(parsedSong){
						if(!Array.isArray(parsedSong)) {
							parsedSong = [parsedSong];
						}
						
						parsedSong.forEach(function(songInfo){
							let songData = databaseTools.createSongData();
							songData.fileType = filePathParts.fileExtention;
							songData.filePath = filePathParts.filePath;
							songData.hash = fileHash;
							
							
							songData.difficultySort = getDifficultySortNumber(
								songInfo.difficultyLabel || songInfo.difficulty
							);
							
							songData.source = (testing? 'internal' : 'user');
							
							[
								'id',
								'title',
								'artist',
								'difficulty',
								'difficultyLevel',
								'difficultyLabel',
								'creator',
								'mediaSource',
								'image',
								['previewFile', 'audio'],
								['previewTime', 'previewPoint']
							].forEach(function(prop){
								let a, b;
								if(Array.isArray(prop)) {
									a = prop[0];
									b = prop[1];
								} else {
									a = prop;
									b = prop;
								}
								songData[a] = songInfo[b] || null;
							});
							
							database.addSong(songData);
						});
						
						resolve(thisFileInfo);
						
					}).catch((err)=>{
						resolve(thisFileInfo);
					});
				} else {
					resolve(thisFileInfo);
				}
			}));
		}).then(function(){
			console.log('finishing up!!!!');
			let songsToRemove = database.songsDb({id: unseenSongs});
			console.log('remove', songsToRemove.count(), 'total songs');
			songsToRemove.remove();
			
			finish();
		});
	};
	
	if(testing) {
		function bstec(){
			if('beginScanTest' in window) {
				bstec = undefined;
				scanBeginner = beginScanTest;
				beginScanForReal();
			} else {
				setTimeout(bstec);
			}
		};
		
		bstec();
	} else {
		let scriptFileName = ('scan-v' + [
			'2.5',
			'3'
		][0 + ('b2g' in navigator)]);
		
		addGlobalReference(0, scriptFileName).then(()=>{
			scanBeginner = beginScan;
			beginScanForReal();
		});
	}
})();
