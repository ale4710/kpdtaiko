var domColorFinder;
var bottomStageFailedIdolInit = (function(){
	var shared = {};
	var fns = {};
	var fnFns = {};
	var fnCats = [
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
	
	//	load scripts
	//provide loader for scripts
	function fibsinit(scriptInfo) {
		if(typeof(scriptInfo) === 'object') {
			Object.keys(scriptInfo).forEach((k)=>{
				if(k in fns) {
					fns[k].push(scriptInfo[k]);
				}
			});
		}
	}
	//actually load them
	addGlobalReferenceGroup(0, [
		'/common/lib/color-thief.umd',
		`bottomstage/${bottomStageFolder}/misc`,
		`bottomstage/${bottomStageFolder}/bg`,
		`bottomstage/${bottomStageFolder}/character`
	]).then(function(){
		//once all loaded...
		//clean up
		fnCats.forEach((cat)=>{
			if(fns[cat].length === 0) {
				fnFns[cat] = emptyfn;
			}
		});
		fns = null;
		fnCats = null;
		
		//other inits
		domColorFinder = new ColorThief();
		
		//lets go
		bottomStageInit(()=>{
			return fnFns
		});
	});
	
	//bottomStageFailedIdolInit is...
	return {
		imgPath: `bottomstage/${bottomStageFolder}/img/`,
		shared: shared,
		init: fibsinit
	};
})();
