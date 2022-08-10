var database;

function initDatabase(){
	var lsk = 'songDatabase';
	
	database = (new databaseTools.SongManager(
		localStorage.getItem(lsk),
		function(dbStringified){
			localStorage.setItem(lsk, dbStringified);
		}
	));
	
	initDatabase = null;
};