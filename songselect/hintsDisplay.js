(function(){
	let hints = eid('song-list-button-hints').children;
	if(getSettingValue('show-song-list-hints') === 1) {
		let initialPlayed = false;
	
		let currentHint = Math.floor(hints.length * Math.random());
		
		let slideInCLN = 'hint-slide-in-animation';
		let slideOutCLN = 'hint-slide-out-animation';
		
		for(let i = 0; i < hints.length; i++) {
			hints[i].classList.add('hidden');
		}
		
		function next() {
			let slideOutPromise;
			if(initialPlayed) {
				let th = hints[currentHint];
				void th.offsetHeight;
				th.classList.add(slideOutCLN);
				slideOutPromise = new Promise(function(proceed){
					th.onanimationend = (function(){
						th.onanimationend = null;
						th.classList.remove(slideOutCLN);
						th.classList.add('hidden');
						proceed();
					});
				});
			} else {
				slideOutPromise = Promise.resolve();
				initialPlayed = true;
			}
			
			slideOutPromise.then(()=>{
				currentHint++;
				if(!(currentHint in hints)) {
					currentHint = 0;
				}
				let nh = hints[currentHint];
				void nh.offsetHeight;
				nh.classList.add(slideInCLN);
				nh.classList.remove('hidden');
				nh.onanimationend = (function(){
					nh.onanimationend = null;
					nh.classList.remove(slideInCLN);
					setTimeout(next, 5000);
				});
			});
		}
		
		next();
	} else {
		hints = undefined;
		eid('song-list-button-hints').classList.add('hidden');
	}
})();