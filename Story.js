var ACCEPTABLE_MIDDLE_WORDS = ["of", "the", "van", "von", "du", "le", "la", "in"];

var Story = function(lines) {
	this.lines;
	this.title;
	this.chapters = [];

	if(lines) {
		if(lines != this.lines) {
			this.lines = lines;
			this.title = lines[0];
			lines.splice(0, 1);
			this.chapters = linesToChapters(lines);
		}
	}

	//finds all characters in the story and returns them.
	this.getCharacters = function(oldCharacters) {
		//remove characters with no mentions, if they're not user-defined
		oldCharacters = oldCharacters.filter(function(character) {
			return (character.isMentioned || character.isSelected);
		}, this);

		//get all capital bits, then add them if they're not included
		var chapters = this.chapters;
		chapters.forEach(function(chapter) {
			chapter.events.forEach(function(event) {
				var caps = [];
				getCapitalWords(event.string, caps);
				// var caps = getCapitalWords(event.string);
				caps.forEach(function(cap) {
					var included = false;
					oldCharacters.forEach(function(character) {
						if(character.names.includes(cap)) included = true;
					});
					if(!included) {
						var character = new Character([cap]);
						oldCharacters.push(character);
					}
				});
			});
		});
		return oldCharacters;
	};
}

var Chapter = function(title, events) {
	this.title = title;
	this.events = events;

	this.equals = function(comparisonChapter) {
		if(!comparisonChapter || !this) return false;
		if(this.title != comparisonChapter.title) return false;
		if(this.events.length != comparisonChapter.events.length) return false;
		for(var i=0; i<this.events.length; i++) if(this.events[i].string != comparisonChapter.events[i].string) return false;
		return true;
	}
}

var Event = function(string) {
	this.string = string;
}

//Converts a string array into chapter objects and returns them.
var linesToChapters = function(lines) {
	var chapters = [];

	var events = [];
	var chapter = null;
	lines.forEach(function(line) {
		//go until there's a caps
		if(!line.match(".*([a-z]).*") && line) {
			//if there's already a chapter existing
			if(chapter) {
				//add a new chapter in, then clear it
				chapters.push(new Chapter(chapter, events));
				events = [];
			}
			//make current chapter
			chapter = line;
		//if it's a nonempty line and there's already a chapter
		} else if(line && chapter) {
			//add it
			events.push(new Event(line));
		}
	});
	//add the final business
	if(chapter) {
		chapters.push(new Chapter(chapter, events));
	}

	return chapters;
}

//Get all capital words, greedily treating capital words next to each other and un-greedily connected by strings like "for", from a string.
var getCapitalWords = function(string, array) {
	if(!string) return;
	var reg = "(([A-Z][a-z]*)(?:(?:\\s(?:";
	ACCEPTABLE_MIDDLE_WORDS.forEach(function(word) {
		reg += word + "|";
	});
	reg = reg.substring(0, reg.length-1);
	reg += "))*(?:\\s([A-Z][a-z]*)))*)";
	var regex = new RegExp(reg, "g");

  	var match;
    
	while (match = regex.exec(string)) {
    	for(var i=1; i<match.length; i++) {
	    	if(match[i] && !array.includes(match[i])) {
	      		array.push(match[i]);
	      	}
  	  	}
    
	    //test to go deeper
	    var bigString = match[0];
	    var smallMatch;
	    var smallReg = /([A-Z][a-z]*)/g;
	    while(smallMatch = smallReg.exec(bigString)) {
	    	if(!array.includes(smallMatch[0])) {
	      		var goDeeper = match[0].replace(match[2], "");
	   			getCapitalWords(goDeeper, array);
	        	break;
	      	}
		}
	}
} 