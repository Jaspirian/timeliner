var canvas;
var Mentions = function() {
	this.line = new Line();
	this.chapters = [];
	this.characters = [];

	this.hovered;

	this.setChapters = function() {
		var chapters = [];

		story.chapters.forEach(function(chapter) {
			chapters.push(new MentionChapter(chapter));
		});

		//setting Y values, mimicking how divs work
		var availableSpace = height - this.line.topMargin - this.line.bottomMargin;
		var numElements = 0;
		chapters.forEach(function(chapter) {
			availableSpace -= (chapter.margin + chapter.weight + chapter.margin);
			numElements++;
			chapter.mentionEvents.forEach(function(event) {
				availableSpace -= (event.margin + event.weight + event.margin);
				numElements++;
			});
		});
		var individualSpace = availableSpace / (numElements - 1);
		if(individualSpace < 0) individualSpace = 0;
		var y = this.line.topMargin;
		chapters.forEach(function(chapter) {
			chapter.y = y;
			y += chapter.margin + chapter.weight + chapter.margin + individualSpace;
			chapter.mentionEvents.forEach(function(event) {
				event.y = y;
				y += event.margin + event.weight + event.margin + individualSpace;
			});
		});

		if(y > height) canvas.resize(width, y + this.line.bottomMargin);

		this.chapters = chapters;
	}

	this.setCharacters = function() {
		this.characters = [];

		var chars = characters.filter(function(character) {
			return character.isSelected;
		});

		chars.forEach(function(character) {
			this.characters.push(new MentionCharacter(character));
		}, this);
	}

	this.setHovered = function(x, y) {
		var hovered;

		var eventHovered;
		this.chapters.forEach(function(chapter) {
			tempHovered = chapter.mentionEvents.find(function(event) {
				return event.contains(x, y);
			});
			if(tempHovered) eventHovered = tempHovered;
		}, this);

		var chapterHovered = this.chapters.find(function(chapter) {
			return chapter.contains(x, y);
		});

		var characterHovered = this.characters.find(function(character) {
			return character.contains(x, y);
		});
		
		if(eventHovered) hovered = eventHovered;
		if(chapterHovered) hovered = chapterHovered;
		if(characterHovered) hovered = characterHovered;
		this.hovered = hovered;
	}
}

function setup() {
	canvas = createCanvas(100, 100);
	canvas.parent(document.getElementById("mentions"));
	resizeCanvas(canvas.parent().offsetWidth - 17, canvas.parent().offsetHeight - 4);
}

function draw() {
	background(0);

	if(mentions) {
		mentions.line = new Line();

		mentions.setChapters();
		mentions.setCharacters();

		// var reversed = mentions.characters.reverse();
		mentions.characters.reverse().forEach(function(character) {
			character.show();
		});
		mentions.chapters.forEach(function(chapter) {
			chapter.show();
		});

		mentions.line.show();

		if(mentions.hoverText) mentions.hoverText.show();

		mentions.setHovered(mouseX, mouseY);
		var hoverText;
		if(mentions.hovered) {
			if(mentions.hovered instanceof MentionCharacter) {
				textStyle(BOLD);
				textSize(18);
				hoverText = new HoverText(mentions.hovered.character.names.join(", "), mentions.hovered.character.color, mouseX + 15, mouseY + 5, width - mouseX - 30);
			} else {
				textStyle(NORMAL);
				textSize(12);
				hoverText = new HoverText(mentions.hovered.string, null, mouseX + 15, mouseY + 5, width - mouseX - 30);
			}
		}
		if(hoverText) hoverText.show();
	}
}

var resizeMentions = function() {
	console.log("hi");
	var resizedHeight = canvas.parent().offsetHeight - 4;
	if(height > resizedHeight) resizedHeight = height;
	resizeCanvas(canvas.parent().offsetWidth - 17, resizedHeight);
}

function windowResized() {
	resizeMentions();
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

	this.topMargin = this.topPoint.y + (this.slope.y * this.numFletches) + this.margin;
	this.bottomMargin = this.topPoint.y + (this.slope.y * this.numFletches) + this.margin;

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
	this.getEvents = function() {
		var mentionEvents = [];

		chapter.events.forEach(function(event) {
			mentionEvents.push(new MentionEvent(event));
		});

		return mentionEvents;
	}
	this.mentionEvents = this.getEvents();
	
	this.getString = function() {
		var string = "";

		chapter.events.forEach(function(event) {
			string += event.string + "\n";
		});

		return string;
	}
	this.string = this.getString();

	this.show = function() {
		noFill();
		stroke(255);
		strokeWeight(this.weight);

		var box = this.getBox();
		line(box.x, box.y, box.x2, box.y);

		this.mentionEvents.forEach(function(event) {
			event.show();
		});
	}

	this.getBox = function() {
		var box = {x:width/2 - this.width/2, y:this.y + this.margin - this.weight, x2:width/2 + this.width/2, y2:this.y + this.margin};
		return box;
	}

	this.contains = function(x, y) {
		var box = this.getBox();
		return x >= box.x - 5 && x <= box.x2 + 5 && y >= box.y - 5 && y <= box.y2 + 5;
	}
}

