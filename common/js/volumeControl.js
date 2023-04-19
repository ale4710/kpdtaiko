//system volume control
var systemVolumeControl = (function(){
	let interface = {};
	
	let vcReady = false;
	let vc;
	let vcPromise;
	let vcFakeEventTarget = new FakeEventTarget();
	
	if(checkb2gns()) {
		//3.0
		vcPromise = Promise.resolve();
	} else {
		vcPromise = Promise.resolve(navigator.volumeManager);
	}
	
	vcPromise.then((vcfp)=>{
		vc = vcfp;
		vcReady = true;
		vcFakeEventTarget.broadcast();
		vcFakeEventTarget = undefined;
	});
	
	interface.checkAvailable = (function(){
		if(checkb2gns()) {
			//3.0
			//TODO
			return false;
		} else {
			//2.5
			//it is available immediately
			return true;
		}
	});
	
	interface.get = (function(){
		let gp;
		if(vcReady) {
			gp = Promise.resolve(vc);
		} else {
			gp = new Promise((resolve)=>{
				vcFakeEventTarget.addListener(()=>{
					resolve(vc);
				});
			});
		}
		
		return gp;
	});
	
	return interface;
})();

//volume control menu
var volumeControl = (function(){
    var thisPage;
	var volmax = 20;

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
                systemVolumeControl.get().then((vc)=>{
					if(vc) {
						vc.requestShow();
					}
				});
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
	
	thisPage = addPage(
		keyhandle,
		(function(){
			let nb = ['back','',''];
			if(systemVolumeControl.checkAvailable()) {
				nb[2] = 'system';
			}
			return nb;
		})
	);

    return {
        menu: volmenu,
        page: thisPage,
        getVolume: getVolume,
        show: show,
        hide: hide
    };
})();