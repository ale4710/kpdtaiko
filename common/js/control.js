var allowBack = false,
disableControls = true, 
preventNavDefault = true, 
curpage = 0;
window.addEventListener('keydown', globalKeyHandler); 

function globalKeyHandler(k) {
    if(
        (preventNavDefault && keyisnav(k)) ||
        (k.key === 'Backspace' && !allowBack)
    ) {
        k.preventDefault();
    }

    if(disableControls) {return;}
    switch(curpage) {
        case volumeControl.page: volumeControl.keyHandle(k); break;
        case 95: messageBox.keyHandler(k); break;
        default: keyHandler(k); break;
    }
    updatenavbar();
}

function updatenavbar() {
    switch(curpage) {
        case volumeControl.page: outputNavbar(volumeControl.navbar); break;
        case 95: messageBox.updateNavbar(); break;
        default: localupdatenavbar(); break;
    }
    //console.log(`updatenavbar: curpage was ${curpage} at this time.`);
    //console.log(updatenavbar.caller);
}