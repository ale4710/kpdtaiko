(function(){
	let maxMissCount = modsList.mods.risky.check();
	let alreadyFailed = false;
	
	window.addEventListener('gamemissed', function(){
		let remaining = maxMissCount - statistics.hits.miss;
		
		if(remaining >= 0) {
			postJudge({
				text: remaining,
				className: judgeStyles.miss.className
			});
		} //else just let the default miss judge show
	});
	
	gameLoopAdditional.push(function(){
		if(
			!ended &&
			!alreadyFailed &&
			(statistics.hits.miss > maxMissCount)
		) {
			alreadyFailed = true; //prevent it from double posting
			postExtraInfo('time');
			audio.stop();
			end('Too many missed...');
		}
	});
})();