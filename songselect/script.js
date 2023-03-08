var songList;

var audio = (new Audio());
var audioStartPoint = 0;
var audioAvailable = false;

var lastSongSelected;

var songsAvailable = true;

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
	let fp;
	//we request the song list, and then,..
	var cachedSongList = sessionStorage.getItem('songlist');
	//var cachedSongList = null;
	if(cachedSongList) {
		songList = JSON.parse(cachedSongList);
		fp = Promise.resolve();
	} else {
		fp = getSongList().then((songListlv)=>{
			localStorage.setItem('do-not-rescan', '1');
			songList = songListlv;
			sessionStorage.setItem('songlist', JSON.stringify(songList));
		}).catch((err)=>{
			songsAvailable = false;
			
			let message = 'An unknown error occured while trying to retrieve the song list.';
			
			localStorage.removeItem('do-not-rescan');
			
			if(err === 'empty') {
				message = 'No songs were found in the song directory. ';
				if(deviceStorage) {
					message += `The song directory is located at ${formFullgameDirectory()}. Please check the directory.`;
				} else {
					message += 'Since you appear to be debugging on a PC, please make sure there is a "songlist.json" file in the "/songs/" folder, with an array pointing to the part to each song file.';
				}
			}
			
			eid('error-screen-text').textContent = message;
		});
	}
	
	fp.finally(()=>{
		var ls = sessionStorage.getItem('songSelectLastSelected');
		if(ls !== null) {ls = parseInt(ls);}
		
		let rplPromise = (
			songsAvailable?
			reprintList(ls) :
			Promise.resolve()
		);

		rplPromise.then((focus)=>{
			toggleThrobber(false);
			eid('song-select-list').classList.remove('hidden');
			
			if(location.hash === '#titlescreen') {
				if(songsAvailable) {selectRandomSongInSongList();}
				titleScreen.show();
			} else {
				(focus || emptyfn)();
				gotoSongList();
			}
			updatenavbar();

			if(getDirectoryChangedStatus()) {
				showDirectoryChangedMessage();
			}
		});
	});
});

function toggleThrobber(show) {
	eid('selection-list-throbber').classList.toggle('hidden');
	disableControls = !!show;
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

var navbarsm = ['back','select','menu'];

outputNavbar();