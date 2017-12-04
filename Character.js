var TEXTHEIGHT = 12;
var MIN_LIGHTNESS = 40;
var MAX_LIGHTNESS = 80;

//An object containing an array of names, a color, an array of Mentions, and whether it's selected or user-made.
var Character = function(names) {
	this.names = names;
	this.color = randColor(MIN_LIGHTNESS, MAX_LIGHTNESS);

	this.isSelected = false;
	this.isUserMade = false;

	this.getMentions = function() {
		var mentions = [];
		story.chapters.forEach(function(chapter) {
			var containedInChapter = false;
			chapter.events.forEach(function(event) {
				var containedInEvent = false;
				this.names.forEach(function(name) {
					var regexp = new RegExp(".*\\b(" + name + ")\\b.*");
					if(regexp.test(event.string)) {
						containedInChapter = true;
						containedInEvent = true;
					};
				});
				if(containedInEvent) mentions.push(event);
			}, this);
			if(containedInChapter) mentions.push(chapter);
		}, this);

		return mentions;
	}

	this.isMentioned = function() {
		for(var i=0; i<story.chapters.length; i++) {
			for(var j=0; j<story.chapters[i].events.length; j++) {
				if(story.chapters[i].events[j].containsAny(this.names)) return true;
			}
		}
		return false;
	}
}

//returns an array, splitting by commas if applicable
var stringToName = function(string) {
	var array;

	if(string.includes(",")) {
		array = string.split(",");
		array = array.map(function(str) {
			return str.trim();
		});
	} else {
		array = [string];
	}

	return array;
}

var addCharacter = function(character) {
	// console.log("adding " + character.names.join(", "));
	characters.push(character);

	timeline.drawDivs();
	timeline.styleCharacter(character);

	groups.renewDivs();

	mentions.setCharacters(); 
}

var removeCharacter = function(character) {
	characters = characters.filter(function(char) {
		return char != character;
	});

	timeline.drawDivs();

	mentions.setCharacters();
}

var createCharacter = function(names) {
	// characters.forEach(function(character) {
	// 	console.log(character.names.join(", "));
	// });

	// console.log(names);
	if(!names) return;
	var character = new Character(names);
	// console.log(character);

	//exact match
	var exactMatch = getCharacter(character.names, true);
	// console.log(exactMatch);
	if(exactMatch) {
		// console.log("exact match");
		if(exactMatch.isSelected) return;
		selectExistingCharacter(exactMatch);
		return;
	}

	//partial match
	var partialMatch = getCharacter(character.names);
	// console.log(partialMatch);
	if(partialMatch) {
		// console.log("Partial match");
		// console.log(partialMatch.names.join(", "));
		if(character.names.length > partialMatch.names.length) {
			// console.log("more names on this one!");
			changeName(partialMatch, character.names);
			partialMatch.isSelected = true;
			groups.addDiv(partialMatch);
			return;
		} else {
			// console.log("fewer names on this one!");
			if(partialMatch.isSelected) {
				// console.log("Already selected.");
				trimDuplicates(character);
				character.isSelected = true;
				addCharacter(character);
				return;
			} else {
				// console.log("Not already selected.");
				partialMatch.isSelected = true;
				changeName(partialMatch, character.names);
				groups.addDiv(partialMatch);
				return;
			}
			
		}
		
	}

	//new
	console.log("new!");
	character.isSelected = true;
	character.isUserMade = true;
	addCharacter(character);
}

var changeName = function(character, names) {
	console.log(character);
	console.log(names);

	character.names = names;
	trimDuplicates(character);

	console.log(character.names.join(", "));
	timeline.styleCharacter(character);

	if(character.isSelected) groups.updateDiv(character);
}

var selectExistingCharacter = function(character) {
	character.isSelected = true;

	timeline.styleCharacter(character);

	groups.addDiv(character);
}

var trimDuplicates = function(replacement) {
	// console.log("trimming!");
	// console.log(replacement.names.join(", "));

	//remove conflicting names from remaining
	characters.forEach(function(character) {
		if(character != replacement) {
			character.names = character.names.filter(function(name) {
				if(replacement.names.includes(name)) console.log("included: " + character.names.join(", ") + " at " + name);
				return !replacement.names.includes(name);
			});
			// console.log(character.names.join(", "));
		}
	});

	//get characters with no names left
	var removes = characters.filter(function(character) {
		return character.names.length < 1;
	});

	//trim the characters array
	characters = characters.filter(function(character) {
		return character.names.length > 0;
	});

	//remove all divs of characters with no names
	removes.forEach(function(character) {
		if(character.isSelected) groups.removeDiv(character);
	});
	timeline.drawDivs();

	//update all the rest
	characters.forEach(function(character) {
		if(character.isSelected) groups.updateDiv(character);
	});
}

//returns a character with names containing the name array provided.
var getCharacter = function(names, isExact) {
	var found;

	if(isExact) {
		found = characters.find(function(character) {
			return character.names.isEqual(names);
		});
	} else {
		found = characters.find(function(character) {
			return character.names.duplicates(names).length > 0;
		});
	}


	return found;
}