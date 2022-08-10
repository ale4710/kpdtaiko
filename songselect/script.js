var songList,

audio = (new Audio()),
audioStartPoint = 0,
audioAvailable = false,

lastSongSelected;

audio.addEventListener('ended',()=>{
	audio.currentTime = audioStartPoint;
	audio.play();
});

function updateAudioVolume() {
	var v = volumeControl.getVolume();
	audio.volume = (v.music / v.max);
}
updateAudioVolume();

window.addEventListener('volumechange', updateAudioVolume);

document.addEventListener('visibilitychange',()=>{
	if(audioAvailable) {
		if(document.visibilityState === 'visible') {
			audio.play();
		} else {
			audio.pause();
		}
	}
});

window.addEventListener('load',()=>{
	function showList() {
		var ls = sessionStorage.getItem('songSelectLastSelected');
		if(ls !== null) {ls = parseInt(ls);}

		reprintList(ls).then((focus)=>{
			toggleThrobber(false);
			eid('song-select-list').classList.remove('hidden');
			focus();
	
			updatenavbar();

			if(getDirectoryChangedStatus()) {
				showDirectoryChangedMessage();
			}
		});
	}

	//we request the song list, and then,..
	//var cachedSongList = sessionStorage.getItem('songlist');
	var cachedSongList = null;
	if(cachedSongList) {
		songList = JSON.parse(cachedSongList);
		showList();
	} else {
		getSongList().then((songListlv)=>{
			songList = songListlv;
			sessionStorage.setItem('songlist', JSON.stringify(songList));
			showList();
		});
	}
});

function toggleThrobber(show) {
	eid('selection-list-throbber').classList.toggle('hidden');
	disableControls = !!show;
}

//main song list
var songSelectMenu = (new Menu(eid('song-select-list'))),
lastSongListSelected = 0;

 var sortMethodChangedPending = false;
window.addEventListener('sortmethodchanged', ()=>{
	if(curpage === 0) {
		sortMethodChanged();
	} else {
		sortMethodChangedPending = true;
	}
});
function sortMethodChanged() {
	sortMethodChangedPending = false;

	var ls = parseInt(actEl().dataset.id);
	console.log('focus to',ls);
	toggleThrobber(true);
	eid('song-select-list').classList.add('hidden');
	updatenavbar();
	reprintList(ls).then((focus)=>{
		toggleThrobber(false);
		eid('song-select-list').classList.remove('hidden');
		updatenavbar();
		focus(true);
	});
	
}
function reprintList(refocus) {
	if(typeof(refocus) !== 'number') {
		refocus = null;
	}
	return (new Promise(function(r){
		printList(
			groupSortManager.getGSmethod('sort').p,
			groupSortManager.getGSmethod('group').p,
			false,
			refocus
		).then((refocusIndex)=>{
			//console.log(refocusIndex);
			r(function(noUpdateDataDisplay){
				navigateSongList(refocusIndex, true, !!noUpdateDataDisplay);
			});
		});
	}));
}

function printList(sort, group, sortReverse, refocusId) {
	console.log(sort,group);
	
	if(typeof(refocusId) !== 'number') {
		refocusId = undefined;
	}

	songSelectMenu.clearMenu();
	//and clear the rest of the children
	clearChildrenInElement(
		songSelectMenu.menu.children
	);
	
	return (new Promise((resolve)=>{
		var ids = [...Array(songList.length).keys()],
		groupedSongs = {},
		noGroupSymbol = Symbol();
		
		if(typeof(group) === 'string') {
			ids.forEach((id)=>{
				var ts = songList[id];
				
				var groupKey = group.substr(0,7);
				if(groupKey === 'system-') {
					groupKey = null;
					switch(group.substr(7)) {
						case 'alphabet':
							groupKey = ts.title.toUpperCase().substr(0,1);
							break;
						default:
							groupKey = null;
							break;
					}
				} else {
					groupKey = ts[group];
				}

				if(!groupKey) {
					groupKey = noGroupSymbol;
				}
				thisGroup = groupedSongs[groupKey];
				if(!thisGroup) {
					thisGroup = [];
					groupedSongs[groupKey] = thisGroup;
				}
				thisGroup.push(id);
			});	
			
			ids = null;
		}
		
		//console.log(groupedSongs);
		
		var groupKeysSorted;
		if(ids !== null) {
			groupKeysSorted = [0];
		} else {
			groupKeysSorted = Object.keys(groupedSongs).sort((a,b)=>{
				return (a === b)? 0 : (1 - (2 * (a < b)));
			});
			
			if(noGroupSymbol in groupedSongs) {
				groupKeysSorted.unshift(noGroupSymbol);
			}
		}
		
		//console.log(groupKeysSorted);
		
		var refocusReturnVal;
		
		//print
		groupKeysSorted.forEach((gid)=>{
			var toPrint;
			if(!ids) {
				toPrint = groupedSongs[gid];
				
				var sepLabel = gid;
				if(gid === noGroupSymbol) {
					sepLabel = '*Ungrouped*';
				}
				songSelectMenu.addSeperator(sepLabel);
			} else {
				toPrint = ids;
			}

			toPrint.sort((a,b)=>{
				var pairCase = 0;
				switch(sort) {
					default: 
						//sort = 'title';
					case 'title':
						var a = songList[a].title.toLowerCase(),
						b = songList[b].title.toLowerCase();
						pairCase = (a === b)? 0 : (1 - (2 * (a < b)));
						break;
				}
				
				return pairCase * (1 - (!!sortReverse * 2));
			});
			
			toPrint.forEach((song, i)=>{
				var o = songSelectMenu.addOption(
					songList[song].title,
					song
				);
				
				if(refocusId === song) {
					//console.log('okay refocus to',song, gid);
					refocusReturnVal = o.tabIndex;
				} else if(refocusId === undefined) {
					refocusReturnVal = 0;
				}
			});
		});

		sessionStorage.setItem('songSelectSortMode', sort);
		resolve(refocusReturnVal);
	}));
}