var MentionEvent = function(event) {
	this.width = 10;
	this.margin = 10;
	this.weight = 2;
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

	this.contains = function(x, y) {
		var box = this.getBox();
		return x >= box.x - 5 && x <= box.x2 + 5 && y >= box.y - 5 && y <= box.y2 + 5;
	}
}

var MentionCharacter = function(character) {
	this.initialMargin = 30;
	this.margin = 15;
	this.weight = 3;

	this.isHovered = false;

	this.character = character;
	this.x = width/2;
	var index = mentions.characters.length;
	this.isRightSide = index % 2 == 0;
	var sideIndex = (index - (index%2)) / 2;
	if(this.isRightSide) {
		this.x += this.initialMargin + (sideIndex * this.margin);
	} else {
		this.x -= this.initialMargin + (sideIndex * this.margin);
	}

	this.circles = [];
	this.getCircles = function() {
		var circles = [];

		mentions.chapters.forEach(function(chapter) {
			if(chapter.string.containsAny(this.character.names)) {
				circles.push(new Circle(this.x, chapter.y + chapter.margin - chapter.weight));
			}
		}, this);

		return circles;
	}
	this.circles = this.getCircles();
	

	this.squares = [];
	this.getSquares = function() {
		var squares = [];

		var mentionsStart;
		var mentionsEnd;
		mentions.chapters.forEach(function(chapter) {
			chapter.mentionEvents.forEach(function(event) {
				if(event.string.containsAny(this.character.names)) {
					if(!mentionsStart) mentionsStart = event; 
					mentionsEnd = event;
				} else {
					if(mentionsStart) {
						squares.push(new Rectangle(width/2, mentionsStart.y + mentionsStart.margin - mentionsStart.weight, this.x, mentionsEnd.y + mentionsEnd.margin - mentionsEnd.weight));
						mentionsStart = null;
						mentionsEnd = null;
					}
				}
			}, this);
		}, this);
		if(mentionsStart) squares.push(new Rectangle(width/2, mentionsStart.y + mentionsStart.margin - mentionsStart.weight, this.x, mentionsEnd.y + mentionsEnd.margin - mentionsEnd.weight));

		return squares;
	}
	this.squares = this.getSquares();
	

	this.show = function() {
		var isHovered = false;
		if(mentions.hovered instanceof MentionCharacter && mentions.hovered.character.names == this.character.names) isHovered = true;

		var diam = this.diam;
		rectMode(CENTER);
		noStroke();
		fill(this.character.color);
		this.circles.forEach(function(circle) {
			circle.show(isHovered);
		}, this);
		rectMode(CORNER);

		rectMode(CORNERS);
		stroke(this.character.color);
		noFill();
		this.squares.forEach(function(square) {
			square.show(isHovered, this.isRightSide);
		}, this);
		rectMode(CORNER);
	}

	this.contains = function(x, y) {
		for(var i=0; i<this.circles.length; i++) if(this.circles[i].contains(x, y)) return true;
		return false;
	}
}

var Circle = function(x, y) {
	this.x = x;
	this.y = y;
	this.diameter = 8;

	this.contains = function(x, y) {
		return (x > this.x - this.diameter && x < this.x + this.diameter && y > this.y - this.diameter && y < this.y + this.diameter);
	}

	this.show = function(isHovered) {
		var diam = this.diameter;
		if(isHovered) diam = diam * 1.5;
		ellipse(this.x, this.y, diam);
	}
}

var Rectangle = function(x, y, x2, y2) {
	this.x = x;
	this.y = y;
	this.x2 = x2;
	this.y2 = y2;
	this.corner = 25;
	this.weight = 3;

	this.show = function(isHovered, isRight) {
		var wt = this.weight;
		if(isHovered) wt = wt * 1.5;
		strokeWeight(wt);
		if(isRight) {
			rect(this.x, this.y, this.x2, this.y2, 0, this.corner, this.corner, 0);
		} else {
			rect(this.x2, this.y, this.x, this.y2, this.corner, 0, 0, this.corner);
		}
	}

	this.contains = function(x, y) {

	}
}