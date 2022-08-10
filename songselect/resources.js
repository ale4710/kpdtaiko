(()=>{
	//styles
    [
        'style'
    ].forEach((fn)=>{
        addGlobalReference(1, fn);
    });
	
    //scripts
    [
        //'exampledata',

        'songListMananger',
        'modsDisplay',
		'groupSortManager',
        'misc',
        'speedControl',
        'options',
        'intro',
		'media',
        'script'
    ].forEach((fn)=>{
        addGlobalReference(0, fn);
    });
})();