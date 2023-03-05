//intro sequence
var introTO = null;
var introElFocused = null;
var introOrigPage = null;

function playIntro(url) {
	introElFocused = actEl();
	introOrigPage = curpage;
	
    document.body.classList.add('intro');
    curpage = 2;
	introTO = setTimeout(function(){
		location = url;
	}, 1500);
}
function introCancel() {
    clearTimeout(introTO);
    document.body.classList.remove('intro');
	
	introElFocused.focus();
	introElFocused = null;
	
	curpage = introOrigPage;
	introOrigPage = null;
}