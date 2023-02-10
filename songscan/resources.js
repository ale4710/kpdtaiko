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
		'detect'
    ].forEach((fn)=>{
        addGlobalReference(0, fn);
    });
})();
