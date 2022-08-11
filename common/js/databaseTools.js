var databaseTools = (function(){
	var validFileExts = [
		'osu',
		'tja'
	];

	function createSongData() {
		return {
			id: null,
			title: null,
			artist: null,
			fileType: null,
			difficulty: null,
			difficultySort: null,
			difficultyLevel: null,
			creator: null,
			filePath: null,
			hash: null,
			image: null,
			previewFile: null,
			previewTime: 0
		};
	}
	
	class SongManager {
		constructor(db, saveDatabaseFn) {
			this.songsDb = TAFFY(db || []);
			this.songsIds = this.songsDb().select('id');
			
			this.saveDatabaseFn = saveDatabaseFn || emptyFn;
		}
		
		saveDatabase() {
			return this.saveDatabaseFn(this.songsDb().stringify());
		}
		
		addSong(data) {
			var id = createRandomKey(this.songsIds);
			data.id = id;
			this.songsDb.insert(data);
			return id;
		}
		
		/* removeSong(filterObj) {
			var s = this.songsDb(filterObj), sids = this.songsIds;
			s.each(function(s) {
				arraySearchAndRemove(sids, s.id);
			});
			d.remove();
		}
		
		updateSongs(filter, change) {
			this.songsDb(filter).update(change);
		} */
		
		groupSongs(groupPropertiesOverride) {
			var grouped = {},
			groupProperties;
			
			if(Array.isArray(groupPropertiesOverride)) {
				groupProperties = groupPropertiesOverride;
			} else {
				groupProperties = [
					'title',
					'artist',
					'folder'
				];
			}
			
			this.songsDb().each(function(song){
				var groupKey = '';
				groupProperties.forEach((property)=>{
					switch(property) {
						default: 
							groupKey += song[property]; 
							break;
						case 'folder':
							groupKey += parseFilePath(song.filePath).directory; 
							break;
					}
					
					groupKey += '~';
				});
				
				var group = grouped[groupKey];
				if(!group) {
					group = {
						songs: [],
						difficultySummary: []
					};

					[
						'id',
						'title',
						'artist',
						'creator',
						'fileType',
						'filePath',
						'image',
						'previewFile',
						'previewTime',
						'mediaSource'
					].forEach((property)=>{
						group[property] = song[property];
					});
					
					grouped[groupKey] = group;
				}
				
				group.difficultySummary.push({
					sort: song.difficultySort,
					difficulty: song.difficultyLevel
				});
				group.songs.push(song.id);
			});
			
			return Object.values(grouped);
		}
	}
	
	function apfErr(ft,err) {
		return {
			type: ft,
			error: err
		};
	}
	function autoParseFile(file, type) {
		return (new Promise((resolve, reject)=>{
			if(file instanceof Blob) {
				fileReaderA(file,'arraybuffer').then((ab)=>{
					var songText = fixTextEncoding(ab),
					parsedSong,
					errorMsg;
					
					try {
						switch(type) {
							case validFileExts[0]: //osu
								parsedSong = parseOsuFile(songText);
								break;
							case validFileExts[1]: //tja
								parsedSong = parseTjaFile(songText, {checkAllCourse: true});
								break;
							default:
								errorMsg = 'not a valid file!?!?!?!';
								break;
						}
					} catch(e) {
						console.error(e);
						errorMsg = apfErr(type, e);
					}
					
					if(parsedSong) {
						resolve(parsedSong);
					} else {
						reject(errorMsg);
					}
				}).catch(function(){
					reject(...arguments);
				});
			} else {
				reject('not a blob');
			}
		}));
	}
	
	return {
		validFileExts: validFileExts,
		createSongData: createSongData,
		SongManager: SongManager,
		autoParseFile: autoParseFile
	};
})();