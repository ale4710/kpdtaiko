(function(){
	let maxMissCount = modsList.mods.risky.check();
	
	window.addEventListener('gamehit', function(ev){
		if(ev.detail.judgement === 0) {
			let remaining = maxMissCount - statistics.hits.miss;
			
			if(remaining > 0) {
				postJudge({
					text: remaining,
					className: judgeStyles.miss.className
				});
			} else {
				//else just let the default miss judge show
				//also... stop gameplay.
				postExtraInfo('time');
				audio.stop();
				end('Too many missed...');
			}
		}
	});
})();