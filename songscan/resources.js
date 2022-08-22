(()=>{
	//styles
    [
        'style'
    ].forEach((fn)=>{
        addGlobalReference(1, fn);
    });
	
    //scripts
    [
		'etc',
		
        'scan',
		
		'detect'
    ].forEach((fn)=>{
        addGlobalReference(0, fn);
    });
})();
