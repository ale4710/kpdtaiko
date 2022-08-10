(()=>{
    var bg = '/common/',
    lib = 'lib/',
    user = 'js/';
	
	//styles
    [
        'utilStyle',
        'widgets',
        'style',
        'misc',
        'theme'
    ].forEach((fn)=>{
        addGlobalReference(1, 
            bg + 'css/' + fn
        );
    });
	
    //scripts
    [
		user+'test',

        //lib
        //lib+'localforage',
        lib+'md5',
		lib+'taffy-min',
        //normal scripts
        user+'etcf',
        user+'settings',
        user+'gameFn',
        user+'textEncoding',
        user+'classes',
        user+'mods',
        user+'volumeControl',
        user+'deviceStorage',
		user+'databaseTools',
        user+'database',
        user+'messageBox',
        user+'elements',
        user+'control',
        user+'tjaParse',
        user+'osuParse',
        user+'resourceAdder'
    ].forEach((fn)=>{
        addGlobalReference(0, 
            bg + fn
        );
    });
})();