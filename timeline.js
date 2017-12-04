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

	this.drawDivs = function() {
		this.container.removeAllChildren();

		var arrowTop = makeElement("div", "arrow top");
		var arrowBottom = makeElement("div", "arrow bottom");

		this.container.appendChild(arrowTop);

		var body = makeElement("div", null, "body");

		this.chapterDivs.forEach(function(chapDiv) {
			body.appendChild(chapDiv.div);
		});

		this.container.appendChild(body);
		this.container.appendChild(arrowBottom);
	}

	this.getSpans = function() {
		return $("#timeline").find("span");
	}

	this.styleCharacter = function(character, focusing) {
		// console.log("Styling");
		// console.log(character.names);
		// console.log(character.names.join(", "));
		var nameSpans = timeline.getSpans();
		[].forEach.call(nameSpans, function(span) {
			if(character.names.includes(span.textContent)) {
				span.style.color = "";
				span.style.fontWeight = "";
				if(focusing) span.style.color = character.color;
				if(character.isSelected) {
					span.style.color = character.color;
					span.style.fontWeight = "bold";
				}
			}
		});
	}
}

var clickableHover = function(element, event) {
	event.stopPropagation();

	var hovered = characters.find(function(character) {
		return character.names.includes(element.textContent);
	});
	timeline.styleCharacter(hovered, true);
	
	timeline.hoveredCharacter = hovered;
}

var clickableLeave = function() {
	timeline.styleCharacter(timeline.hoveredCharacter, false);

	timeline.hoveredCharacter = null;
}

var clicks = function(event) {
	event.stopPropagation();
	var character = timeline.hoveredCharacter;
	if(character) {
		if(!character.isSelected) {
			character.isSelected = true;
			timeline.styleCharacter(character);
			groups.addDiv(character);
		} else {
			character.isSelected = false;
			timeline.styleCharacter(character);
			groups.removeDiv(character);
		}
	}
}

var wrapWithSpan = function(string, find, character) {
	
	this.getRegex = function(needle) {
		var regexp;

		var needles = needle.split(" ");
		var regexStr = "\\b("
		for(var i=0; i<needles.length; i++) {
			regexStr += needles[i];
			if(i<needles.length-1) regexStr += "\\s*(?:<.*?>)*\\s*";
		}
		regexStr += "(?![^<]*>))\\b";

		var regexp = new RegExp(regexStr, "g");

		return regexp;
	}

	var style = "";
	if(character.isSelected) style = "color:" + character.color + "; font-weight:bold";

	string = string.replace(this.getRegex(find), function(match) {
		return '<span onmouseover="clickableHover(this, event)" onclick="clicks(event)" onmouseout="clickableLeave()" class="clickable" style="' + style + '">' + match + "</span>";		
	});

	return string;
}

var ChapterDiv = function(chapter) {
	this.div = makeElement("div", "chapter")

	this.titleDiv = new TitleDiv(chapter.title);
	this.eventDivs = [];
	for(var i=0; i<chapter.events.length; i++) this.eventDivs.push(new EventDiv(chapter.events[i], i));

	this.div.appendChild(this.titleDiv.div);
	for(var i=0; i<this.eventDivs.length; i++) this.div.appendChild(this.eventDivs[i].div);
}

var TitleDiv = function(string) {
	this.div = makeElement("div", "title", null, string);
}

var EventDiv = function(event, i) {
	this.div = makeElement("div", "event", null, event.string);
	if(i % 2 != 0) this.div.classList.add("right");

	this.replaceNamesWithSpans = function() {

		var innerHTML = this.div.innerHTML;

		//get names to replace
		var clickableNames = this.getNames();

		//order in descending size
		clickableNames.sort(function(a,b) {
			if(a.name.length < b.name.length) return 1;
			if(a.name.length > b.name.length) return -1;
			return 0;
		});

		//replace in innerHTML
		clickableNames.forEach(function(name) {
			var style = "";
			innerHTML = wrapWithSpan(innerHTML, name.name, name.character);
		});
		// console.log(innerHTML);
		return innerHTML;
	}

	this.getNames = function() {
		var names = [];

		characters.forEach(function(character) {
			character.names.forEach(function(name) {
				names.push({name:name, character:character});
			});
		});

		return names;
	}

	this.div.innerHTML = this.replaceNamesWithSpans();
}