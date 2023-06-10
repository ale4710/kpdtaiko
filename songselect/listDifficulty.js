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
	{
		let showDifficulty = (getSettingValue('show-difficulty-on-intro') === 1);
		let title = songToPlay.title;
		let subtitle = (songToPlay.artist || songToPlay.subtitle || null);
		let dlevel = parseFloat(actEl().dataset.difficultyLevel);
		let dsort = parseInt(actEl().dataset.difficultySort);
		
		[
			introSlider,
			window.parent.globalIntroSlider
		].forEach((is)=>{
			is.toggleDifficultyShow(showDifficulty);
			is.updateData(
				title,
				subtitle,
				dlevel,
				dsort
			);
		});
	}
	
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
			case 'SoftLeft':
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