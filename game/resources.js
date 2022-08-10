(()=>{
	//styles
    [
        'style',
        'playfield',
        'bg',
        'info'
    ].forEach((fn)=>{
        addGlobalReference(1, fn);
    });
	
    //scripts
    [
		'/common/lib/color-thief.umd',

        'etc',
        'controls',
        'audio',
		'bottomStage',
        'draw',
        'drawNoteTools',
        /* 'drawDOM',
        'drawCanvas',
        'drawWebGL', */
        'drawSelect',
        'infoAndScore',
        'autoplay',
        'pause',
        'end',
        'game',
        'load'
    ].forEach((fn)=>{
        addGlobalReference(0, fn);
    });
})();