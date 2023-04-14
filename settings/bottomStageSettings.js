function _loadBottomStageSettings() {
	_loadBottomStageSettings = undefined;
	return bottomStageManager.getConfig().then((settings)=>{
		//settings
		Object.keys(settings.settings).forEach((settingKey)=>{
			settingsList[settingKey] = settings.settings[settingKey];
		});
		
		//initialize category
		let spcCat = {
			label: 'Specific Stage Settings',
			settings: []
		};
		settingsListCategories['specific-bottom-stage'] = spcCat;
		
		//categories
		let spcCatEntries = Object.keys(settings.categories);
		spcCatEntries.sort(function(a,b){
			return 1 - (2 * (
				settings.categories[a].label <
				settings.categories[b].label
			))
		});
		spcCatEntries.forEach((category)=>{
			spcCat.settings.push('category-' + category);
			settingsListCategories[category] = settings.categories[category];
		});
	});
}