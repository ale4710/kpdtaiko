(function(){
	var keys = {};
	
	var prek = {
		['SoftLeft']: ['q', 'Q'],
		['SoftRight']: ['w', 'W']
	};
	Object.keys(prek).forEach((sendKey)=>{
		prek[sendKey].forEach((acceptKey)=>{
			keys[acceptKey] = sendKey;
		});
	});
	prek = null;
	
	
	window.addEventListener('keydown', (k)=>{
		if(k.isTrusted) {
			if(k.key in keys) {
				var fk = new CustomEvent('keydown');
				fk.key = keys[k.key];
				window.dispatchEvent(fk);
			}
		}
	})
})();
