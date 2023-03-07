var gameMenu = (function() {
    var thisPage;
	
	var curMenu = 0;

    //main menu
    var gameMenuMenu = new OptionsMenu('Game Menu');
    [
        {l: 'Game Speed Options', id: 'speedopt'},
        {l: 'Volume Adjustment', id: 'volume'},
		{l: 'Sort By...', id: 'sortmenu'},
		{l: 'Group By...', id: 'groupmenu'},
        {l: 'Rescan Library', id: 'librescan'}
    ].forEach((opt)=>{gameMenuMenu.addOption(opt.l,opt.id);});
    //key handler is generic.

    function gameMenuMenuK(k) {
        switch(k.key) {
            case 'ArrowUp':
                var u = -1;
            case 'ArrowDown':
                gameMenuMenu.navigate(u || 1);
                break;
            case 'Enter':
                switch(actEl().dataset.id) {
                    case 'speedopt':
                        hide();
                        speedsControl.show();
                        break;
                    case 'volume':
                        hide();
                        volumeControl.show();
                        break;
                    case 'librescan':
                        location = '/songscan/index.html';
                        disableControls = true;
                        break;
					case 'sortmenu':
						hide();
						groupSortManager.showMenu('sort');
						break;
					case 'groupmenu':
						hide();
						groupSortManager.showMenu('group');
						break;
                }
                break;
            case 'Backspace':
            case 'SoftLeft':
                hide();
                break;
        }
    }

    function keyhandle(k) {
        switch(curMenu) {
            case 0: //game menu
                gameMenuMenuK(k);
                break;
        }
    }

    var fochandler = (new PreviousFocusHandler());
    function show() {
        fochandler.save();
        curpage = thisPage;
        curMenu = 0;
        gameMenuMenu.menuViewToggle(true,true);
    }

    function hide() {
        gameMenuMenu.menuViewToggle(false);
        fochandler.refocus();
        fochandler.loadpage();
    }
	
	thisPage = addPage(
		keyhandle,
		(function(){return ['back','select']})
	);

    return {
        menu: gameMenuMenu,
        show: show,
        hide: hide
    }
})();