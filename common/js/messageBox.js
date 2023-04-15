var messageBox = (function(){
    var thispage;

    var elements = {
        screen: null,
        container: null,
        title: null,
        body: null
    };
    (()=>{
        var scr = document.createElement('div');
        elements.screen = scr;
        scr.classList.add('screen','dim','hidden');

        var el = document.createElement('div');
        el.classList.add('option-menu-cont');
        elements.container = el;

        //title
        var header = document.createElement('div');
        header.classList.add('menuheader');
        elements.title = header;

        var body = document.createElement('div');
        body.classList.add('option-menu', 'message-box', 'scrollable-screen');
        body.tabIndex = -1;
        elements.body = body;

        el.appendChild(header);
        el.appendChild(body);
        scr.appendChild(el);
        screenElement.appendChild(scr);
    })();

    var fochandler = new PreviousFocusHandler();

    var keyConsts = {
        SoftLeft: 'left',
        SoftRight: 'right',
        Enter: 'center',
        Backspace: 'back'
    };

    function defaultcb() {
        fochandler.refocus();
        fochandler.loadpage();
    }
    
    var active = false,
    currentActions;
	function makemsgboxopt(callback, label, noHide) {
        return {
            label: label,
            callback: callback,
            noHide: !!noHide
        }
    }

    function create(title, body, actions) {
        if(!actions) {
            actions = {};
        }
    
        if(!active) {
            fochandler.save();
            active = true;
        }
    
        if(!actions.back) {
            actions.back = makemsgboxopt(defaultcb);
        }
    
        currentActions = actions;
    
        elements.title.textContent = title;
        elements.body.innerHTML = body;
    
        elements.screen.classList.remove('hidden');
        elements.body.focus();
    
        lupdatenavbar();
        curpage = thispage;
    }

    function hidebox() {
        elements.screen.classList.add('hidden');
        elements.body.innerHTML = '';
        currentActions = null;
		active = false;
        fochandler.clear();
    }

    function keyhandler(k) {
        var tmbkc = keyConsts[k.key],
        ca = currentActions[tmbkc] //current action
        ;

        if(ca) {
            ca.callback(tmbkc);
            if(!ca.noHide) {
                hidebox();
            }
        }
    }

    function lupdatenavbar() {
        var ca = currentActions, a = [];
        if(ca) {
            a = [
                ca.left,
                ca.center,
                ca.right
            ];
            for(var i = 0; i < a.length; i++) {
                if(a[i]) {
                    a[i] = a[i].label;
                } else {
                    a[i] = null;
                }
            }
        }
        return a;
    }
	
	thispage = addPage(
		keyhandler,
		lupdatenavbar
	);

    return {
        elements: elements,
        defaultCb: defaultcb,
        create: create,
        hide: hidebox,
        makeOpt: makemsgboxopt,
        keyHandler: keyhandler,
        updateNavbar: lupdatenavbar
    };
})();