var appStartUrl = '/settings/index.html#bootup';

var f = document.createElement('iframe');
f.setAttribute('allowtransparency', 'true');

function resizeFrame() {
	f.width = window.innerWidth;
	f.height = window.innerHeight;
}
function preventBackKey(k) {
	if(k.key === 'Backspace') {
		k.preventDefault();
	}
}

window.addEventListener('resize', resizeFrame);
window.addEventListener('load', ()=>{
	document.body.appendChild(f);
	f.src = appStartUrl;
	appStartUrl = undefined;
	resizeFrame();
});

function hideFrame() {
	f.blur();
	document.body.classList.add('loading');
	window.addEventListener('keydown', preventBackKey);
}
function showFrame() {
	document.body.classList.remove('loading');
	f.focus();
	window.removeEventListener('keydown', preventBackKey);
}