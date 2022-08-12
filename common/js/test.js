(function(){
	//define keys
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
	prek = undefined;
	
	//emulate kaios behavior in input elements
	var allowPropKeys = [
		'Enter'
	].concat(Object.keys(keys));

	function preventInputBacksp(k){
		if(allowPropKeys.indexOf(k.key) === -1) {
			k.stopPropagation();
		}
	};

	document.addEventListener('focusin', function(e){
		if(e.target.tagName === 'INPUT') {
			e.target.addEventListener('keydown', preventInputBacksp);
		}
	});
	
	document.addEventListener('focusout', function(e){
		e.target.removeEventListener('keydown', preventInputBacksp);
	});
	
	//key intercept
	window.addEventListener('keydown', (k)=>{
		if(k.isTrusted) {
			if(k.key in keys) {
				var fk = new CustomEvent('keydown');
				fk.key = keys[k.key];
				window.dispatchEvent(fk);
			}
		}
	});
})();
