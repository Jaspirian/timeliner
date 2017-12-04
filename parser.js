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
	// console.log(newStory);
	
	//characters
	characters = newStory.getCharacters(characters);

	//timeline
	timeline.pushStory(newStory);

	//update Story
	story = newStory;

	//groups
	groups.pushStory(newStory);

	console.log("we did it");
	console.log(newStory);
}

//replace texts with an uploaded text file.
var fileUpload = function(file) {
	// alert("hi");
	// console.log(file);

	var fileReader = new FileReader();
	fileReader.onload = function(fileLoadedEvent) {
		// console.log("loading!");
	    var textFromFileLoaded = fileLoadedEvent.target.result;
	    // console.log(textFromFileLoaded);
	    document.getElementById("notesArea").value = textFromFileLoaded;
	    parse();
	};

  	fileReader.readAsText(file, "UTF-8");
  	document.getElementById("upload").value = "";
}