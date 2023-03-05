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
	
	//difficulty summary
	let diffSummaryContainer = eid('song-info-difficulty-summary');
	while(diffSummaryContainer.children.length !== 0) {
		diffSummaryContainer.children[0].remove();
	}
	let localDifficultySummary = [].concat(curSong.difficultySummary);
	localDifficultySummary.sort((a,b)=>{return a.sort - b.sort});
	localDifficultySummary.forEach((dentry)=>{
		diffSummaryContainer.appendChild(
			createDifficultyHTMLElement(
				dentry.difficulty,
				dentry.sort
			)
		);
	});
	
	var folder = parseFilePath(curSong.filePath).directory;

	//media
	//  image
	var img = eid('song-info-img'),
	imgcont = eid('song-info-img-container');
	if(img) {
		URL.revokeObjectURL(img.src);
		img.remove();
		
		eid('song-background').remove();
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
				var url = URL.createObjectURL(iblob);
				
				hideImg = false;
				var nimg = document.createElement('img');
				nimg.id = 'song-info-img';
				nimg.classList.add('fill');
				nimg.src = url;
				imgcont.appendChild(nimg);
				
				var nbgimg = document.createElement('img');
				nbgimg.src = url;
				nbgimg.id = 'song-background';
				nbgimg.classList.add('center');
				eid('song-background-container').appendChild(nbgimg);
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