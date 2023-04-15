(()=>{
	//styles
    [
        'style'
    ].forEach((fn)=>{
        addGlobalReference(1, fn);
    });
	
    //scripts
    [
		'/common/lib/jszip.min',
		'import',
		'script'
    ].forEach((fn)=>{
        addGlobalReference(0, fn);
    });
})();
