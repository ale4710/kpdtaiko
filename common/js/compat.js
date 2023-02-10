function getb2g() {
	if('b2g' in navigator) {
		return navigator.b2g;
	} else {
		return navigator;
	}
}

if('b2g' in navigator) {
	//stuff
}