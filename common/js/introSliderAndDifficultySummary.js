var difficultySummary = (()=>{
	let interface = {};
	
	interface.makeDifficultyClassName = function makeDifficultyClassName(d) {
	return `difficulty-lv${d}`
}
	
	function createDifficultyHTMLElement(innerText, difficultyLevel) {
		let mainEl = document.createElement('span');
		
		mainEl.classList.add('difficulty-summary-entry');
		if(difficultyLevel !== undefined) {
			mainEl.classList.add(interface.makeDifficultyClassName(difficultyLevel));
		}
		
		if(!innerText) {
			if(typeof(difficultyLevel) === 'number') {
				let dltp = difficultyLevel + 1;
				if(dltp > 5) {
					dltp = '?';
				}
				innerText = 'L' + dltp;
			} else {
				innerText = '?';
			}
		}
		mainEl.textContent = innerText;
		return mainEl;
	}
	interface.createDifficultyHTMLElement = createDifficultyHTMLElement;
	
	interface.DifficultySummary = class DifficultySummary {
		constructor(insertElement = document.body) {
			this.element = document.createElement('span');
			this.element.classList.add('difficulty-summary-container');
			insertElement.appendChild(this.element);
		}
		
		addDifficulty(innerText, difficultyLevel) {
			this.element.appendChild(
				createDifficultyHTMLElement(innerText, difficultyLevel)
			);
		}
		
		clearDifficulties() {
			while(this.element.children.length !== 0) {
				this.element.children[0].remove();
			}
		}
	}
	
	return interface;
})();

class IntroSlider {
	constructor(insertElement = document.body) {
		//main element
		this.element = document.createElement('div');
		insertElement.appendChild(this.element);
		this.element.classList.add(
			'song-intro-slider',
			'hidden'
		);
		//text container
		let textContainer = document.createElement('div');
		this.element.appendChild(textContainer);
		textContainer.classList.add(
			'vertical-center',
			'intro-slider-text'
		);
		//text - main
		{
			let mainTextElement = document.createElement('div');
			textContainer.appendChild(mainTextElement);
			//difficulty prefix icon
			this.difficultySummary = new difficultySummary.DifficultySummary(mainTextElement);
			//text
			this.titleElement = document.createElement('span');
			mainTextElement.appendChild(this.titleElement);
		}
		//text - sub
		this.subtitleElement = document.createElement('div');
		textContainer.appendChild(this.subtitleElement);
		this.subtitleElement.classList.add('song-intro-slider-subtitle');
	}
	
	toggleShow(show) {
		this.element.classList.toggle('hidden', !show);
	}
	
	toggleDifficultyShow(show) {
		this.difficultySummary.element.classList.toggle('hidden', !show);
	}
	
	updateData(title, subtitle, difficultyText, difficultyId) {
		//text
		this.titleElement.textContent = title;
		this.subtitleElement.textContent = subtitle;
		//difficulty
		if(!this.difficultySummary.element.classList.contains('hidden')) {
			this.difficultySummary.clearDifficulties();
			this.difficultySummary.addDifficulty(difficultyText, difficultyId);
		}
	}
}