var introSlider = new IntroSlider(eid('screen'));
introSlider.element.id = 'intro-slider';
introSlider.toggleShow(true);

var playIntro = (function(){
	var fhandler = new PreviousFocusHandler();
	var introTO;
	var introCancelable = true;
	
	var decideSound = new Audio('sound/decide.ogg');
	function updateSoundVolumes(){
		let vall = volumeControl.getVolume();
		decideSound.volume = (vall.sfx / vall.max);
	}
	updateSoundVolumes();
	window.addEventListener('volumechange', updateSoundVolumes);
	
	var thisPage = addPage(
		(function(k){ //keyhandler
			switch(k.key) {
				case 'Backspace':
					if(introCancelable) {
						introCancel();
					}
					break;
			}
		}),
		emptyfn
	);
	
	function introCancel() {
		clearTimeout(introTO);
		document.body.classList.remove('intro');
		
		decideSound.pause();
		
		fhandler.refocus();
		fhandler.loadpage();
		fhandler.clear();
	}
	
	return function playIntro(url) {
		fhandler.save();
		document.body.classList.add('intro', 'intro-first-played');
		curpage = thisPage;
		
		decideSound.currentTime = 0;
		decideSound.play();
		
		introTO = setTimeout(function(){
			introCancelable = false;
			window.parent.globalIntroSlider.toggleShow(true);
			location = url;
		}, 1500);
	}
})();