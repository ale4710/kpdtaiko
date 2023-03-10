(()=>{
    var bg = '/common/';
    var lib = 'lib/';
    var user = 'js/';
	
	//styles
	addGlobalReferenceGroup(1, [
		bg + 'css/' + 'utilStyle',
		bg + 'css/' + 'widgets',
		bg + 'css/' + 'style',
		bg + 'css/' + 'misc',
		bg + 'css/' + 'theme'
	]);
	
	//scripts
	addGlobalReferenceGroup(0, [
		//lib
		//lib+'localforage',
		bg+lib+'md5',
		bg+lib+'taffy-min',
		//normal scripts
		bg+user+'frameShowManager',
		bg+user+'compat',
		bg+user+'etcf',
		bg+user+'settings',
		bg+user+'gameFn',
		bg+user+'textEncoding',
		bg+user+'classes',
		bg+user+'control',
		bg+user+'mods',
		bg+user+'volumeControl',
		bg+user+'deviceStorage',
		bg+user+'databaseTools',
		bg+user+'database',
		bg+user+'messageBox',
		bg+user+'elements',
		bg+user+'tjaParse',
		bg+user+'osuParse',
		bg+user+'resourceAdder',
		
		//bg+user+'test'
	]);
})();