//intro sequence
var introTO = null;
function playIntro(fn) {
    if(typeof(fn) !== 'function') {fn = emptyfn}
    document.body.classList.add('intro');
    introTO = setTimeout(fn, 1500);
    curpage = 2;
}
function introCancel() {
    clearTimeout(introTO);
    location.reload();
}