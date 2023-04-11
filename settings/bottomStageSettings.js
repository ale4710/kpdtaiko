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
		Object.keys(settings.categories).forEach((category)=>{
			spcCat.settings.push('category-' + category);
			settingsListCategories[category] = settings.categories[category];
		});
	});
}