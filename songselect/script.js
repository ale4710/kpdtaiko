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
			curpage = songListPageN;
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
			localStorage.setItem('do-not-rescan', '1');
			songList = songListlv;
			sessionStorage.setItem('songlist', JSON.stringify(songList));
			showList();
		}).catch((err)=>{
			let title = 'Error Occured';
			let message = 'An unknown error occured while trying to retrieve the song list.';
			
			localStorage.removeItem('do-not-rescan');
			
			if(err === 'empty') {
				title = 'No Songs';
				message = 'No songs were found in the song directory. ';
				if(deviceStorage) {
					message += `The song directory is located at ${formFullgameDirectory()}. Please check the directory.`;
				} else {
					message += 'Since you appear to be debugging on a PC, please make sure there is a "songlist.json" file in the "/songs/" folder, with an array pointing to the part to each song file.';
				}
			}
			
			let wc = ()=>{window.close()};
			messageBox.create(
				title,
				message + '\n\nThe program will now terminate.',
				{
					center: messageBox.makeOpt(wc, 'ok'),
					back:  messageBox.makeOpt(wc)
				}
			);
		});
	}
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

var navbarsm = ['','select','menu'];

outputNavbar();