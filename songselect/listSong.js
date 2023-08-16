//main song list
var songPageListN;
var songSelectMenu = (new Menu(eid('song-select-list')));
var lastSongListSelected = 0;
var songListGroupLocations = [];

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
		let sortMethod = groupSortManager.getGSmethod('sort');
		let groupMethod = groupSortManager.getGSmethod('group');
		printList(
			sortMethod.p,
			groupMethod.p,
			false,
			refocus
		).then((refocusIndex)=>{
			//update indicator
			let updated = 0;
			{
				let sortEl = eid('group-sort-indicator-sort');
				sortEl.classList.toggle('hidden', (sortMethod.k === 'title'));
				if(!sortEl.classList.contains('hidden')) {
					updated++;
					sortEl.textContent = sortMethod.l;
				}
			}
			{
				let groupEl = eid('group-sort-indicator-group');
				groupEl.classList.toggle('hidden', (groupMethod.k === 'nogroup'));
				if(!groupEl.classList.contains('hidden')) {
					updated++;
					groupEl.textContent = groupMethod.l;
				}
			}
			eid('group-sort-indicator').classList.toggle('hidden', (updated === 0));
			
			//resolve...
			r(function(noUpdateDataDisplay){
				navigateSongList(refocusIndex, true, !!noUpdateDataDisplay);
			});
		});
	}));
}

function printList(sort, group, sortReverse, refocusId) {
	console.log(sort,group);
	
	sortReverse = !!sortReverse;
	
	if(typeof(refocusId) !== 'number') {
		refocusId = undefined;
	}

	songSelectMenu.clearMenu();
	//and clear the rest of the children
	clearChildrenInElement(
		songSelectMenu.menu.children
	);
	
	return (new Promise((resolve)=>{
		var ids = [...Array(songList.length).keys()];
		var groupedSongs = {};
		var noGroupSymbol = Symbol();
		
		songListGroupLocations.length = 0;
		
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
						case 'genre':
							groupKey = GENRE_LABEL[ts.genre] || null;
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
				return sorter.compare(a, b, sortReverse);
			});
			
			if(noGroupSymbol in groupedSongs) {
				groupKeysSorted.unshift(noGroupSymbol);
			}
		}
		
		//console.log(groupKeysSorted);
		
		var refocusReturnVal;
		
		//print
		groupKeysSorted.forEach((gid)=>{
			//init
			var toPrint;
			if(!ids) {
				//the song ids are grouped
				toPrint = groupedSongs[gid];
				
				var sepLabel = gid;
				if(gid === noGroupSymbol) {
					sepLabel = '*Ungrouped*';
				}
				songSelectMenu.addSeperator(sepLabel);
			} else {
				//the song ids are ungrouped
				toPrint = ids;
			}

			toPrint.sort((a,b)=>{
				var pairCase = 0;
				switch(sort) {
					default: 
						//sort = 'title';
					case 'title':
						pairCase = sorter.compare(
							songList[a].title,
							songList[b].title,
							sortReverse
						);
						break;
				}
				
				return pairCase;
			});
			
			//group stuff
			var groupTempId = songListGroupLocations.length;
			var groupLocation;
			
			//print songs for real
			toPrint.forEach((song, i)=>{
				var o = songSelectMenu.addOption(
					songList[song].title,
					song
				);
				
				if(!ids) {
					//songs are grouped
					o.dataset.group = groupTempId;
					//is it the first? if so...
					if(i === 0) {groupLocation = o.tabIndex;}
				}
				
				if(refocusId === song) {
					console.log('okay refocus to', song, gid);
					refocusReturnVal = o.tabIndex;
				} else if(refocusId === undefined) {
					refocusReturnVal = 0;
				}
			});
			
			//group stuff
			if(typeof(groupLocation) === 'number') {
				songListGroupLocations.push(groupLocation);
			}
		});

		sessionStorage.setItem('songSelectSortMode', sort);
		resolve(refocusReturnVal);
	}));
}

