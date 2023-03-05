var groupSortManager = (function(){
	let fhandler = new PreviousFocusHandler();
	let thisPage;
	
	let currentGsm;
	
	function getGsmValue(gsm) {return localStorage.getItem(getLsKey(gsm));}
	function setGsmValue(gsm, set) {return localStorage.setItem(getLsKey(gsm), set);}

	var opts = {
		sort: {
			label: 'Sort',
			key: 'sort',
			options: [
				{k: 'title', l: 'Title', p: 'title'}
			],
			defaultOption: 0
		},
		group: {
			label: 'Group',
			key: 'group',
			options: [
				{k: 'nogroup', l: 'None', p: null},
				{k: 'filetype', l: 'File Type', p: 'fileType'},
				{k: 'artist', l: 'Artist', p: 'artist'},
				{k: 'mediaSource', l: 'Media Source', p: 'mediaSource'},
				{k: 'creator', l: 'Chart(set) Creator', p: 'creator'},
				{k: 'alphabet', l: 'First Letter', p: 'system-alphabet'}
			],
			defaultOption: 0
		}
	};
	
	(()=>{
		Object.keys(opts).forEach((gsm)=>{
			gsm = opts[gsm];
			//default options
			if(getGsmValue(gsm.key) === null) {
				setGsmValue(gsm.key, gsm.options[gsm.defaultOption].k);
			}
			
			//map
			var map = {},
			gsmOpts = gsm.options;
			gsmOpts.forEach((o,i)=>{
				map[o.k] = i;
			});
			gsm.map = map;
		});
	})();
	
	function getLsKey(s) {
		return 'groupsort-' + s;
	}
	
	var optSelect = new OptionsMenuSelectable('', 'radio');
	
	function showMenu(gsm) {
		if(gsm in opts) {
			fhandler.save();
			curpage = thisPage;
			
			currentGsm = gsm;
			
			gsm = opts[gsm];
			optSelect.updateHeader(gsm.label);
			var gsmValue = getGsmValue(gsm.key);
			optSelect.clearMenu();
			gsm.options.forEach((o)=>{
				optSelect.addOption(
					o.l,
					gsmValue === o.k
				);
			});
			optSelect.menuViewToggle(true, 2);
		} else {
			throw 'invalid opt';
		}
	}
	
	function hideMenu() {
		optSelect.menuViewToggle(false);
		fhandler.refocus();
		fhandler.loadpage();
		fhandler.clear();
	}
	
	function keyhandle(k) {
        switch(k.key) {
            case 'ArrowUp':
                var u = -1;
            case 'ArrowDown':
                optSelect.navigate(u || 1);
                break;
			case 'Enter':
				var gsm = opts[currentGsm];
				setGsmValue(
					gsm.key,
					gsm.options[actEl().tabIndex].k
				);
			case 'SoftLeft':
			case 'Backspace':
				hideMenu();
				if(gsm) {window.dispatchEvent(new CustomEvent('sortmethodchanged'));}
				break;
			
		}
	}
	
	thisPage = addPage(
		keyhandle,
		(function(){return ['back','select']})
	);
	
	return {
		showMenu: showMenu,
		hideMenu: hideMenu,
		getGSmethod: function(m){
			if(m in opts) {
				var mv = getGsmValue(m),
				o = opts[m];
				//console.log(mv, o);
				return o.options[o.map[mv]] || null;
			} else {
				return null;
			}
		},
		options: opts
	}
})();