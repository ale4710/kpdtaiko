var playRandomSelectSongAnimation = (function(){
	let thisPage;
	let animationStartedTime;
	let lastSelectedSong;
	const ANIMATION_TIME = 1000;
	const HTML_CLASSNAME = 'random-select-animation-playing';
	const UNDERLAY_ELEMENT = eid('song-select-select-underlay');
	
	let rouletteSound = new Audio('sound/roulette.ogg');
	let resultSound = new Audio('sound/ding.ogg');
	
	function updateSoundVolumes(){
		let vall = volumeControl.getVolume();
		let vol = (vall.sfx / vall.max);
		vall = undefined;
		
		[
			rouletteSound,
			resultSound
		].forEach((v)=>{
			v.volume = vol;
		});
	}
	updateSoundVolumes();
	window.addEventListener('volumechange', updateSoundVolumes);
	
	let animateReferenceNumber;
	
	function finish(manualFinished) {
		clearTimeout(animateReferenceNumber);
		UNDERLAY_ELEMENT.textContent = '';
		curpage = songListPageN;
		document.body.classList.remove(HTML_CLASSNAME);
		
		rouletteSound.pause();
		
		if(manualFinished !== true) {
			resultSound.currentTime = 0;
			resultSound.play();
		}
		
		updateAudioVolume();
		audio.pause();
		
		selectRandomSongInSongList();
		updatenavbar();
	}
	
	function animate() {
		if(performance.now() - animationStartedTime <= ANIMATION_TIME) {
			lastSelectedSong += 1 + Math.floor(Math.random() * (songList.length - 2));
			if(lastSelectedSong >= songList.length) {
				lastSelectedSong -= songList.length;
			}
			UNDERLAY_ELEMENT.textContent = songList[lastSelectedSong].title || '???';
			//requestAnimationFrame(animate);
			animateReferenceNumber = setTimeout(
				animate,
				75
			);
		} else {
			finish();
		}
	}
	
	thisPage = addPage(
		(function randSelAnimK() {
			//any key pressed
			finish(true);
		}),
		emptyfn
	);
	
	return function(){
		animationStartedTime = performance.now();
		lastSelectedSong = (
			(lastSongListSelected === songList.length - 1)? 
			0 : 
			lastSongListSelected + 1
		)
		audio.volume *= 0.1;
		curpage = thisPage;
		document.body.classList.add(HTML_CLASSNAME);
		
		rouletteSound.currentTime = 0;
		rouletteSound.play();
		resultSound.pause();
		animate();
	}
})();