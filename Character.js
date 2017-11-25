var TEXTHEIGHT = 12;
var MIN_LIGHTNESS = 40;
var MAX_LIGHTNESS = 80;

//An object containing an array of names, a color, an array of Mentions, and whether it's selected or user-made.
var Character = function(names) {
	this.names = names;
	this.color = randColor(MIN_LIGHTNESS, MAX_LIGHTNESS);

	this.isSelected = false;
	this.isUserMade = false;
}

var addCharacter = function(names) {

}

var removeCharacter = function(character) {
	
}