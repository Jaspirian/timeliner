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
Array.prototype.duplicates = function(array) {
	var copies = [];

	for(var i=0; i<array.length; i++) {
		if(this.includes(array[i])) copies.push(array[i]);
	}

	return copies;
}