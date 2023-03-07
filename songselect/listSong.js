//main song list
var songPageListN;
var songSelectMenu = (new Menu(eid('song-select-list')));
var lastSongListSelected = 0;

var sortMethodChangedPending = false;
window.addEventListener('sortmethodchanged', ()=>{
	if(curpage === songListPageN) {
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

var userEnabledSmoothScrolling = (getSettingValue('animate-song-select') === 1);
function navigateSongList(n,abs,noUpdateSongDisplay,smooth) {
	smooth = (smooth && userEnabledSmoothScrolling);
	lastSongListSelected = songSelectMenu.navigate(n, abs);
	lastSongSelected = parseInt(
		songSelectMenu.getChildren()[lastSongListSelected].dataset.id || 
		0
	);
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

function selectRandomSongInSongList() {
	let songListLength = songSelectMenu.getChildren().length;
	
	let randomSelected = lastSongListSelected + 1 + Math.floor((songListLength - 2) * Math.random());
	if(randomSelected >= songListLength) {
		randomSelected -= songListLength;
	}
	
	navigateSongList(
		randomSelected,
		true,
		false,
		false
	);
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
			diffEl.classList.add(
				'difficulty', 
				makeDifficultyClassName(diff.difficultySort)
			);

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
			diffEl.dataset.difficultyLevel = diff.difficultyLevel;
			diffEl.dataset.difficultySort = diff.difficultySort;
			diffEl.dataset.id = diff.id;
		});
		
		curpage = difficultyListPageN;
		toggleThrobber(false);
		updatenavbar();
		eid('difficulty-list').classList.remove('hidden');
		difficultyListMenu.navigate(0, true);

		var ce = actEl().parentElement,
		scrollTop = Math.min(
			actEl().offsetTop,
			(ce.scrollHeight / 2) - (ce.offsetHeight / 2)
		);
		ce.scrollTop = scrollTop;
	});
}

var songSelectSelectRandomAction;
if(getSettingValue('song-list-animate-random') === 1) {
	addGlobalReference(0, 'randomSelectAnimation').then(function(){
		songSelectSelectRandomAction = playRandomSelectSongAnimation;
	});
} else {
	songSelectSelectRandomAction = selectRandomSongInSongList;
}

songListPageN = (function(){
	function keyhandle(k) {
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
			case '3':
				(songSelectSelectRandomAction || emptyfn)();
				//it only works when the script is loaded
				break;
			case 'Backspace':
				titleScreen.show();
				break;
			default:
				songSelectListCommonK(k);
				break;
		}
	}
	
	return addPage(
		keyhandle,
		(function(){return navbarsm})
	);
})();