//removes child elements from a DOM element, skipping all those before BEGINDEX and stopping ENDEX before the end
HTMLElement.prototype.removeAllChildren = function(begindex, endex) {
	if(!begindex) begindex = 0;
	if(!endex) endex = 0;
	var end = this.childNodes.length - endex;

	for(var i=begindex; i<end; i++) this.removeChild(this.childNodes[begindex]);
};

//returns a random integer from min (if defined) to max-1
var randInt = function(maxExclusive, minInclusive) {
	if(!minInclusive) minInclusive = 0;
	return Math.floor(Math.random() * (maxExclusive - minInclusive)) + minInclusive;
}

//returns a random color with brightness values between min (if defined) and max;
var randColor = function(minLightness, maxLightness) {
	return "hsl(" + randInt(361) + ", " + randInt(101) + "%, " + randInt(maxLightness, minLightness) + "%)";
}

//returns an array of elements duplicated in both arrays.
Array.prototype.duplicates = function(compareArray) {
	var copies = [];
	
	compareArray.forEach(function(elem) {
		if(this.indexOf(elem) != -1) copies.push(elem);
	}, this);

	return copies;
}

//returns a match, if any, of array elements against a string.
String.prototype.containsAny = function(array) {
	
	return array.find(function(element) {
		return this.includes(element);
	}, this);

	return null;
}

//returns an element with the given features.
var makeElement = function(elementType, className, id, textContent) {
	var elem;

	elem = document.createElement(elementType);
	if(className) elem.className = className;
	if(id) elem.id = id;
	if(textContent) elem.textContent = textContent;

	return elem;
}

//returns whether two arrays are equal. Works for arrays of objects. Modified from StackOverflow's Tomas Zato.
Array.prototype.isEqual = function(compareArray) {
	if(!this && !compareArray) return true;
	if(!this || !compareArray) return false;
	if(this.length != compareArray.length) return false;

	for (var i = 0, l=this.length; i < l; i++) {
        if (this[i] instanceof Array && compareArray[i] instanceof Array) {
            if (!this[i].isEqual(compareArray[i]))
                return false;       
        }           
        else if (this[i] != compareArray[i]) { 
            return false;   
        }           
    }       
    return true;
}

//returns an array, converting a string if given one--or simply the array if it already is.
var convertToArray = function(stringOrArray) {
	var array;

	if(Array.isArray(stringOrArray)) {
		array = stringOrArray;
	} else {
		array = [stringOrArray];
	}

	return array;
}