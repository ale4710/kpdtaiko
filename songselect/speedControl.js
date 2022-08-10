var speedsControl = (function(){
    var fh = new PreviousFocusHandler();
    function formlsname(bf){return `${bf}-speed`;}
    function formModDispName(n){return `${n}Speed`;}

    var speedIds = {
        m: 'audio',
        s: 'scroll'
    };

    var smenu = (new OptionsMenuMultiSliders('Speed Options'));
    (()=>{

        [
            ['Music Playback Rate', speedIds.m],
            ['Scroll Speed', speedIds.s]
        ].forEach((v)=>{
            var lsn = formlsname(v[1]),
			sv = parseFloat(localStorage.getItem(lsn));

            if(isNaN(sv)) {
                localStorage.setItem(lsn, 1);
                sv = 1;
				
				modsDisplay.updateDisplay(
					formModDispName(v[1]),
					1
				);
            }

            smenu.addOption(
                v[0], v[1],
                0.1, 4, 0.1,
                sv
            );
        });
    })();

    function keyhandle(k) {
        switch(k.key) {
            case 'ArrowUp':
                var u = -1;
            case 'ArrowDown':
                smenu.navigate(u || 1);
                break;

            case 'ArrowRight':
                var up = true;
            case 'ArrowLeft':
                var wv = actEl().dataset.id;
                localStorage.setItem(
                    formlsname(wv),
                    smenu.updateValue(
                        !!up,
                        actEl().tabIndex
                    )
                );
                modsDisplay.updateDisplay(formModDispName(wv));
                break;

            case 'Enter':
                var t = actEl().dataset.id;
                localStorage.setItem(
                    formlsname(t),
                    1
                );
                smenu.updateValue(
                    1,
                    actEl().tabIndex,
                    true
                );
                modsDisplay.updateDisplay(formModDispName(t));
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
        smenu.menuViewToggle(false);
    }

    function show(backcb) {
        fh.save(backcb);
        curpage = 4;
        smenu.menuViewToggle(true,true);
    }

    return {
        menu: smenu,
        keyhandle: keyhandle,
        navbar: ['back','reset'],
        show: show,
        hide: hide
    };
})();