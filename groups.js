var Groups = function(charactersArr) {
	this.divs = [];
	// this.story;
	this.poppedOut;

	var container = document.getElementById("groups");
	container.removeAllChildren(1);

	container.appendChild(new BlankDiv().div);

	this.addDiv = function(character) {
		var addingDiv = new GroupDiv(character);
		this.divs.push(addingDiv);
		addingDiv.div.onclick = function(event) { 
			if(event.target == this) fade(this)
		};
		container.appendChild(addingDiv.div);

		return addingDiv.div;
	}

	this.removeDiv = function(character) {
		var removingDiv;
		this.divs.forEach(function(div) {
			if(div.character == character) removingDiv = div;
		});
		if(!removingDiv) return;
		container.removeChild(removingDiv.div);
		this.divs.filter(function(div) {
			return div.character != character;
		});
	}

	this.pushStory = function(newStory) { //ROOM FOR PERFORMANCE IMPROVEMENTS
		// this.story = Object.assign({}, newStory);
		this.divs.forEach(function(div) {
			div.resetList();
		});
	}
}

var BlankDiv = function() {
	this.div = document.createElement("div");
	this.div.className = "group blank";

	this.textbox = document.createElement("input");
	this.textbox.type = "text";
	this.textbox.id = "nameBox";

	this.textbox.onkeypress = function(event) {
		if(event.key === "Enter") {
			addCharacter(createCharacter(this.value));
			this.value = "";
		}
	};
	this.div.appendChild(this.textbox);

	this.button = document.createElement("button");
	this.button.textContent = "Add character";
	this.button.onclick = (function(nameBox) {
		return function() {
			addCharacter(createCharacter(nameBox.value));
			nameBox.value = "";
		}
	})(this.textbox);
	this.div.appendChild(this.button);

	// this.readout = document.createElement("p");
	// this.readout.className = "tooltip";
	// this.readout.textContent = "Separate pseudonyms with commas.";
	// this.readout.textContent += "\nClick a title and press enter to edit it.";
	// this.div.appendChild(this.readout);
}

var GroupDiv = function(character) {
	this.div;
	this.character = character;

	this.div = document.createElement("div");
	this.div.className = "group";
	this.div.style.backgroundColor = character.color;

	//Top bar
	this.topBar = document.createElement("div");
	this.topBar.className = "topDiv";
	this.div.appendChild(this.topBar);

	this.topLeft = document.createElement("div");
	this.topLeft.className = "titleDiv";
	this.topBar.appendChild(this.topLeft);
	this.title = document.createElement("div");
	this.title.contentEditable = true;
	this.title.className = "title";
	this.title.id = character.names[0];
	this.title.textContent = character.names[0];
	for(var i=1; i<character.names.length; i++) {
		this.title.textContent += ", " + character.names[i];
	}
	this.title.onkeypress = function(event) {
		if(event.key === "Enter") {
			addCharacter(createCharacter(this.textContent));
			return false;
		}
	}
	this.topLeft.appendChild(this.title);

	this.topRight = document.createElement("div");
	this.topRight.className = "squaresDiv";
	this.topBar.appendChild(this.topRight);
	this.color = document.createElement("input");
	this.color.type = "button";
	this.color.style.width = "20px";
	this.color.style.height = "20px";
	var args = {valueElement: null, value: this.div.style.backgroundColor, width: 100};
	this.picker = new jscolor(this.color, args);
	this.picker.onFineChange = function(char, elem, button) {
		return function() {
			var backColor = button.style.backgroundColor;
			elem.style.backgroundColor = backColor;
			char.color = backColor;
			timeline.reformatCharacter(char);
		}
	}(character, this.div, this.color);
	this.topRight.appendChild(this.color);

	this.close = document.createElement("div");
	this.close.className = "close";
	this.close.onclick = (function (char) {
		return function() {
			if(groups.poppedOut) fade();
			char.isSelected = false;
			var spans = $("#timeline").find("span");
			char.names.forEach(function(name) {
				for(var i=0; i<spans.length; i++) {
					if(spans[i].textContent == name) {
						spans[i].style.color = "";
						spans[i].style.fontWeight = "";
					}
				}
			});
			groups.removeDiv(character);
		};
	})(character); //This pass here makes it run immediately, but I honestly don't understand that too well yet
	this.topRight.appendChild(this.close);

	//bottom bit
	this.bottomBar = document.createElement("div");
	this.bottomBar.className = "bottomDiv";
	this.div.appendChild(this.bottomBar);

	//list
	this.list;
	this.resetList = function() {
		var referencedEvents = [];
		if(this.list) this.list.remove();

		var list;
		// var chapters = groups.story.chapters;
		// var chapters = story.chapters;
		// console.log(chapters);
		list = document.createElement("ul");
		// groups.story.chapters.forEach(function(chapter) {
		story.chapters.forEach(function(chapter) {
			chapter.events.forEach(function(event) {
				character.names.forEach(function(name) {
					if(event.string.includes(name) && !referencedEvents.includes(event)) {
						var item = document.createElement("li");
						item.textContent = event.string;
						referencedEvents.push(event);
						list.appendChild(item);
					}
				});
			});
		});

		var div = this.div;
		list.onclick = function() {
			if(!groups.poppedOut) fade(div);
		}
		this.bottomBar.appendChild(list);
		this.list = list;
	}
	this.resetList();
}

var addCharacter = function(character) {
	if(!character) return;
	replaceRedundantCharacters(character);
	if(!characters.includes(character)) {
		characters.push(character);
	}
	groups.removeDiv(character);
	var div = groups.addDiv(character);
	if(groups.poppedOut) {
		fade(div);
	}
	timeline.reformatCharacter(character);
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
	addedCharacter.isSelected = true;

	return addedCharacter;
}

//trims characters with only names contained by the provided character, skipping over the character itself.
var replaceRedundantCharacters = function(replacing) {
	var replaced = [];

	replaced = characters.filter(function(character) {
		return replacing.names.duplicates(character.names).length == character.names.length && replacing != character;
	});

	replaced.forEach(function(character) {
		if(character.isSelected) groups.removeDiv(character);
	});

	characters = characters.filter(function(character) {
		return !replaced.includes(character);
	});
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

var fade = function(div) {
	if(div) {
		groups.poppedOut = div;
		groups.poppedOut.classList.add("poppedOut");
		$("#overlay-back").fadeIn(300);
	} else {
		$("#overlay-back").fadeOut(300, function() {
			groups.poppedOut.classList.remove("poppedOut");
			groups.poppedOut = null;
		});
	}
}