function navigateSongList(n,abs,noUpdateSongDisplay,smooth) {
	if(abs) {songSelectMenu.navigate(0)}
	songSelectMenu.navigate(n);
	
	lastSongListSelected = actEl().tabIndex;
	lastSongSelected = parseInt(actEl().dataset.id || 0);
	sessionStorage.setItem('songSelectLastSelected', lastSongSelected);

	if(!noUpdateSongDisplay) {
		updateSongInfoDisplay();
	}

	//centering
	var ce = actEl(),
	cep = ce.parentElement,
	st = (ce.offsetTop - (cep.offsetHeight / 2)) + (ce.offsetHeight / 2);
	
	cep.scroll({
		top: st,
		behavior: !!smooth? 'smooth' : 'instant'
	});
	//cep.scrollTop = st;
	
	//console.log(actEl());
}

window.addEventListener('songmedialoaded', updateSongInfoDisplay);
function updateSongInfoDisplay() {
	scrollers.resetAll();
	
	var curSongId = lastSongSelected,
	//var curSongId = parseInt(actEl().dataset.id),
	curSong = songList[curSongId];

	//basic data
	eid('song-info-title').textContent = curSong.title;
	//eid('song-info-artist').textContent = curSong.artist;
	
	//misc data
	var lastc = null;
	[
		{e: 'artist', k: 'artist'},
		{e: 'filetype', k: 'fileType'},
		{e: 'creator', k: 'creator'},
		{e: 'source', k: 'mediaSource'}
	].forEach((dp)=>{
		var e = eid(`song-info-${dp.e}`),
		val = curSong[dp.k];
		e.classList.toggle('hidden', !val);
		e.classList.remove('last');
		if(val) {
			e.getElementsByClassName('text')[0].textContent = val;
			lastc = e;
		}
	});
	lastc.classList.add('last');
	

	//basic data for intro sequence
	eid('intro-slider-title').textContent = curSong.title;
	eid('intro-slider-artist').textContent = curSong.artist;
	
	var folder = parseFilePath(curSong.filePath).directory;

	//media
	//  image
	var img = eid('song-info-img'), imgcont = eid('song-info-img-container');
	if(img) {
		URL.revokeObjectURL(img.src);
		img.remove();
	}
	
	var hideImg = true;
	if(
		curSong.image &&
		(getSettingValue('show-background') === 1)
	) {
		var iblob = loadMedia(
			`${folder}/${curSong.image}`,
			curSong.source
		);
		switch(iblob) {
			case true: 
				hideImg = false;
				break;
			case false: 
				break;
			default:
				hideImg = false;
				var nimg = document.createElement('img');
				nimg.id = 'song-info-img';
				nimg.classList.add('fill');
				nimg.src = URL.createObjectURL(iblob);
				imgcont.appendChild(nimg);
				break;
		}
	}
	
	imgcont.classList.toggle('hidden', hideImg);
	
	//  audio
	URL.revokeObjectURL(audio.src);
	audio.pause();
	if(curSong.previewFile) {
		var ablob = loadMedia(
			`${folder}/${curSong.previewFile}`,
			curSong.source
		);
		audioAvailable = (ablob instanceof Blob);
		if(audioAvailable) {
			audio.src = URL.createObjectURL(ablob);
			audioStartPoint = (curSong.previewTime || 0) / 1000;
			audio.currentTime = audioStartPoint;
			//this is just incase it takes a long time for the list to load,
			//and the user minimizes the application or turns off their device
			if(document.visibilityState === 'visible') {
				audio.play();
			}
		}
	}
}

