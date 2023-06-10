window.addEventListener('songmedialoaded', updateSongInfoDisplay);

var audioLoadingTimeout;

var audioStartAtPreviewPoint = (getSettingValue('audio-start-at-preview-point') === 1);

var songInfoDisplayDifficultySummary = new difficultySummary.DifficultySummary(eid('song-info-difficulty-summary-container'));

function updateSongInfoDisplay() {
	console.log('updateSongInfoDisplay');
	
	scrollers.resetAll();
	
	var curSongId = lastSongSelected,
	//var curSongId = parseInt(actEl().dataset.id),
	curSong = songList[curSongId];

	//basic data
	eid('song-info-title').textContent = curSong.title;
	
	//misc data
	var lastc = null;
	[
		{e: 'artist', k: 'artist'},
		{e: 'subtitle', k: 'subtitle'},
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
	songInfoDisplayDifficultySummary.clearDifficulties();
	let localDifficultySummary = [].concat(curSong.difficultySummary);
	localDifficultySummary.sort((a,b)=>{return a.sort - b.sort});
	localDifficultySummary.forEach((dentry)=>{
		songInfoDisplayDifficultySummary.addDifficulty(
			dentry.difficulty,
			dentry.sort
		);
	});
	
	var folder = parseFilePath(curSong.filePath).directory;

	//media
	//  image
	var imgpath = `${folder}/${curSong.image}`;
	var img = eid('song-info-img');
	var imgcont = eid('song-info-img-container');
	var imgIsDifferent = (
		(img && (img.dataset.internalPath !== imgpath)) ||
		!img ||
		!curSong.image
	);
		
	if(
		img &&
		imgIsDifferent
	) {
		URL.revokeObjectURL(img.src);
		img.remove();
		
		eid('song-background').remove();
		/* eid('song-background').addEventListener('animationend', function(ev){
			ev.target.remove();
		});
		eid('song-background').classList.add('song-background-fade-out');
		eid('song-background').id = ''; */
	}
	
	var hideImg = imgIsDifferent;
	if(
		curSong.image &&
		imgIsDifferent &&
		(getSettingValue('show-background') === 1)
	) {
		var iblob = mediaLoader.getAndLoad(
			imgpath,
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
				nimg.dataset.internalPath = imgpath;
				imgcont.appendChild(nimg);
				
				var nbgimg = document.createElement('img');
				nbgimg.src = url;
				nbgimg.id = 'song-background';
				nbgimg.classList.add('center', 'song-background');
				nbgimg.onload = (function(ev){
					ev.target.classList.add('song-background-fade-in');
				});
				eid('song-background-container').appendChild(nbgimg);
				break;
		}
	}
	
	imgcont.classList.toggle('hidden', hideImg);
	
	//  audio
	var audiopath = `${folder}/${curSong.previewFile}`;
	if(audio.dataset.internalPath !== audiopath) {
		URL.revokeObjectURL(audio.src);
		audio.dataset.internalPath = '';
		audio.pause();
		clearTimeout(audioLoadingTimeout);
	}
	
	function playaudio(blob) {
		audio.src = URL.createObjectURL(blob);
		if(audioStartAtPreviewPoint) {
			audioStartPoint = (curSong.previewTime || 0) / 1000;
		} else {
			audioStartPoint = 0;
		}
		audio.currentTime = audioStartPoint;
		audio.dataset.internalPath = audiopath;
		//this is just incase it takes a long time for the list to load,
		//and the user minimizes the application or turns off their device
		if(document.visibilityState === 'visible') {
			audio.play();
		}
	}
	
	if(curSong.previewFile) {
		var ablob = mediaLoader.getOnly(
			audiopath,
			curSong.source
		);
		if(ablob) {
			audioAvailable = true;
			playaudio(ablob);
		} else {
			audioAvailable = false;
			audioLoadingTimeout = setTimeout(
				function(){
					ablob = mediaLoader.getAndLoad(
						audiopath,
						curSong.source
					);
					audioAvailable = (ablob instanceof Blob);
					if(audioAvailable) {playaudio(ablob);}
				},
				500
			);
		}
	}
}