var testingMode = true;

/* localStorage.setItem('scroll-speed', 1);
localStorage.setItem('audio-speed', 1);
localStorage.setItem('autoplay-enabled', true); */

(()=>{
    var folderInput = document.createElement('input'),
    fileNameInput = document.createElement('input'),
    fileTypeSelect = document.createElement('select'),
    goButton = document.createElement('button'),
    
    //extras
    courseInput = document.createElement('input');

    folderInput.placeholder = 'Folder Path';
    fileNameInput.placeholder = 'File Name';

    courseInput.placeholder = 'Target Course (tja only)';

    [
        'tja',
        'osu'
    ].forEach((v)=>{
        var o = document.createElement('option');
        o.textContent = v;
        o.value = v;
        fileTypeSelect.appendChild(o);
    });

    goButton.textContent = 'go!!!!!';

    //if exists
    if(location.hash.length > 1) {
        var eurlp = new URLSearchParams(location.hash.substr(1));

        folderInput.value = eurlp.get('folder') || '';
        fileNameInput.value = eurlp.get('fileName') || '';
        fileTypeSelect.value = eurlp.get('fileType') || '';
        
        courseInput.value = eurlp.get('targetDifficulty') || '';
    }

    var inputClassname = 'pc-testing-input';
    [
        folderInput,
        fileNameInput,

        courseInput
    ].forEach((el)=>{
        el.classList.add(inputClassname);
    });
    
    document.body.appendChild(folderInput);
    document.body.appendChild(fileNameInput);
    document.body.appendChild(fileTypeSelect);
    document.body.appendChild(goButton);
    document.body.appendChild(document.createElement('br'));
    document.body.appendChild(courseInput);

    function go() {
        goButton.removeEventListener('click',go);

        var urlp = (new URLSearchParams());
        urlp.append('folder', folderInput.value);
        urlp.append('fileName', fileNameInput.value);
        urlp.append('fileType', fileTypeSelect.value);
		urlp.append('songSource', 1);

        urlp.append('targetDifficulty', courseInput.value);

        location.hash = urlp.toString();

        location.reload();
    };
    goButton.addEventListener('click', go);

	var gkhReplaceInt = setInterval(()=>{
		if('gameKeyHandler' in window) {
			window.removeEventListener('keydown', gameKeyHandler);
			window.addEventListener('keydown',(k)=>{
				if(!(actEl().classList.contains(inputClassname))) {
					gameKeyHandler(k);
				}
			});
			clearInterval(gkhReplaceInt);
			gkhReplaceInt = null;
		}
	}, 250);
    
})();
