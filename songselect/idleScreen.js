var idleScreen = (function() {
    let thisPage;
	
	const CONTAINER = eid('idle-screen');
	
	function update() {
		if(curpage === thisPage) {
			let curSong = songList[lastSongSelected];
			eid('idle-screen-info-title').textContent = curSong.title;
			
			eid('idle-screen-info-artist').classList.toggle(
				'hidden',
				!(('artist' in curSong) && (curSong.artist))
			);
			eid('idle-screen-info-artist').textContent = curSong.artist;
			
			eid('idle-screen-info-song-progress').value = 0;
		}
	}
	window.addEventListener('songmedialoaded', update);
	
	function audioUpdate() {
		eid('idle-screen-info-song-progress').value = audio.currentTime / audio.duration;
	};
	
	function show() {
		document.body.classList.add('idle-screen-showing');
		CONTAINER.classList.remove('hidden');
		titleScreen.hide();
		curpage = thisPage;
		update();
		audio.addEventListener('timeupdate', audioUpdate);
	}
	
	function hide() {
		document.body.classList.remove('idle-screen-showing');
		CONTAINER.classList.add('hidden');
		titleScreen.show();
		audio.removeEventListener('timeupdate', audioUpdate);
	}

    function keyhandle(k) {
        switch(k.key) {
			case 'EndCall':
			case 'VolumeDown':
			case 'VolumeUp':
				break;
			default: 
				hide();
				break;
        }
    }
	
	thisPage = addPage(
		keyhandle,
		emptyfn
	);

    return {
		page: thisPage,
        show: show
    }
})();