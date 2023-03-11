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

//promise finally
//	https://learnersbucket.com/examples/interview/promise-finally-polyfill/
Promise.prototype.finally = function(callback) {
	if (typeof callback !== 'function') {
		return this.then(callback, callback);
	}
	// get the current promise or a new one
	const P = this.constructor || Promise;

	// return the promise and call the callback function
	// as soon as the promise is rejected or resolved with its value
	return this.then(
		value => P.resolve(callback()).then(() => value),
		err => P.resolve(callback()).then(() => { throw err; })
	);
};