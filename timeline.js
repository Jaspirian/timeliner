var Timeline = function() {
	this.story;
	this.container = document.getElementById("timeline");
	this.chapterDivs = [];

	this.hoveredCharacter;

	this.pushStory = function(newStory) {
		this.replaceChapters(newStory.chapters);
		this.drawDivs(this.container);
		this.story = Object.assign({}, newStory);
	}

	this.replaceChapters = function(newChapters) {
		var newDivs = [];
		for(var i=0; i<newChapters.length; i++) {
			var newChapter = newChapters[i];
			if(!this.story || !newChapter.equals(this.story.chapters[i])) {
				this.chapterDivs[i] = new ChapterDiv(newChapter);
			}
			newDivs[i] = this.chapterDivs[i];
		}
		this.chapterDivs = newDivs;
	}

	this.drawDivs = function(element) {
		element.removeAllChildren();

		var arrowTop = document.createElement("div");
		arrowTop.className = "arrow top";
		var arrowBottom = document.createElement("div");
		arrowBottom.className = "arrow bottom";

		element.appendChild(arrowTop);

		var body = document.createElement("div");
		body.id = "body";

		this.chapterDivs.forEach(function(chapDiv) {
			body.appendChild(chapDiv.div);
		});

		element.appendChild(body);
		element.appendChild(arrowBottom);
	}

	this.reformatCharacter = function(character) {
		var nameSpans = $("#timeline").find("span");
		for(var i=0; i<nameSpans.length; i++) {
			if(character.names.includes(nameSpans[i].textContent)) {
				var color = "";
				var bold = "";
				if(character.isSelected) {
					color = character.color;
					bold = "bold";
				}
				nameSpans[i].style.color = color;
				nameSpans[i].style.fontWeight = bold; 
			}
		}	
	}
}

var clickableHover = function(element, event) {
	// console.log("hovering");
	event.stopPropagation();
	//get all spans
	var hovered = characters.find(function(character) {
		return character.names.includes(element.textContent);
	});
	var nameSpans = $("#timeline").find("span");
	for(var i=0; i<nameSpans.length; i++) {
		if(hovered.names.includes(nameSpans[i].textContent)) {
			nameSpans[i].style.color = hovered.color;
		}
	}
	timeline.hoveredCharacter = hovered;
}

var clickableLeave = function() {
	// console.log("leaving");
	timeline.hoveredCharacter = null;

	var nameSpans = $("#timeline").find("span");
	for(var i=0; i<nameSpans.length; i++) {
		var character = characters.find(function(char) {
			return char.names.includes(nameSpans[i].textContent);
		});
		if(character.names.includes(nameSpans[i].textContent)) {
			if(!character.isSelected) nameSpans[i].style.color = "";
		}
	}
}

var clicks = function(event) {
	// console.log("clicking");
	event.stopPropagation();
	var character = timeline.hoveredCharacter;
	if(character) {
		var bold = "";
		var color = "";
		character.isSelected = !character.isSelected;
		if(character.isSelected) {
			groups.addDiv(character);
			bold = "bold";
			color = character.color;
		} else {
			groups.removeDiv(character);
		}
		var nameSpans = $("#timeline").find("span");
		for(var i=0; i<nameSpans.length; i++) {
			if(character.names.includes(nameSpans[i].textContent)) {
				nameSpans[i].style.fontWeight = bold;
				nameSpans[i].style.color = color;
			}
		}
	}
}

var wrapWithSpan = function(string, find, character) {
	var finds = find.split(" ");
	var regexStr = "\\b("
	for(var i=0; i<finds.length; i++) {
		regexStr += finds[i];
	if(i<finds.length-1) regexStr += "\\s*(?:<.*?>)*\\s*";
	}
	regexStr += "(?![^<]*>))\\b";

	var regexp = new RegExp(regexStr, "g");

	var style = "";
	if(character.isSelected) style = "color:" + character.color + "; font-weight:bold";

	string = string.replace(regexp, function(match) {
		return '<span onmouseover="clickableHover(this, event)" onclick="clicks(event)" onmouseout="clickableLeave()" class="clickable" style="' + style + '">' + match + "</span>";		
	});

	return string;
}

var ChapterDiv = function(chapter) {
	var div = document.createElement("div");
	div.className = "chapter";
	this.div = div;

	this.titleDiv = new TitleDiv(chapter.title);
	this.eventDivs = [];
	for(var i=0; i<chapter.events.length; i++) this.eventDivs.push(new EventDiv(chapter.events[i], i));

	this.div.appendChild(this.titleDiv.div);
	for(var i=0; i<this.eventDivs.length; i++) this.div.appendChild(this.eventDivs[i].div);
}

var TitleDiv = function(string) {
	var div = document.createElement("div");
	div.className = "title";
	div.textContent = string;
	this.div = div;
}

var EventDiv = function(event, i) {
	this.div = document.createElement("div");
	this.div.className = "event";
	if(i % 2 != 0) this.div.className += " right";
	this.div.textContent = event.string;

	this.replaceNamesWithSpans = function() {

		var innerHTML = this.div.innerHTML;

		//get names to replace
		var clickableNames = [];
		characters.forEach(function(character) {
			character.names.forEach(function(name) {
				clickableNames.push({name:name, character:character});
			});
		});

		//order in descending size
		clickableNames.sort(function(a,b) {
			if(a.name.length < b.name.length) return 1;
			if(a.name.length > b.name.length) return -1;
			return 0;
		});

		//replace in innerHTML
		clickableNames.forEach(function(name) {
			var style = "";
			// if(name.character.isSelected) style = "style=\"color:" + name.character.color + "; font-weight:bold;\"";
			// innerHTML = replaceIgnoringArrows(innerHTML, name.name, "<span onmouseover=\"clickableHover(this, event)\" onclick=\"clicks(event)\" onmouseout=\"clickableLeave()\" class=\"clickable " + name.character.names[0] + "\" " + style + ">" + name.name + "</span>");
			innerHTML = wrapWithSpan(innerHTML, name.name, name.character);
		});
		// console.log(innerHTML);
		return innerHTML;
	}

	this.div.innerHTML = this.replaceNamesWithSpans();
}