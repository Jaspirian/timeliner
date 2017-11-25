var canvas;
var mentionLine;
var mentionChapters = [];
var mentionCharacters = [];
var hoverText;
var mentionedCharacters;
function setup() {
	canvas = createCanvas(100, 100);
	canvas.parent(document.getElementById("mentions"));
	resizeCanvas(canvas.parent().offsetWidth - 17, canvas.parent().offsetHeight - 4);
}

function draw() {
	if(story) updateMentions(story);

	background(0);

	if(mentionCharacters.length > 0) {
		var reversedCharacters = mentionCharacters.reverse();
		reversedCharacters.forEach(function(character) {
			character.show();
		});
	}

	if(mentionChapters.length > 0) {
		mentionChapters.forEach(function(chapter) {
			chapter.show();
			chapter.mentionEvents.forEach(function(event) {
				event.show();
			});
		});
	}

	if(mentionLine) mentionLine.show();

	if(hoverText) hoverText.show();
}

var updateMentions = function(story) {
	mentionLine = new Line();

	mentionChapters = [];
	story.chapters.forEach(function(chapter) {
		mentionChapters.push(new MentionChapter(chapter));
	});
	var availableSpace = height - (mentionLine.margin * 4) - ((mentionLine.numFletches * mentionLine.slope.y) * 2);
	var numElements = 0;
	mentionChapters.forEach(function(chapter) {
		availableSpace -= (chapter.margin + chapter.weight + chapter.margin);
		numElements++;
		chapter.mentionEvents.forEach(function(event) {
			availableSpace -= (event.margin + event.weight + event.margin);
			numElements++;
		});
	});
	var individualSpace = availableSpace / (numElements - 1);
	var y = (mentionLine.margin * 2) + (mentionLine.numFletches * mentionLine.slope.y);
	mentionChapters.forEach(function(chapter) {
		chapter.y = y;
		y += chapter.margin + chapter.weight + chapter.margin + individualSpace;
		chapter.mentionEvents.forEach(function(event) {
			event.y = y;
			y += event.margin + event.weight + event.margin + individualSpace;
		});
	});

	mentionCharacters = [];
	if(characters) characters.forEach(function(character) {
		if(character.isSelected) mentionCharacters.push(new MentionCharacter(character));
	});
}

function windowResized() {
	resizeCanvas(canvas.parent().offsetWidth - 17, canvas.parent().offsetHeight - 4);
	updateMentions(story);
}

function mouseMoved() {
	hoverText = null;
	mentionChapters.forEach(function(chapter) {
		if(chapter.isHovered(mouseX, mouseY)) {
			hoverText = new HoverText(chapter.string, null, mouseX + 15, mouseY + 5, width - mouseX - 30);
		}
		chapter.mentionEvents.forEach(function(event) {
			if(event.isHovered(mouseX, mouseY)) {
				hoverText = new HoverText(event.string, null, mouseX + 15, mouseY + 5, width - mouseX - 30);
			}
		});
	});
}

var HoverText = function(string, color, x, y, width) {
	this.x = x;
	this.y = y;
	this.width = width;
	this.color = color;
	this.string = string;

	this.show = function() {
		fill(255);
		noStroke();
		if(this.color) fill(this.color); 
		text(this.string, this.x, this.y, this.width);
	}
}

var Line = function() {
	this.margin = 20;
	this.topPoint = {x:width/2, y:this.margin};
	this.botPoint = {x:width/2, y:height-this.margin};
	this.slope = {x:20, y:20};
	this.numFletches = 3;

	this.show = function() {
		noFill();
		stroke(255);
		strokeWeight(3);

		line(this.topPoint.x, this.topPoint.y, this.botPoint.x, this.botPoint.y);

		line(this.botPoint.x, this.botPoint.y, this.botPoint.x - this.slope.x, this.botPoint.y - this.slope.y);
		line(this.botPoint.x, this.botPoint.y, this.botPoint.x + this.slope.x, this.botPoint.y - this.slope.y);

		this.fletchTop = {x:this.topPoint.x, y:this.topPoint.y + (this.slope.y)};
		this.fletchBottom = {x:this.topPoint.x, y:this.topPoint.y + (this.slope.y) - this.slope.y};
		for(var i=0; i<this.numFletches; i++) {
			line(this.fletchTop.x, this.fletchTop.y + (i*this.slope.y/2), this.fletchBottom.x - this.slope.x, this.fletchBottom.y + (i*this.slope.y/2));
			line(this.fletchTop.x, this.fletchTop.y + (i*this.slope.y/2), this.fletchBottom.x + this.slope.x, this.fletchBottom.y + (i*this.slope.y/2));
		}
	}
}

