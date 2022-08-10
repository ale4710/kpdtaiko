(function(){
	var bsd = bottomStageData,
	chatMessages,
	chatMessagesAvailable = {};
	
	function resetCMP(which) {
		chatMessagesAvailable[which] = [...(Array(chatMessages[which].length).keys())]
	}

	var startingMessage = document.createElement('div');
	startingMessage.textContent = 'The stream will begin soon...';
	startingMessage.classList.add('vertical-center', 'text-center', 'init-msg');
	bottomStageElement.appendChild(startingMessage);
	
	function pushMessages(type, min, max, priority) {
		min = min || 2;
		max = max || 8;
		var mtp = min + randomInt(max - min);
		while(mtp > 0) {
			if(priority) {
				pendingMessages.unshift(type);
			} else {
				pendingMessages.push(type);
			}
			
			mtp--;
		}
	}
	
	function initbs() {
		startingMessage.remove();
		startingMessage = null;
		
		setInterval(performanceCheck, 2500);
		
		pushMessages('starting');
	}
	
	var chatSpace = document.createElement('div');
	chatSpace.classList.add('fill', 'chat-space');
	bottomStageElement.appendChild(chatSpace);
	function chatSpaceSB() {
		chatSpace.scrollTop = chatSpace.scrollHeight;
	}
	
	var firstRestart = true;
	function r() {
		firstMiss = true;
		pendingMessages.length = 0;
		
		if(firstRestart) {
			firstRestart = false;
		} else {
			pushMessages('reset');
		}
	}
	
	var firstMiss = true;
	window.addEventListener('gamemissed', (e)=>{
		if(firstMiss || e.detail.combo > 25) {
			pendingMessages.length = 0; //clear messages, since performance might have changed
			pushMessages('missed', 4, 8, true);
			firstMiss = false;
		}
	});
	
	var lastMessagePosted = -Infinity,
	messageDelay,
	pendingMessages = [];
	function nextMessageDelay() {messageDelay = (Math.random() * 1000 * 1.2);}
	nextMessageDelay();
	
	function getMsg(type) {
		if(!(type in chatMessages)) {
			type = 'general';
		}
		
		var ma = chatMessages[type], tki = chatMessagesAvailable[type];
		if(tki.length === 0) {
			resetCMP(type);
			tki = chatMessagesAvailable[type];
		}
		var tkiw = randomInt(tki.length),
		mk = tki[tkiw];
		tki.splice(tkiw, 1);
		return ma[mk];
	}
	function createMsg(type, rawtext) {
		var msg = document.createElement('div');
		msg.classList.add('chat-message');
		
		var txt = document.createElement('div');
		txt.classList.add('text');
		txt.textContent = getMsg(type);
		msg.appendChild(txt);
		
		var img = document.createElement('img');
		img.classList.add('img');
		img.src = 'bottomstage/' + bottomStageFolder + '/img/profile/' + randomInt(15) + '.png';
		msg.appendChild(img);
		
		return msg;
	}
	function postMsg() {
		if(chatSpace.children.length > 20) {
			chatSpace.children[0].remove();
		}
		
		var msgType;
		if(Math.random() < 0.75) {
			msgType = pendingMessages.shift();
		}
		chatSpace.appendChild(createMsg(msgType));
		chatSpaceSB();
	}
	
	var perfValues = {
		good: 1,
		okay: 0,
		miss: -1
	};
	function performanceCheck() {
		if(
			!pauseMenuVisible &&
			!ended &&
			hitData.length >= 10
		) {
			var p = 0;

			for(var i = hitData.length - 1; i > hitData.length - 1 - 10; i--) {
				p += perfValues[hitData[i]] || 0;
			}
			
			if(p < -5) {
				p = 0;
			} else if(p < 5) {
				p = 1;
			} else {
				p = 2;
			}
			pushMessages(
				'performance'+p,
				3,
				6
			);
		}
	}
	
	
	function update() {
		if(!ended) {
			var now = window.performance.now();
			if(now - lastMessagePosted > messageDelay) {
				postMsg();
				nextMessageDelay();
				lastMessagePosted = now;
			}
		}
	}
	
	function fin() {
		var e = document.createElement('div');
		e.textContent = 'The stream has ended.';
		e.classList.add('system-message');
		chatSpace.appendChild(e);
		chatSpaceSB();
	}
	
	xmlhttprqsc(
		'bottomstage/' + bottomStageFolder + '/messages.json',
		'text',
		(e)=>{
			chatMessages = JSON.parse(e.target.response);
			e = null;
			
			Object.keys(chatMessages).forEach(resetCMP);
			
			console.log(chatMessages);
			
			bottomStageInit(
				(function(){
					return {
						reset: r,
						dataUpdated: emptyfn,
						init: initbs,
						finish: fin,
						draw: emptyfn,
						check: update
					};
				})
			);
		}
	);
})();