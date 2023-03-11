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
		'updateSongInfoDisplay',
		'titleScreen',
		'listSong',
		'listDifficulty',
        'script'
    ].forEach((fn)=>{
        addGlobalReference(0, fn);
    });
})();