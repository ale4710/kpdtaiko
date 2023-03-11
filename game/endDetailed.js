var gameInfoFinalExtraPosted = false;
function outputGameplayInfoFinalExtra() {
	if(!gameInfoFinalExtraPosted) {
		gameInfoFinalExtraPosted = true;
		
		// -- histogram --
		//img
		eid('game-stats-histogram').src = createTimeGraph(2);
		//timedata
		var td = analyzeTimeData();
		//  misc data
		eid('game-stats-late').textContent = td.late;
		eid('game-stats-early').textContent = td.early;
		eid('game-stats-average').textContent = td.average.toFixed(2);
		
		// -- combo map --
		let missMapMinValue = 25;
		eid('game-stats-combo-map').src = createMissMap(
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
			outputGameplayInfoFinalExtra();
		}
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