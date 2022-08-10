initDatabase();

function getSongList() {
    return (new Promise((resolve,reject)=>{
		var sl = database.groupSongs();
		
		if(sl.length === 0) {
			reject('empty');
		} else {
			sl.forEach((e)=>{
				e.source = 'internal';
			});
			resolve(sl);
		}
    }));
}
function getSongDetails(id) {
    return (new Promise((resolve,reject)=>{
		var q = database.songsDb({id: id});

		if(q.count === 0) {
			reject('not found');
		} else {
			resolve(q.first());
		}
    }));
}