var appStartUrl = '/settings/index.html#bootup';

var f = document.createElement('iframe');
f.setAttribute('allowtransparency', 'true');

function resizeFrame() {
	f.width = window.innerWidth;
	f.height = window.innerHeight;
}
window.addEventListener('resize', resizeFrame);
window.addEventListener('load', ()=>{
	document.body.appendChild(f);
	f.src = appStartUrl;
	appStartUrl = undefined;
	resizeFrame();
});

function hideFrame() {document.body.classList.add('loading');}
function showFrame() {document.body.classList.remove('loading');}