var songList;

var audio = (new Audio());
var audioStartPoint = 0;
var audioAvailable = false;

var lastSongSelected;

var songsAvailable = true;

var randomizeSongOnTitleScreen = (getSettingValue('title-screen-random-song') === 1);
audio.addEventListener('ended',()=>{
	//randomize song on title screen
	if(
		randomizeSongOnTitleScreen &&
		curpage === titleScreen.page
	) {
		selectRandomSongInSongList();
	} else {
		audio.currentTime = audioStartPoint;
		audio.play();
	}
	
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

waitDocumentLoaded().then(()=>{
	let fp;
	//we request the song list, and then,..
	let cachedSongList = sessionStorage.getItem('songlist');
	//let cachedSongList = null;
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
				message = '<p>No songs were found in the song directory.<p>'; //yes, a *open* <p> tag
				if(deviceStorage) {
					//message += `The song directory is located at ${formFullgameDirectory()}. Please check the directory.<p>See the "setup" section of the manual for more details.`;
					message += 'See the "setup" section of the manual for more details.';
				} else {
					message += 'Since you appear to be debugging on a PC, please make sure there is a "songlist.json" file in the "/debugsongs/" folder, with an array pointing to the part to each song file.';
				}
			}
			
			eid('error-screen-text').innerHTML = message;
		});
	}
	
	fp.finally(()=>{
		var ls = sessionStorage.getItem('songSelectLastSelected');
		if(ls !== null) {ls = parseInt(ls);}
		//console.log(ls);
		
		let rplPromise = (
			songsAvailable?
			reprintList(ls) :
			Promise.resolve()
		);

		rplPromise.then((focus)=>{
			toggleThrobber(false);
			eid('song-select-list').classList.remove('hidden');
			
			let params = new URLSearchParams(location.hash.substr(1));
			if(
				(params.get('select-random') === '1') &&
				songsAvailable
			) {
				selectRandomSongInSongList();
			} else {
				(focus || emptyfn)();
			}
			
			switch(params.get('goto')) {
				case 'title': 
					titleScreen.show();
					break;
				case 'songlist':
					gotoSongList();
					break;
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