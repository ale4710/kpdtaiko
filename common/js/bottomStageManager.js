var bottomStageManager = (function(){
	const basePath = '/bottomstage/';
	
	const stages = [
		'simple',
		'idoru',
		'audioAnalyzer'
	];
	
	function formSettingPrefix(stageName) {
		return 'bottom-stage-' + stageName;
	}
	function formSettingName(stageName, settingName) {
		return formSettingPrefix(stageName) + '-' + settingName 
	}
	
	function loadconfig() {
		let additionalConfig = {};
		let additionalCategoryGroups = {};
		
		let promises = [];
		
		stages.forEach(function(stageName){
			promises.push(new Promise(function(resolve){
				xmlhttprqsc(
					basePath + stageName + '/settings.json',
					'json',
					(function(ev){
						if(ev.target.response) {
							let settingsNamePrefix = formSettingPrefix(stageName);
							//category entry
							additionalConfig['category-' + settingsNamePrefix] = {
								action: settingsNamePrefix,
								label: ev.target.response.label || stageName,
								type: 5
							};
							
							//category listing
							let order = [];
							ev.target.response.settingsOrder.forEach((key)=>{
								order.push(formSettingName(stageName, key));
							});
							additionalCategoryGroups[settingsNamePrefix] = {
								label: settingsNamePrefix,
								settings: order
							};
							order = undefined;
							
							//loop over actual settings
							let thisAddtSt = ev.target.response.settings;
							Object.keys(thisAddtSt).forEach(function(key){
								//assign actual setting
								additionalConfig[formSettingName(stageName, key)] = thisAddtSt[key];
							});
						}
						resolve();
					}),
					resolve
				);
			}));
		});
		
		return Promise.allSettled(promises).then(function(){
			return {
				settings: additionalConfig,
				categories: additionalCategoryGroups
			};
		});
	}
	
	let load = (function(){
		let loaded = false;
		
		let bottomStageData = {};
		
		class BottomStageSelfManager {
			constructor(stageName) {
				this.stageName = stageName;
				this.basePath = basePath + stageName + '/';
			}
			
			finalizeUnload() {
				loaded = false;
			}
			
			getSetting(settingName) {
				return getSettingValue(formSettingName(this.stageName, settingName));
			}
		}
		
		return function(stageName){
			if(loaded) {
				return Promise.reject('a stage is already loaded. you can only have one stage loaded at a time. unload the previous stage first.');
			}
			
			if(stages.indexOf(stageName) === -1) {
				return Promise.reject('invalid stage name');
			}
			
			//  initialize the object
			let bottomStageInterface = {};
			//assign fns
			[
				'finishedLoading',
				'reset',
				'dataUpdated',
				'draw',
				'update',
				'finish'
			].forEach(function(action){
				bottomStageInterface[action] = emptyfn;
			});
			//other stuff idk
			bottomStageInterface.data = bottomStageData; //it shares it
			
			//  make a self manager
			let selfManager = new BottomStageSelfManager(stageName);
			let thisBasePath = selfManager.basePath;
			
			//  okay it is ready
			return addGlobalReference(0, thisBasePath + 'script')
			.then(function(){
				//script loaded. stage can be initialized, so we will do that.
				let bsi = _bottomStageInitialize;
				_bottomStageInitialize = undefined;
				
				return bsi(
					bottomStageInterface,
					selfManager
				)
				.then(function(){
					//it is initialized
					
					//do checks
					if(!('unload' in bottomStageInterface)) {
						throw `error with bottomstage ${stageName}: the unload function is not defined.`;
					}
					
					//all good
					return bottomStageInterface;
					
				});
			}).catch(function(err){
				loaded = false;
				//rethrow
				throw err;
			});
		};
	})();
	
	return {
		load: load,
		getConfig: loadconfig,
		tools: {
			formSettingPrefix: formSettingPrefix,
			formSettingName: formSettingName
		}
	};
})();
