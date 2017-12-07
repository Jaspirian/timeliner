var lines;
var story;
var characters;
var timeline;
var groups;
var mentions;

window.onload = function() {
	story = new Story();
	characters = [];
	timeline = new Timeline();
	groups = new Groups();
	mentions = new Mentions();

	document.getElementById("overlay-back").onclick = function() {fade()};

	parse();

	document.getElementById("notesArea").onkeyup = function() {
		delay(function(){
      		parse();
    	}, 100 );
  		// parse();
	}

	document.getElementById("mentions").onresize = function() {
		console.log("hi");
		var resizedHeight = canvas.parent().offsetHeight - 4;
		if(height > resizedHeight) resizedHeight = height;
		resizeCanvas(canvas.parent().offsetWidth - 17, resizedHeight);
	}
}

//from CMS of Stack Overflow
var delay = (function(){
  var timer = 0;
  return function(callback, ms){
    clearTimeout (timer);
    timer = setTimeout(callback, ms);
  };
})();

var parse = function() {
	//story
	var newLines = document.getElementById("notesArea").value.split("\n");
	document.getElementById("title").textContent = newLines[0];
	// console.log(newLines);
	var newStory = new Story(newLines);

	//update Story
	story = newStory;

	// console.log(newStory);
	
	//characters
	characters = newStory.getCharacters(characters);

	//timeline
	timeline.pushStory(newStory);


	//groups
	groups.pushStory(newStory);

	// console.log("we did it");
	// console.log(newStory);
	// console.log(characters);
}

//replace texts with an uploaded text file.
var fileUpload = function(file) {
	// alert("hi");
	// console.log(file);

	var fileReader = new FileReader();
	fileReader.onload = function(fileLoadedEvent) {
		// console.log("loading!");
	    var textFromFileLoaded = fileLoadedEvent.target.result;
	    readFile(textFromFileLoaded);
	    // parse();
	};

  	fileReader.readAsText(file, "UTF-8");
  	document.getElementById("upload").value = "";
}

var readFile = function(text) {
	var notes = [];
	var characterLines = [];

	lines = text.split("\n");
	var characterStarted = false;
	lines.forEach(function(line) {
		if(line.includes("/*CHARACTERS*/")) {
			characterStarted = true;
		} else {
			if(!characterStarted) {
				notes.push(line);
			} else {
				characterLines.push(line);
			}
		}
	});

	document.getElementById("notesArea").value = notes.join("\n");

	parse();

	characterLines.forEach(function(line) {
		var name = stringToName(line);
		createCharacter(name);
	});
}

var fileSave = function() {
	var title = sanitizeTitle(document.getElementById("notesArea").value.split("\n")[0]);
	
	var text = document.getElementById("notesArea").value.split("\n");
	var usedCharacters = [];
	characters.forEach(function(character) {
		if(character.isSelected) {
			usedCharacters.push(character.names);
		}
	});

	text = text.join("\n");
	if(usedCharacters) {
		text += "\n";
		text += "\n";
		text += "/*CHARACTERS*/";
		text += "\n";
		text += usedCharacters.join("\n");
	}
	var blob = new Blob([text], {type: "text/plain;charset=utf-8"});
	saveAs(blob, title + ".txt");
}

var sanitizeTitle = function(title) {
	while(title && title[title.length-1] == ".") {
		title = title.slice(0, -1);
	}

	if(!title) title = "timeline";
	return title;
}