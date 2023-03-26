var localTimeOffsetLSKey;
function initializeLocalTimeOffset(id) {
	localTimeOffsetLSKey = 'offset-' + id;
	localTimeOffset = localStorage.getItem(localTimeOffsetLSKey) || 0;
	localTimeOffset = parseInt(localTimeOffset);
	recalculateOffset();
	initializeLocalTimeOffset = undefined;
}

(function(){
	let timingAdjustKey = '#';
	let timingResetKey = '1';
	let adjustEnabled = false;
	let keyAdjustAmount = {
		'ArrowUp': 10,
		'ArrowDown': -10,
		'ArrowLeft': -1,
		'ArrowRight': 1
	};
	
	let timingAdjustPreventKey = '*';
	let timingAdjustDisabled = false;
	
	let offsetDisplay = eid('offset-display');
	function printOffset() {
		eid('local-offset').textContent = Math.floor(localTimeOffset);
		eid('global-offset').textContent = Math.floor(globalTimeOffset);
	};
	let printAverageErrorInterval;
	function printAverageError() {
		let err = getAverageError();
		if(err) {
			err = err.toFixed(2);
		} else {
			err = 'nil';
		}
		eid('error-offset').textContent = err;
	};
	
	window.addEventListener('keydown', function(k){
		if(adjustEnabled) {
			let modified = true;
			
			if(k.key in keyAdjustAmount) {
				localTimeOffset += keyAdjustAmount[k.key];
			} else if(k.key === timingResetKey) {
				localTimeOffset = 0;
			} else {
				modified = false;
			}
			
			if(modified) {
				recalculateOffset();
				printOffset();
				
				if(localTimeOffset === 0) {
					localStorage.removeItem(localTimeOffsetLSKey);
				} else {
					localStorage.setItem(localTimeOffsetLSKey, localTimeOffset);
				}
			}
		} else if(!k.repeat) {
			switch(k.key) {
				case timingAdjustKey:
					if(!timingAdjustDisabled) {
						adjustEnabled = true;
						
						printOffset();
						printAverageError();
						printAverageErrorInterval = setInterval(printAverageError, 100);
						
						offsetDisplay.classList.remove('hidden');
					}
					break;
				
				case timingAdjustPreventKey:
					timingAdjustDisabled = true;
					break;
			}
		}
	});
	
	window.addEventListener('keyup', function(k){
		switch(k.key) {
			case timingAdjustKey:
				adjustEnabled = false;
				clearInterval(printAverageErrorInterval);
				offsetDisplay.classList.add('hidden');
				break;
				
			case timingAdjustPreventKey:
				timingAdjustDisabled = false;
				break;
		}
	});
})();