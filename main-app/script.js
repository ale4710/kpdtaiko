var f = document.getElementById('iframe');

function resizeFrame() {
	f.width = window.innerWidth;
	f.height = window.innerHeight;
}
window.addEventListener('resize', resizeFrame);
window.addEventListener('load', resizeFrame);

function hideFrame() {f.classList.add('hidden');}
function showFrame() {f.classList.remove('hidden');}