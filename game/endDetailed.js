var gameInfoFinalExtraPosted;

function endedExtraReset() {
	gameInfoFinalExtraPosted = false;
}
endedExtraReset();

function outputGameplayInfoFinalExtra() {
	if(!gameInfoFinalExtraPosted) {
		gameInfoFinalExtraPosted = true;
		
		// -- histogram --
		//img
		let timeGraph = createTimeGraph(2);
		eid('game-stats-histogram').src = timeGraph.image;
		//lines
		{
			let targetCont = eid('game-stats-histogram-target-container');
			let targets = targetCont.children;
			while(targets.length !== 0) {targets[0].remove()}
			targets = undefined;
			//template
			let target = document.createElement('div');
			target.classList.add('target');
			//	perfect target
			targetCont.appendChild(target); //append directly here on purpose
			//	the rest of the judgements
			[
				'good',
				'okay'
			].forEach((judgement)=>{
				for(m = -1; m < 2; m += 2) {
					let pos = 50 + ((hitWindow[judgement] / hitWindow.miss) * 50 * m);
					let tt = target.cloneNode();
					tt.classList.add(judgement);
					tt.style.setProperty('--left', pos + '%');
					targetCont.appendChild(tt);
				}
			});
		}
		timeGraph = undefined; //dont need anymore
		//timedata
		var td = analyzeTimeData();
		//  misc data
		eid('game-stats-late').textContent = td.late;
		eid('game-stats-early').textContent = td.early;
		{
			let avg = '--.--';
			if(!isNaN(td.mean)) {avg = td.mean.toFixed(2);}
			eid('game-stats-average').textContent = avg;
			
			let stddev = '--.--';
			if(!isNaN(td.stddev)) {stddev = td.stddev.toFixed(2);}
			eid('game-stats-stddev').textContent = stddev;
		}
		// -- combo map --
		let missMapMinValue = 25;
		eid('game-stats-combo-map').src = createMissMap(
			undefined,
			undefined,
			undefined,
			undefined,
			undefined,
			missMapMinValue
		);
		eid('game-stats-combo-map-min-value').textContent = missMapMinValue;
	}
}

var gotoEndDetailed = (function(){
	let currentTab;
	let tabs = ecls(
		'game-stats-detail-page',
		eid('game-stats-details')
	);
	let tabTitles = {
		'timing-data': 'Timing Data',
		'combo-map': 'Combo Map'
	};
	function updateTab(dir) {
		for(let i = 0; i < tabs.length; i++) {
			tabs[i].classList.add('hidden');
		}
		currentTab = navigatelist(
			currentTab,
			tabs,
			dir
		);
		let nt = tabs[currentTab];
		eid('game-stats-details-title').textContent = (
			tabTitles[nt.dataset.statType] || 
			'?'
		);
		nt.classList.remove('hidden');
	}
	
	let thisPage = addPage(
		(function detailedK(k) {
			switch(k.key) {
				case 'Backspace':
				case 'SoftLeft':
					hide();
					break;
				case 'ArrowLeft':
					var u = -1;
				case 'ArrowRight':
					updateTab(u || 1);
					break;
			}
		}),
		(function detailedN() {
			return ['Back'];
		})
	);
	
	function show() {
		if(typeof(currentTab) !== 'number') {
			currentTab = 0;
			updateTab(0);
		}
		outputGameplayInfoFinalExtra();
		eid('game-stats-details').classList.remove('hidden');
		curpage = thisPage;
	}
	
	function hide() {
		actEl().blur();
		eid('game-stats-details').classList.add('hidden');
		curpage = endedPageN;
	}
	
	return show;
})();