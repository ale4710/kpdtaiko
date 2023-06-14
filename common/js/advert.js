var advertManager = (function(){
	let interface = {};
	interface.ready = false;
	
	const pubId = 'sakuya is cute!!!!!!!';
	const timeout = 10000;
	const appName = 'kpdtaiko';
	
	interface.initialize = function(){
		delete interface.initialize;
		
		//to disable uncomment below
		return Promise.resolve();
		
		return addGlobalReference(0, '/common/lib/kaiads.v5.min')
		.then(function(){
			function getAdvert(slot, container, w, h){
				return new Promise(function(resolve, reject){
					let options = {
						publisher: pubId,
						app: appName,
						timeout: timeout,
						test: 1
					};
					if(slot) {options.slot = slot}
					
					//responsive type
					if(container instanceof HTMLElement) {
						options.container = container;
						options.w = w;
						options.h = h;
					}
					
					options.onerror = (err)=>{
						console.error(err);
						reject(err);
					};
					options.onready = resolve;
					
					getKaiAd(options);
				});
			};
			interface.getAdvert = getAdvert;
			
			const FullscreenAdvertManagerLSKeyPrefix = 'fullscreen-advert-manager-';
			interface.FullscreenAdvertManager = class {
				constructor(slot) {
					if(slot === undefined) {throw 'a slot name is required'}
					this.slot = slot;
					
					this.cooldownTime = 30000;
					this.requestEvery = 1;
					
					//show history
					let showHistory = localStorage.getItem(FullscreenAdvertManagerLSKeyPrefix + slot);
					if(showHistory) {
						showHistory = JSON.parse(showHistory);
					} else {
						showHistory = {
							count: 0,
							requestCount: 0,
							recent: []
						};
						this._saveHistory(showHistory);
					}
					this.showHistory = showHistory;
				}
				
				_formPromiseRejection(msg) {
					let fullMsg = `FullscreenAdvertManager (slot: "${this.slot}"): ${msg}`;
					return Promise.reject({
						message: fullMsg,
						messageOnly: msg
					});
				}
				
				_saveHistory(overrideForInternal) {
					localStorage.setItem(FullscreenAdvertManagerLSKeyPrefix + this.slot, JSON.stringify(
						overrideForInternal || this.showHistory
					));
				}
				
				addHistory() {
					this.showHistory.count++;
					this.showHistory.recent.push((new Date()).getTime());
					if(this.showHistory.recent.length > 5) {this.showHistory.recent.shift()}
					this._saveHistory();
				}
				
				loadAdvert() {
					if(this.pendingAdvert) {
						return _formPromiseRejection('there is an advert pending.');
					} else {
						this.showHistory.requestCount++;
						this._saveHistory();
						
						//request count check
						if(((this.showHistory.requestCount - 1) % this.requestEvery) !== 0) {
							return this._formPromiseRejection('Next time.');
						}
						
						//cooldown check
						{
							let shr = this.showHistory.recent;
							let shrLen = shr.length;
							if(
								(shrLen !== 0) &&
								((new Date()).getTime() - (shr[shrLen - 1])) <= this.cooldownTime
							) {
								return this._formPromiseRejection('Too soon.');
							}
						}
						
						//we can show it ( although i dont wanna D: )
						this.pendingAdvert = true;
						return getAdvert(this.slot)
							.then((advert)=>{this.pendingAdvert = advert;})
							.catch((err)=>{
								this._removePendingAdvert();
								this.showHistory.requestCount--;
								this._saveHistory();
								throw err;
							});
					}
				}
				
				_removePendingAdvert() {
					delete this.pendingAdvert;
				}
				
				displayAdvert() {
					if(this.pendingAdvert) {
						return new Promise((resolve, reject)=>{
							this.pendingAdvert.call('display');
							this.pendingAdvert.on('display', ()=>{
								this._removePendingAdvert();
								this.addHistory();
								resolve();
							});
							this.pendingAdvert.on('error', (err)=>{
								this._removePendingAdvert();
								console.error(err);
								reject(err);
							});
						});
					} else {
						return this._formPromiseRejection('There is no pending advert.');
					}
				}
				
				displayWaitCloseAdvert() {
					return new Promise((resolve)=>{
						this.pendingAdvert.on('close', resolve);
						this.displayAdvert().catch(resolve);
					});
				}
			}
			
			interface.ready = true;
		});
	};
	
	return interface;
})();