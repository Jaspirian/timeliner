var Groups = function(charactersArr) {
	this.divs = [];
	// this.story;
	this.poppedOut;
	this.container;

	this.container = document.getElementById("groups");

	this.container.appendChild(new BlankDiv().div);

	this.addDiv = function(character) {
		// console.log("adding div " + character.names.join(", "));
		var alreadyExists = this.divs.find(function(div) {
			return div.character.names == character.names;
		});
		if(alreadyExists) return;

		var addingDiv = new CharacterDiv(character);
		this.divs.push(addingDiv);
		addingDiv.div.onclick = function(event) { 
			if(event.target == this) fade(this)
		};
		this.container.appendChild(addingDiv.div);

		return addingDiv.div;
	}

	this.removeDiv = function(character) {
		// console.log("removing div " + character.names.join(", "));
		var removingDiv;
		this.divs.forEach(function(div) {
			if(div.character == character) removingDiv = div;
		});
		// console.log(removingDiv);
		// console.log(this.divs);
		// console.log(this.divs.includes(removingDiv.div));
		if(!removingDiv) return;
		this.container.removeChild(removingDiv.div);
		this.divs = this.divs.filter(function(div) {
			return div.character != character;
		});
		// console.log(this.divs);
	}

	this.updateDiv = function(character) {
		// console.log("updating div " + character.names.join(", "));
		var div = this.divs.find(function(div) {
			return div.character == character;
		});
		// console.log(div);
		if(!div) return;

		div.update();
	}

	this.updateAllDivs = function() {
		this.divs.forEach(function(div) {
			div.update();
		});
	}

	this.renewDivs = function() {
		this.removeAllDivs();
		characters.forEach(function(character) {
			if(character.isSelected) this.addDiv(character);
		}, this);
	}

	this.pushStory = function(newStory) { //ROOM FOR PERFORMANCE IMPROVEMENTS
		// this.story = Object.assign({}, newStory);
		this.divs.forEach(function(div) {
			div.resetListItems();
		});
	}

	this.removeAllDivs = function() {
		console.log("removing all divs.");
		this.container.removeAllChildren(1);
		this.divs = [];
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
			if(!this.value) return;
			createCharacter(stringToName(this.value));
			this.value = "";
		}
	};
	this.div.appendChild(this.textbox);

	this.button = document.createElement("button");
	this.button.textContent = "Add character";
	this.button.onclick = (function(nameBox) {
		return function() {
			if(!nameBoc.value) return;
			createCharacter(stringToName(nameBox.value));
			nameBox.value = "";
		}
	})(this.textbox);
	this.div.appendChild(this.button);
}

var CharacterDiv = function(character) {
	this.div;
	this.character = character;

	this.maximizedState = 0; //0 for neutral, -1 is minimized, 1 is maximized

	this.div = makeElement("div", "group");
	this.div.style.backgroundColor = character.color;

	this.setWindowBar = function() {
		var bar = makeElement("div", "windowBar");

		this.setColor = function() {
			var box = makeElement("input", "color")
			box.type = "button";
			box.style.width = "20px";
			box.style.height = "20px";
			var args = {valueElement: null, value: this.div.style.backgroundColor, width: 100};
			var picker = new jscolor(box, args);
			picker.onFineChange = (function(char, elem, button) {
				return function() {
					var backColor = button.style.backgroundColor;
					elem.style.backgroundColor = backColor;
					char.color = backColor;
					timeline.styleCharacter(char);
				}
			})(this.character, this.div, box);

			return box;
		}
		var color = this.setColor();

		this.setSpacer = function() {
			var box = makeElement("div", "spacer", null);

			return box;
		}
		var spacer = this.setSpacer();

		var minimize = makeElement("div", "minimize", null, "-");
		var maximize = makeElement("div", "maximize", null, "+");

		this.setMinimizeClick = function(minimize, maximize) {
			minimize.onclick = (function(characterDiv, maximize) {
				return function() {
					if(characterDiv.maximizedState == -1) {
						characterDiv.eventsBar.style.maxHeight = "";
						characterDiv.maximizedState = 0;
						minimize.style.color = "";
					} else {
						characterDiv.eventsBar.style.maxHeight = "0px";
						characterDiv.maximizedState = -1;
						minimize.style.color = "white";
						maximize.style.color = "";
					}
				}
			})(this, maximize);
		}
		this.setMinimizeClick(minimize, maximize);

		this.setMaximizeClick = function(maximize, minimize) {
			maximize.onclick = (function(characterDiv, minimize) {
				return function() {
					if(characterDiv.maximizedState == 1) {
						characterDiv.eventsBar.style.maxHeight = "300px";
						characterDiv.maximizedState = 0;
						maximize.style.color = "";
					} else {
						characterDiv.eventsBar.style.maxHeight = "none";
						characterDiv.maximizedState = 1;
						maximize.style.color = "white";
						minimize.style.color = "";
					}
				}
			})(this, minimize);
		}
		this.setMaximizeClick(maximize, minimize);

		this.setClose = function() {
			var box = makeElement("div", "close", null, "X");
			box.onclick = (function (char) {
				return function() {
					if(groups.poppedOut) fade();
					char.isSelected = false;
					groups.removeDiv(char);
					timeline.styleCharacter(char);
				};
			})(this.character);

			return box;
		}
		var close = this.setClose();

		bar.appendChild(color);
		bar.appendChild(spacer);
		bar.appendChild(minimize);
		bar.appendChild(maximize);
		bar.appendChild(close);

		return bar;
	}
	this.windowBar = this.setWindowBar();
	this.div.appendChild(this.windowBar);

	this.setNameBar = function() {
		var bar = makeElement("div", "nameBar", character.names[0], character.names.join(", "));
		bar.contentEditable = true;
		bar.onkeypress = function(event) {
			if(event.key === "Enter") {
				if(!this.textContent) return;
				changeName(character, stringToName(this.textContent));
				this.blur();
				return false;
			}
		}

		return bar;
	}
	this.nameBar = this.setNameBar();
	this.div.appendChild(this.nameBar);

	this.list = makeElement("ul");
	this.list.onclick = (function(div) {
		return function() {
			fade(div);
		}
	})(this.div);
	this.resetListItems = function() {
		if(this.list) this.list.removeAllChildren();

		var eventsMentioned = this.character.getMentions().filter(function(mention) {
			return mention instanceof Event;
		});
		eventsMentioned.forEach(function(event) {
			var item = makeElement("li", null, null, event.string);
			this.list.appendChild(item);
			// console.log(event.string);
		}, this);
	}
	this.resetListItems();

	this.setEventsBar = function() {
		var events = makeElement("div", "eventsBar");

		events.appendChild(this.list);

		return events;
	}
	this.eventsBar = this.setEventsBar();
	this.div.appendChild(this.eventsBar);

	this.update = function() {
		this.nameBar.textContent = this.character.names.join(", ");
		this.resetListItems();
	}
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
