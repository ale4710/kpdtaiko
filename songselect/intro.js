var playIntro = (function(){
	var fhandler = new PreviousFocusHandler();
	var introTO;
	
	var thisPage = addPage(
		(function(k){ //keyhandler
			switch(k.key) {
				case 'Backspace':
					introCancel();
					break;
			}
		}),
		emptyfn
	);
	
	function introCancel() {
		clearTimeout(introTO);
		document.body.classList.remove('intro');
		
		fhandler.refocus();
		fhandler.loadpage();
		fhandler.clear();
	}
	
	return function playIntro(url) {
		fhandler.save();
		document.body.classList.add('intro', 'intro-first-played');
		curpage = thisPage;
		introTO = setTimeout(function(){
			location = url;
		}, 1500);
	}
})();