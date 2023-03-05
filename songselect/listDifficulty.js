//difficulty selection
var difficultyListPageN;
var difficultyListMenu = (new Menu(eid('difficulty-list')));
var difficultyScrollers = [];

function selectDifficulty() {
	//prepeare data
	var urlprms = (new URLSearchParams()),
	songToPlay = songList[lastSongSelected],
	stpPathParts = parseFilePath(actEl().dataset.filePath);
	
	urlprms.append('fileName', stpPathParts.filename);
	urlprms.append('folder', stpPathParts.directory);
	urlprms.append('fileType', songToPlay.fileType);
	urlprms.append('songSource', songToPlay.source);
	urlprms.append('songId', actEl().dataset.id);
	
	switch(songToPlay.fileType) {
		case 'tja':
			urlprms.append(
				'targetDifficulty',
				actEl().dataset.target
			);
			break;
	}
	
	//data for intro sequence
	if(getSettingValue('show-difficulty-on-intro') === 1) {
		eid('intro-slider-difficulty').innerHTML = '';
		eid('intro-slider-difficulty').appendChild(createDifficultyHTMLElement(
			parseFloat(actEl().dataset.difficultyLevel),
			parseInt(actEl().dataset.difficultySort)
		));
	} else {
		eid('intro-slider-difficulty-container').classList.add('hidden');
	}
	eid('intro-slider-title-text').textContent = songToPlay.title;
	eid('intro-slider-artist').textContent = songToPlay.artist;
	
	playIntro('/game/index.html#' + urlprms.toString());
}

difficultyListPageN = (function(){
	function keyhandle(k){
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
				curpage = songListPageN;
				if(sortMethodChangedPending) {
					sortMethodChanged();
				}
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