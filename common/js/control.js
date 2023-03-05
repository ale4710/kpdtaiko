var allowBack = false;
var disableControls = true;
var preventNavDefault = true;
var curpage;
window.addEventListener('keydown', globalKeyHandler); 

var keyFns = [];
var navbarFns = [];
function addPage(
	keyFn = emptyfn,
	navbarFn = emptyfn
) {
	let n = keyFns.length;
	keyFns.push(keyFn);
	navbarFns.push(navbarFn);
	return n;
}

function globalKeyHandler(k) {
    if(
        (preventNavDefault && keyisnav(k)) ||
        (k.key === 'Backspace' && !allowBack)
    ) {
        k.preventDefault();
    }

    if(disableControls) {return;}
	(keyFns[curpage] || emptyfn)(k);
    updatenavbar();
}

function updatenavbar() {
	outputNavbar(
		(navbarFns[curpage] || emptyfn)()
	);
}