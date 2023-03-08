var titleScreen = (function() {
    let thisPage;
	
	const CONTAINER = eid('title-screen-container');
	const CONTENT_CONTAINER = eid('title-screen');
	
    let menu = new Menu(CONTENT_CONTAINER);
    [
        {l: 'Play', id: 'play'},
        {l: 'Settings', id: 'settings'},
		{l: 'Exit', id: 'exit'}
    ].forEach((opt)=>{menu.addOption(opt.l,opt.id);});
	
	function exitgame() {
		window.close();
	}

    function keyhandle(k) {
        switch(k.key) {
            case 'ArrowUp':
                var u = -1;
            case 'ArrowDown':
                menu.navigate(u || 1);
                break;
            case 'Enter':
                switch(actEl().dataset.id) {
                    case 'play':
						CONTAINER.classList.add('hidden');
						eid('main-screen').classList.remove('hidden');
						
						curpage = songListPageN;
                        
						scrollers.resetAll();
						navigateSongList(
							lastSongListSelected, 
							false, 
							true
						);
                        break;
                    case 'settings':
                        location = '/settings/index.html';
						disableControls = true;
                        break;
                    case 'exit':
                        exitgame();
                        break;
                }
                break;
            case 'Backspace':
                exitgame();
                break;
        }
    }
	
	thisPage = addPage(
		keyhandle,
		(function(){return ['','select']})
	);

    return {
        show: function(){
			curpage = thisPage;
			CONTAINER.classList.remove('hidden');
			eid('main-screen').classList.add('hidden');
			menu.navigate(0, true);
		}
    }
})();