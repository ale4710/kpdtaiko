var gameDirectory = '.domtaiko',
gameSubDirectories = {
    songs: 'songs',
    userMedia: 'custom'
},
deviceStorage = navigator.getDeviceStorage('sdcard'),

notifyOnError = true;

function formFullgameDirectory(){
    return `${deviceStorage.storageName}/${gameDirectory}/${gameSubDirectories.songs}`;
}

function getSongDirFile(path) {
    return getFile(`${gameDirectory}/${gameSubDirectories.songs}/${path}`);
}
function getFile(path) {
    return (new Promise((resolve, reject)=>{
        var getRq = deviceStorage.get(path);
        getRq.addEventListener('success',(e)=>{
            resolve(e.target.result);
        });
        getRq.addEventListener('error',(e)=>{
            var errMsg = 'Unknown error.';
            switch(e.target.error.name) {
                default: console.error(e); break;
                case 'NotFoundError': errMsg = `"${path}" could not be found...`; break;
            }
            console.error(errMsg, e);
            if(notifyOnError) {
                alertMessage(
                    errMsg,
                    5000,
                    3
                );
            }
            reject(e.target);
        });
    }));
}

function parseFilePath(filePath, relativeTo) {
	var filePathFull = filePath;
    if(relativeTo) {
        filePath = filePath.substr(
            filePath.indexOf(relativeTo) + relativeTo.length + 1
        );
    }
    var filePathArray = filePath.split('/'),
    fileName = filePathArray[filePathArray.length - 1];
	
	var directory = filePath.substring(0, filePath.lastIndexOf('/'));
    
    var fileExtention = fileName.split('.');
    fileExtention = fileExtention[fileExtention.length - 1];

    return {
        pathArray: filePathArray,
        filename: fileName,
		directory: directory,
        fileExtention: fileExtention,
		
		filePath: filePath,
		filePathFull: filePathFull
    };
}

var directoryChangedLSkey = 'directoryChanged',
directoryChangedEvent = (new Event('directorychanged'));
function getDirectoryChangedStatus() {
    return sessionStorage.getItem(directoryChangedLSkey) !== null;
}
function resetDirectoryChangedStatus() {
    sessionStorage.removeItem(directoryChangedLSkey);
}
deviceStorage.addEventListener('change',(e)=>{
    var sdf = '/' + formFullgameDirectory() + '/';
    console.log(sdf, e.path.substr(0, sdf.length));
    if(e.path.substr(0, sdf.length) === sdf) {
        if(!getDirectoryChangedStatus()) {
            sessionStorage.setItem(directoryChangedLSkey,true);
            window.dispatchEvent(directoryChangedEvent);
        }
    }
});