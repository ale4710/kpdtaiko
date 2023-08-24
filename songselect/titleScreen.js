var titleScreen = (function() {
    let thisPage;
	
	const CONTAINER = eid('title-screen-container');
	const CONTENT_CONTAINER = eid('title-screen');
	
    let menu = new Menu(CONTENT_CONTAINER);
    [
        {l: 'Play', id: 'play'},
		{l: 'Import', id: 'import'},
        {l: 'Settings', id: 'settings'},
		{l: 'Manual', id: 'manual'},
		{l: 'Exit', id: 'exit'}
    ].forEach((opt)=>{menu.addOption(opt.l,opt.id);});
	
	function exitgame() {
		window.parent.close();
	}
	
	let idleTimeout;
	function resetIdleTimer() {
		clearIdleTimer();
		idleTimeout = setTimeout(()=>{
			idleScreen.show();
		}, 30000);
	};
	function clearIdleTimer() {
		clearTimeout(idleTimeout);
	};
	
	function show() {
		curpage = thisPage;
		CONTAINER.classList.remove('hidden');
		menu.navigate(0, true);
		resetIdleTimer();
	};
	
	function hide() {
		CONTAINER.classList.add('hidden');
		clearIdleTimer();
	};
	
    function keyhandle(k) {
		resetIdleTimer();
        switch(k.key) {
            case 'ArrowUp':
                var u = -1;
            case 'ArrowDown':
                menu.navigate(u || 1);
                break;
            case 'Enter':
				clearIdleTimer();
                switch(actEl().dataset.id) {
                    case 'play':
						gotoSongList();
						hide();
                        break;
                    case 'settings':
                        location = '/settings/index.html';
						disableControls = true;
                        break;
					case 'import':
						location = '/songimport/index.html';
						disableControls = true;
                        break;
					case 'manual':
						window.open('/manual/index.html');
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
		page: thisPage,
        show: show,
		hide: hide
    }
})();