function selectSong() {
	eid('song-select-list').classList.add('hidden');
	toggleThrobber(true);
	updatenavbar();
	difficultyListMenu.clearMenu();
	
	var sds = [];
	songList[lastSongSelected].songs.forEach((sid)=>{
		sds.push(getSongDetails(sid));
	});
	
	Promise.all(sds).then((diffs)=>{
		diffs.sort((a,b)=>{
			return a.difficultySort - b.difficultySort;
		});
		
		diffs.forEach((diff)=>{
			var diffEl = difficultyListMenu.addOption(diff.difficultyLabel || diff.difficulty),
			diffLvlIndicator = document.createElement('div');
			diffEl.classList.add('difficulty', `difficulty-lv${diff.difficultySort}`);

			diffLvlIndicator.classList.add('difficulty-indicator');
			diffLvlIndicator.textContent = '★ = ';
			if(diff.difficultyLevel === null) {
				diffLvlIndicator.textContent += '?';
			} else {
				diffLvlIndicator.textContent += diff.difficultyLevel;
			}
			diffEl.appendChild(diffLvlIndicator);

			diffEl.dataset.filePath = diff.filePath;
			diffEl.dataset.target = diff.difficulty;
		});
		
		curpage = 1;
		toggleThrobber(false);
		updatenavbar();
		eid('difficulty-list').classList.remove('hidden');
		difficultyListMenu.navigate(0);

		var ce = actEl().parentElement,
		scrollTop = Math.min(
			actEl().offsetTop,
			(ce.scrollHeight / 2) - (ce.offsetHeight / 2)
		);
		ce.scrollTop = scrollTop;
	});
}

//difficulty selection
var difficultyListMenu = (new Menu(eid('difficulty-list'))),
difficultyScrollers = [];
function selectDifficulty() {
	var urlprms = (new URLSearchParams()),
	songToPlay = songList[lastSongSelected],
	stpPathParts = parseFilePath(actEl().dataset.filePath);
	urlprms.append('fileName', stpPathParts.filename);
	urlprms.append('folder', stpPathParts.directory);
	urlprms.append('fileType', songToPlay.fileType);
	urlprms.append('songSource', songToPlay.source);
	switch(songToPlay.fileType) {
		case 'tja':
			urlprms.append(
				'targetDifficulty',
				actEl().dataset.target
			);
			break;
	}

	//playIntro();
	playIntro(()=>{location = '/game/index.html#' + urlprms.toString();});
}

//keyboard
function songSelectListCommonK(k) {
	switch(k.key) {
		case 'SoftRight':
			gameMenu.show();
			break;
		case '1':
			toggleAuto();
			break;
	}
}

function keyHandler(k) {
	switch(curpage) {
		case 0: //main song select
			switch(k.key) {
				case 'ArrowUp':
					var u = -1;
				case 'ArrowDown':
					navigateSongList(
						u || 1,
						false,
						false,
						true
					);
					break;
				case 'Enter':
					selectSong();
					break;
				default:
					songSelectListCommonK(k);
					break;
			}
			break;
		case 1: //difficulty select
			switch(k.key) {
				case 'ArrowUp':
					var u = -1;
				case 'ArrowDown':
					difficultyListMenu.navigate(u || 1);
					break;
				case 'Enter':
					selectDifficulty();
					break;
				case 'Backspace':
					eid('difficulty-list').classList.add('hidden');
					eid('song-select-list').classList.remove('hidden');
					navigateSongList(
						lastSongListSelected,
						true,
						true
					);
					difficultyScrollers.forEach((s)=>{s.remove()});
					curpage = 0;
					if(sortMethodChangedPending) {
						sortMethodChanged();
					}
					break;
				default:
					songSelectListCommonK(k);
					break;
			}
			break;

		case 2: //intro
			switch(k.key) {
				case 'Backspace':
					introCancel();
					break;
			}
			break;
		case 3:
			gameMenu.keyhandle(k);
			break;

		case 4:
			speedsControl.keyhandle(k);
			break;
			
		case 5:
			groupSortManager.keyhandle(k);
			break;
	}
}

function localupdatenavbar() {
	if(disableControls) {
		outputNavbar();
	} else {
		switch(curpage) {
			case 0: //main
			case 1: //diff
				outputNavbar('','select','menu');
				break;
			case 2: //intro
				outputNavbar();
				break;
			case 3: //menu
				outputNavbar(gameMenu.navbar);
				break;
			case 4: //speed
				outputNavbar(speedsControl.navbar);
				break;
		}
	}
}