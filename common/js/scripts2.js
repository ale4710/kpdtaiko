(()=>{
    var bg = '/common/';
    var lib = 'lib/';
    var user = 'js/';
	
	//library
	//	some devices dont have allsettled...
	{
		let libload = Promise.resolve();
		[
			bg+lib+'allsettled-polyfill',
			bg+lib+'md5',
			bg+lib+'taffy-min'
		].forEach((path)=>{
			libload = libload.then(()=>{
				return addGlobalReference(0, path);
			});
		});
		
		libload.then(()=>{
			libload = undefined;
			
			//styles
			addGlobalReferenceGroup(1, [
				bg + 'css/' + 'utilStyle',
				bg + 'css/' + 'widgets',
				bg + 'css/' + 'style',
				bg + 'css/' + 'misc',
				bg + 'css/' + 'theme'
			]);
			
			addGlobalReferenceGroup(0, [
				//normal scripts
				bg+user+'compat',
				bg+user+'etcf',
				bg+user+'genres',
				bg+user+'frameShowManager',
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
				
				//next part
				'resources',
				
				//test script
				//bg+user+'test'
			]);
		});
	}
})();