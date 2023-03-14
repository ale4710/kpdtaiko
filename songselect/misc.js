//collator (for sorting)
var sorter = (function(){
	let collator = new Intl.Collator('JA-jp', {
		usage: 'sort',
		//sensitivity: 'variant', //is default
		numeric: true
	});
	
	function compare(a,b,reverse) {
		//a = a.toLowerCase();
		//b = b.toLowerCase();
		return collator.compare(a,b) * (1 - (!!reverse * 2));
	}
	
	return {
		compare: compare,
		collator: collator
	};
})();

//directory changed
var directoryChangedMessageShown = false;
function showDirectoryChangedMessage() {
    directoryChangedMessageShown = true;
    messageBox.create(
        'Song directory modified.',
        'Something in the song directory has changed. Would you like to rescan?',
        {
            right: messageBox.makeOpt(()=>{location = '/songscan/index.html'}, 'yes'),
            left: messageBox.makeOpt(()=>{
                resetDirectoryChangedStatus();
                messageBox.defaultCb();
            }, 'no')
            //back is defaultcallback
        }
    );
}

window.addEventListener('directorychanged',()=>{
    if(introTO === null) {
        showDirectoryChangedMessage();
    }
});

//autoplay toggle
var autoplayLsKey = 'autoplay-enabled';
(()=>{
	//init
	var a = localStorage.getItem(autoplayLsKey);
	if(a === null) {
		localStorage.setItem(autoplayLsKey, false);
		modsDisplay.updateDisplay('auto', false);
	}
})();
function toggleAuto() {
	var autoEn = localStorage.getItem(autoplayLsKey);
	localStorage.setItem(
		autoplayLsKey,
		!JSON.parse(autoEn)
	);
	modsDisplay.updateDisplay('auto');
}

//scrolling texts
var scrollers = (function(){
	var s = [];
	
	[
		'song-info-title',
		'song-info-misc',
		'song-info-difficulty-summary'
	].forEach((e)=>{
		s.push(
			new ScrollHandler(
				eid(e),
				{computeMargins: true}
			)
		)
	});
	
	function resetAll() {
		s.forEach((h)=>{
			h.reset();
		});
	}
	
	return {
		handlers: s,
		resetAll: resetAll
	}
})();

//difficulty class name
function makeDifficultyClassName(d) {
	return `difficulty-lv${d}`
}

//make a difficulty element
function createDifficultyHTMLElement(innerText, difficultyLevel) {
	let mainEl = document.createElement('span');
	
	mainEl.classList.add('difficulty-summary-entry');
	if(difficultyLevel !== undefined) {
		mainEl.classList.add(makeDifficultyClassName(difficultyLevel));
	}
	
	if(!innerText) {
		if(typeof(difficultyLevel) === 'number') {
			let dltp = difficultyLevel + 1;
			if(dltp > 5) {
				dltp = '?';
			}
			innerText = 'L' + dltp;
		} else {
			innerText = '?';
		}
	}
	mainEl.textContent = innerText;
	return mainEl;
}