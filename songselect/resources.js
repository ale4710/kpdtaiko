(()=>{
	//styles
    [
        'style'
    ].forEach((fn)=>{
        addGlobalReference(1, fn);
    });
	
    //scripts
    [
        '/common/js/introSliderAndDifficultySummary',

        'songListMananger',
        'modsDisplay',
		'groupSortManager',
        'speedControl',
        'options',
        'intro',
		'media',
		'updateSongInfoDisplay',
		'misc',
		'titleScreen',
		'idleScreen',
		'listSong',
		'listDifficulty',
        'script'
    ].forEach((fn)=>{
        addGlobalReference(0, fn);
    });
})();