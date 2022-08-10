var domColorFinder = new ColorThief(),
bottomStageFailedIdolInit = (function(){
	var
	shared = {},
	fns = {},
	fnFns = {},
	fnCats = [
		'reset',
		'dataUpdated',
		'init',
		'finish',
		'draw',
		'check'
	];
	
	fnCats.forEach((k)=>{
		var tFnList = [];
		
		fns[k] = tFnList;
		
		fnFns[k] = function() {
			tFnList.forEach((fn)=>{
				fn(...arguments);
			});
		}
	});
	
	var scriptsToLoad = [
		'misc',
		'bg',
		'character'
	],
	scriptsLoaded = 0,
	scriptsTotal = scriptsToLoad.length;
	
	scriptsToLoad.forEach((url)=>{
		addGlobalReference(0,
			`bottomstage/${bottomStageFolder}/${url}`
		);
	});
	scriptsToLoad = null;
	
	return {
		imgPath: `bottomstage/${bottomStageFolder}/img/`,
		shared: shared,
		init: function(scriptInfo) {
			if(typeof(scriptInfo) === 'object') {
				var sik = Object.keys(scriptInfo);
				sik.forEach((k)=>{
					if(k in fns) {
						fns[k].push(scriptInfo[k]);
					}
				});
			}
			
			if(++scriptsLoaded === scriptsTotal) {
				//clean up
				scriptsLoaded = null;
				scriptsTotal = null;
				
				fnCats.forEach((cat)=>{
					if(fns[cat].length === 0) {
						fnFns[cat] = emptyfn;
					}
				});
				fns = null;
				fnCats = null;
				
				bottomStageInit(()=>{
					return fnFns
				});
			}
		}
	};
})();
