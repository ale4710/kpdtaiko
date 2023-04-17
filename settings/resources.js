(()=>{
	//styles
    [
        'style'
    ].forEach((fn)=>{
        addGlobalReference(1, fn);
    });
	
    //scripts
        [
        'settings-list',
        'setting-updater',
        'script',
		'start'
    ].forEach((fn)=>{
        addGlobalReference(0, fn);
    });
})();