var MentionChapter = function(chapter) {
	this.width = 25;
	this.margin = 10;
	this.weight = 3;
	this.y;
	this.string = "";
	this.title = chapter.title;

	this.mentionEvents = [];
	chapter.events.forEach(function(event) {
		this.mentionEvents.push(new MentionEvent(event));
	}, this);

	chapter.events.forEach(function(event) {
		this.string += event.string + "\n";
	}, this);

	this.show = function() {
		noFill();
		stroke(255);
		strokeWeight(this.weight);

		var box = this.getBox();
		line(box.x, box.y, box.x2, box.y);
	}

	this.getBox = function() {
		var box = {x:width/2 - this.width/2, y:this.y + this.margin - this.weight, x2:width/2 + this.width/2, y2:this.y + this.margin};
		return box;
	}

	this.isHovered = function(x, y) {
		var box = this.getBox();
		return x >= box.x - 5 && x <= box.x2 + 5 && y >= box.y - 5 && y <= box.y2 + 5;
	}
}

var MentionEvent = function(event) {
	this.width = 10;
	this.margin = 10;
	this.weight = 1;
	this.y;
	this.string = event.string;

	this.show = function(offset) {
		noFill();
		stroke(255);
		strokeWeight(this.weight);

		var box = this.getBox();
		line(box.x, box.y, box.x2, box.y);
	}

	this.getBox = function() {
		var box = {x:width/2 - this.width/2, y:this.y + this.margin - this.weight, x2:width/2 + this.width/2, y2:this.y + this.margin};
		return box;
	}

	this.isHovered = function(x, y) {
		var box = this.getBox();
		return x >= box.x - 5 && x <= box.x2 + 5 && y >= box.y - 5 && y <= box.y2 + 5;
	}
}

var MentionCharacter = function(character) {
	this.initialMargin = 30;
	this.margin = 15;
	this.weight = 3;
	this.diam = 10;

	this.character = character;
	this.x = width/2;
	var index = mentionCharacters.length;
	this.isRightSide = index % 2 == 0;
	var sideIndex = (index - (index%2)) / 2;
	if(this.isRightSide) {
		this.x += this.initialMargin + (sideIndex * this.margin);
	} else {
		this.x -= this.initialMargin + (sideIndex * this.margin);
	}
	// console.log(this.x);

	this.circles = [];
	mentionChapters.forEach(function(chapter) {
		if(chapter.string.containsAny(this.character.names)) {
			this.circles.push({x:this.x, y:chapter.y + chapter.margin - chapter.weight});
		}
	}, this);

	this.squares = [];
	var mentionsStart;
	var mentionsEnd;
	mentionChapters.forEach(function(chapter) {
		chapter.mentionEvents.forEach(function(event) {
			if(event.string.containsAny(this.character.names)) {
				if(!mentionsStart) mentionsStart = event; 
				mentionsEnd = event;
			} else {
				if(mentionsStart) {
					this.squares.push({x:width/2, y:mentionsStart.y + mentionsStart.margin - mentionsStart.weight, x2:this.x, y2:mentionsEnd.y + mentionsEnd.margin - mentionsEnd.weight, corner:25});
					mentionsStart = null;
					mentionsEnd = null;
				}
			}
		}, this);
	}, this);
	if(mentionsStart) this.squares.push({x:width/2, y:mentionsStart.y + mentionsStart.margin - mentionsStart.weight, x2:this.x, y2:mentionsEnd.y + mentionsEnd.margin - mentionsEnd.weight, corner:25});

	this.show = function() {
		this.circles.forEach(function(circle) {
			rectMode(CENTER);
			noStroke();
			fill(this.character.color);
			ellipse(circle.x, circle.y, this.diam);
			rectMode(CORNER);
		}, this);

		this.squares.forEach(function(square) {
			rectMode(CORNERS);
			stroke(this.character.color);
			strokeWeight(this.weight);
			noFill();
			if(this.isRightSide) {
				rect(square.x, square.y, square.x2, square.y2, 0, square.corner, square.corner, 0);
			} else {
				rect(square.x2, square.y, square.x, square.y2, square.corner, 0, 0, square.corner);
			}
			rectMode(CORNER);
		}, this);
	}

	this.isHovered = function(x, y) {
		
	}
}