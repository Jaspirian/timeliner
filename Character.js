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

var addCharacter = function(character) { //DOES NOT HANDLE RETURNING TO FEWER NAMES
	if(!character) return;
	characters = replaceRedundantCharacters(character);
	if(character.isSelected) groups.removeDiv(character);
	if(!characters.includes(character)) {
		characters.push(character);
	}
	character.isSelected = true;
	var div = groups.addDiv(character);
	if(groups.poppedOut) {
		fade(div);
	}
	timeline.styleCharacter(character);
}

var removeCharacter = function(character) {

}

var selectCharacter = function(character) {
	character.isSelected = true;

	//timeline
	var nameSpans = timeline.getSpans();
	[].forEach.call(nameSpans, function(span) {
		if(character.names.includes(span.textContent)) {
			span.style.fontWeight = "bold";
			span.style.color = character.color;
		}
	});

	//groups
	groups.addDiv(character);
}

var unselectCharacter = function(character) {
	character.isSelected = false;

	//timeline
	var nameSpans = timeline.getSpans();
	[].forEach.call(nameSpans, function(span) {
		if(character.names.includes(span.textContent)) {
			span.style.fontWeight = "";
			span.style.color = "";
		}
	});

	//groups
	groups.removeDiv(character);
}

//returns characters without those who had only names contained by the provided character, skipping over the character itself.
var replaceRedundantCharacters = function(replacing) {
	var replaced = [];

	replaced = characters.filter(function(character) {
		return replacing.names.duplicates(character.names).length == character.names.length && replacing != character;
	});

	replaced.forEach(function(character) {
		if(character.isSelected) groups.removeDiv(character);
	});

	var trimmedCharacters = characters.filter(function(character) {
		return !replaced.includes(character);
	});

	return trimmedCharacters;
}

var createCharacter = function(stringOrArray) {
	//escape if there's no entry
	if(!stringOrArray) return;

	//handle comma-separated
	if(stringOrArray.includes(",")) {
		var names = stringOrArray.split(",");
		for(var i=0; i<names.length; i++) names[i] = names[i].trim();
	} else {
		var name = stringOrArray;
	}
	
	//get character
	var addedCharacter;
	if(names) {
		addedCharacter = getCharacter(names);
	} else {
		addedCharacter = getCharacter(name);
	}

	//escape if this is just a duplicate entry
	if(addedCharacter && addedCharacter.isSelected && (!names || addedCharacter.names == names)) return;
	//create a new character if needed
	if(addedCharacter) {
		if(names) addedCharacter.names = names;
	} else {
		if(names) {
			addedCharacter = new Character(names);
		} else {
			addedCharacter = new Character([name]);
		}
		addedCharacter.isUserMade = true;
	}

	return addedCharacter;
}

//returns a character with names containing the name string or name array provided.
var getCharacter = function(name) {
	var found;

	if(Array.isArray(name)) {
		found = characters.find(function(character) {
			return character.names.duplicates(name).length > 0;
		});
	} else {
		found = characters.find(function(character) {
			return character.names.includes(name);
		});
	}

	return found;
}