//song list scroll animator
var scrollSongList = (function(){
	let targetScrollTop = 0;
	let lastTime;
	const speed = 300;
	let direction;
	let element = songSelectMenu.menu;
	let animationReference;
	
	function resetAnimate() {
		targetScrollTop = undefined;
		direction = undefined;
		lastTime = undefined;
		cancelAnimationFrame(animationReference);
		animationReference = undefined;
	}
	
	function animate() {
		let now = performance.now();
		let dt = now - lastTime;
		let change = speed * (dt / 1000) * direction;
		if(direction < 0) {
			change = Math.floor(change);
		} else {
			change = Math.ceil(change);
		}
		let newScrollTop = element.scrollTop + change;
		//let newScrollTop = element.scrollTop + (direction * 0.25);
		
		if(
			(direction < 0 && newScrollTop <= targetScrollTop) ||
			(direction > 0 && newScrollTop >= targetScrollTop)
		) {
			element.scrollTop = targetScrollTop;
			resetAnimate();
		} else {
			element.scrollTop = newScrollTop;
			lastTime = now;
			animationReference = requestAnimationFrame(animate);
		}
	}
	
	return function(tst, immediate) {
		resetAnimate();
		if(immediate) {
			element.scrollTop = tst;
		} else {
			lastTime = performance.now();
			targetScrollTop = tst;
			direction = (
				(tst - element.scrollTop < 0)?
				-1 : 1
			);
			requestAnimationFrame(animate);
		}
	}
})();

var userEnabledSmoothScrolling = (getSettingValue('animate-song-select') === 1);
function navigateSongList(
	n,
	abs,
	noUpdateSongDisplay,
	smooth
) {
	smooth = (smooth && userEnabledSmoothScrolling);
	lastSongListSelected = songSelectMenu.navigate(n, abs);
	lastSongSelected = parseInt(
		songSelectMenu.getChildren()[lastSongListSelected].dataset.id || 
		0
	);
	sessionStorage.setItem('songSelectLastSelected', lastSongSelected);
	
	/* console.log(
		n,
		lastSongListSelected
	); */

	if(!noUpdateSongDisplay) {
		updateSongInfoDisplay();
	}

	//centering
	var ce = actEl();
	var cep = ce.parentElement;
	var st = (ce.offsetTop - (cep.offsetHeight / 2)) + (ce.offsetHeight / 2);
	
	scrollSongList(st, !smooth);
	
	/* cep.scroll({
		top: st,
		behavior: !!smooth? 'smooth' : 'instant'
	}); */
	
	//cep.scrollTop = st;
	
	//console.log(actEl());
}

function navigateSongListGroup(nav) {
	if(songListGroupLocations.length > 1) {
		let newGroupTempId = navigatelist(
			//current song
			parseInt(
				songSelectMenu.getChildren()[lastSongListSelected].dataset.group
			),
			//list
			songListGroupLocations,
			//move
			nav
		);
		
		navigateSongList(
			songListGroupLocations[newGroupTempId],
			true,
			false,
			false
		);
	}
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
				difficultySummary.makeDifficultyClassName(diff.difficultySort)
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

function gotoSongList() {
	curpage = songListPageN;
	if(songsAvailable) {
		eid('main-screen').classList.remove('hidden');
		scrollers.resetAll();
		navigateSongList(
			lastSongListSelected, 
			true,
			true
		);
	} else {
		eid('error-screen').classList.remove('hidden');
	}
}
function exitSongList() {
	eid('main-screen').classList.add('hidden');
	eid('error-screen').classList.add('hidden');
	titleScreen.show();
}

songListPageN = (function(){
	function keyhandle(k) {
		if(songsAvailable) {
			switch(k.key) {
				//navigate song list
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
					
				//jump groups
				case 'ArrowLeft':
					var p = -1;
				case 'ArrowRight':
					navigateSongListGroup(
						p || 1
					);
					break;
					
				//other stuff
				case 'Enter':
					selectSong();
					break;
				case '3':
					(songSelectSelectRandomAction || emptyfn)();
					//it only works when the script is loaded
					break;
				case 'Backspace':
				case 'SoftLeft':
					exitSongList();
					break;
				default:
					songSelectListCommonK(k);
					break;
			}
		} else if(
			(k.key === 'Backspace') ||
			(k.key === 'SoftLeft')
		) {
			exitSongList();
		}
	};
	
	function nb() {
		if(songsAvailable) {
			return navbarsm;
		} else {
			return ['back'];
		}
	};
	
	return addPage(
		keyhandle,
		nb
	);
})();
