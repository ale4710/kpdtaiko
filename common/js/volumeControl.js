var volumeControl = (function(){
    var thisPage = 92, volmax = 20;

    var fh = new PreviousFocusHandler();
    function formlsname(af){return `volume-${af}`;}

    var volumeIds = {
        m: 'music',
        s: 'sfx'
    };
    function getVolume() {
        return {
            music: parseFloat(localStorage.getItem(formlsname(volumeIds.m))),
            sfx: parseFloat(localStorage.getItem(formlsname(volumeIds.s))),
            max: volmax
        };
    }

    var volmenu = (new OptionsMenuMultiSliders('Volume'));
    (()=>{
        var voldef = {
            [volumeIds.m]: 15,
            [volumeIds.s]: 20
        },
        volsav = getVolume();

        [
            ['Music Volume', volumeIds.m],
            ['Sounds Volume', volumeIds.s]
        ].forEach((v)=>{
            var sv = volsav[v[1]];

            if(isNaN(sv)) {
                localStorage.setItem(
                    formlsname(v[1]), 
                    voldef[v[1]]
                );
                sv = null;
            }

            volmenu.addOption(
                v[0], v[1],
                0, volmax, 1,
                sv
            );
        });
    })();

    var volumeChangeEvent = (new Event('volumechange'));

    function keyhandle(k) {
        switch(k.key) {
            case 'ArrowUp':
                var u = -1;
            case 'ArrowDown':
                volmenu.navigate(u || 1);
                break;

            case 'ArrowRight':
                var up = true;
            case 'ArrowLeft':
                var wv = actEl().dataset.id;
                localStorage.setItem(
                    `volume-${wv}`,
                    volmenu.updateValue(
                        !!up,
                        actEl().tabIndex
                    )
                );
                window.dispatchEvent(volumeChangeEvent);
                break;

            case 'SoftRight':
                navigator.volumeManager.requestShow();
                break;

            case 'SoftLeft':
            case 'Backspace':
                hide();
                break;
        }
    }

    function hide(norefocus) {
        fh.execcallback();
        if(!norefocus) {
            fh.refocus();
            fh.loadpage();
        }
        fh.clear();
        volmenu.menuViewToggle(false);
    }

    function show(backcb) {
        fh.save(backcb);
        curpage = thisPage;
        volmenu.menuViewToggle(true,true);
    }

    return {
        menu: volmenu,
        navbar: ['back','','system'],
        page: thisPage,
        getVolume: getVolume,
        keyHandle: keyhandle,
        show: show,
        hide: hide
    };
})();