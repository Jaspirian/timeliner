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
			div.resetListItems();
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
}

var GroupDiv = function(character) {
	this.div;
	this.character = character;

	this.div = makeElement("div", "group");
	this.div.style.backgroundColor = character.color;

	this.makeTopDiv = function() {
		var topBar;

		topBar = makeElement("div", "topDiv");

		this.topLeft = makeElement("div", "titleDiv");
		topBar.appendChild(this.topLeft);
		this.title = makeElement("div", "title", character.names[0], character.names.join(", "));
		this.title.contentEditable = true;
		this.title.onkeypress = function(event) {
			if(event.key === "Enter") {
				addCharacter(createCharacter(this.textContent));
				return false;
			}
		}
		this.topLeft.appendChild(this.title);

		this.topRight = makeElement("div", "squaresDiv");
		topBar.appendChild(this.topRight);

		this.close = makeElement("div", "close");
		this.close.onclick = (function (char) {
			return function() {
				if(groups.poppedOut) fade();
				var spans = timeline.getSpans();
				unselectCharacter(char);
			};
		})(character); //This pass here makes it run immediately, but I honestly don't understand that too well yet
		this.topRight.appendChild(this.close);

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
				timeline.styleCharacter(char);
			}
		}(character, this.div, this.color);
		this.topRight.appendChild(this.color);

		return topBar;
	}
	this.div.appendChild(this.makeTopDiv());

	this.list = makeElement("ul");
	var div = this.div;
	this.list.onclick = function() {
		if(!groups.poppedOut) fade(div);
	}

	this.resetListItems = function() {
		if(this.list) this.list.removeAllChildren();

		var eventsMentioned = this.character.getMentions().filter(function(mention) {
			return mention instanceof Event;
		});
		eventsMentioned.forEach(function(event) {
			var item = makeElement("li", null, null, event.string);
			this.list.appendChild(item);
		}, this);		
	}
	this.resetListItems();

	this.makeBottomDiv = function() {
		var bottomDiv;

		//bottom bit
		bottomDiv = makeElement("div", "bottomDiv");

		//list
		bottomDiv.appendChild(this.list);

		return bottomDiv;
	}
	this.div.appendChild(this.makeBottomDiv());
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
