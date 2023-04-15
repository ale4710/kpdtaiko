var gameDirectory = '.domtaiko',
gameSubDirectories = {
    songs: 'songs',
	import: 'import',
    userMedia: 'custom'
},
deviceStorage = (getb2g().getDeviceStorage && getb2g().getDeviceStorage('sdcard')) || null,

notifyOnError = true;

function formFullgameDirectory(){
	if(testing) {return '?'}
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
};

function addFile(path, blob) {
	return new Promise((resolve, reject)=>{
		console.log('writing',path);
		let writeRequest = deviceStorage.addNamed(blob, path);
		writeRequest.addEventListener('success', (ev)=>{
			console.log('OK wrote:',path);
			resolve();
		}); 
		writeRequest.addEventListener('error', (ev)=>{
			reject(ev.target);
		});
	});
};

function deleteFile(path) {
	return new Promise((resolve, reject)=>{
		let delRequest = deviceStorage.delete(path);
		delRequest.addEventListener('success', (ev)=>{
			resolve();
		});
		delRequest.addEventListener('error', (ev)=>{
			reject(ev.target);
		});
	});
};

function enumerateFiles(path, handlefn) {
	return new Promise((resolve, reject)=>{
		let dsEnum = deviceStorage.enumerate(path);
		if(checkb2gns()) {
			//3.0
			let fileIterate = dsEnum.values();
			function reciever(iterateRetv) {
				if(iterateRetv.done) {
					resolve();
				} else {
					let handlefnrv = handlefn(iterateRetv.value);
					if(handlefnrv === 'stop') {
						resolve();
					} else {
						next();
					}
				}
			};
			
			function next() {
				fileIterate.next()
				.then(reciever)
				.catch(reject);
			};
			
			next();
		} else {
			//not 3.0
			dsEnum.addEventListener('success', (ev)=>{
				if(ev.target.done) {
					resolve();
				} else {
					let handlefnrv = handlefn(ev.target.result);
					if(handlefnrv === 'stop') {
						resolve();
					} else {
						ev.target.continue();
					}
				}
			});
			
			dsEnum.addEventListener('error', (ev)=>{
				reject(ev);
			});
		}
	});
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

if(deviceStorage) {
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

}
