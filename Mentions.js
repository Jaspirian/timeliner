var canvas;
var chapters;
var mentions;
var hoverText;
function setup() {
	canvas = createCanvas(100, 100);
	canvas.parent(document.getElementById("mentions"));
	resizeCanvas(canvas.parent().offsetWidth - 17, canvas.parent().offsetHeight - 4);
}

function draw() {
	background(0);

	var line = new Line();
	if(story) {
		chapters = new Chapters(line.lineMargin + line.numFletches*line.slope.y);
		chapters.setDivsY();

		mentions = new Mentions(chapters);
		mentions.show();

		chapters.show();

		if(hoverText) hoverText.show();
	}

	line.show();
}

function windowResized() {
	resizeCanvas(canvas.parent().offsetWidth - 17, canvas.parent().offsetHeight - 4);
}

function mouseMoved() {
	hoverText = null;
	chapters.divs.forEach(function(div) {
		if(div.isHovered(mouseX, mouseY)) {
			hoverText = new HoverText(div.string, null, mouseX + 15, mouseY + 5, width - mouseX - 30);
		}
	});
}

var HoverText = function(string, color, x, y, x2, y2) {
	this.x = x;
	this.y = y;
	this.x2 = x2;
	this.y2 = y2;
	this.color = color;
	this.string = string;

	this.show = function() {
		fill(255);
		noStroke();
		if(this.color) fill(this.color); 
		text(this.string, this.x, this.y, this.x2, this.y2);
	}
}

var Line = function() {
	this.lineMargin = 20;
	this.topPoint = {x:width/2, y:this.lineMargin};
	this.botPoint = {x:width/2, y:height-this.lineMargin};
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

var Chapters = function(offset) {
	this.offset = offset;
	var divs = [];
	// console.log(story);
	story.chapters.forEach(function(chapter) {
		divs.push(new MentionChapter(chapter));
		chapter.events.forEach(function(event) {
			divs.push(new MentionEvent(event));
		});
	});
	this.divs = divs;

	this.setDivsY = function() {
		var offset = this.offset;
		var extraSpace = height - (this.offset * 2);
		this.divs.forEach(function(div) {
			extraSpace -= div.margin*2;
		});
		var individualSpace = extraSpace/(this.divs.length-1);

		for(var i=0; i<this.divs.length; i++) {
			this.divs[i].y = offset;
			if(individualSpace > 0) this.divs[i].y += individualSpace * i;
			offset += this.divs[i].margin*2;
		};

		if(offset > height) resizeCanvas(canvas.parent().offsetWidth - 17, offset + this.offset);
	}

	this.show = function() {
		this.divs.forEach(function(div) {
			div.show();
		});
	}
}

var MentionChapter = function(chapter) {
	this.width = 25;
	this.margin = 10;
	this.weight = 3;
	this.y;
	this.string = "";
	this.title = chapter.title;
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

var Mentions = function(chapters) {
	this.initialOffset = 20;
	this.extraOffset = 10;

	this.show = function() {
		var mentionObject = this;
		var charactersSoFar = 0;
		var selectedCharacters = characters.filter(function(character) {
			return character.isSelected;
		});
		var reversed = selectedCharacters.reverse();

		var extraSpace = (width/2 - this.initialOffset*2);
		var individualSpace = extraSpace/selectedCharacters.length;
		reversed.forEach(function(character) {
			// noLoop();
			var index = reversed.length - charactersSoFar - 1;
			var startDiv;
			var endDiv;
			chapters.divs.forEach(function(div) {
				var isContained = false;
				character.names.forEach(function(name) { //PERFORMANCE COULD BE IMPROVED
					// console.log(div);
					// console.log(div.string);
					if(div.string.includes(name)) isContained = true;
				});
				if(isContained) {
					if(div instanceof MentionChapter) {
						mentionObject.circle(character, index, div, individualSpace);
					} else if(div instanceof MentionEvent) {
						if(!startDiv) startDiv = div;
						endDiv = div;
					}
				} else {
					if(startDiv && endDiv) {
						mentionObject.rectangle(character, index, startDiv, endDiv, individualSpace);
						startDiv = null;
						endDiv = null;
					}
				}
			});
			if(startDiv && endDiv) {
				mentionObject.rectangle(character, index, startDiv, endDiv, individualSpace);
			}
			charactersSoFar++;
		});
	}

	this.circle = function(character, soFar, div, extraSpace) {
		var circleWidth = 7;
		fill(character.color);
		noStroke();
		rectMode(CENTER);
		if(soFar%2 == 0) {
			ellipse(width/2 + this.initialOffset + this.extraOffset*(soFar/2) + extraSpace*((soFar+1)/2), div.y + div.margin, circleWidth, circleWidth);
		} else {
			ellipse(width/2 - this.initialOffset - this.extraOffset*((soFar-1)/2) - extraSpace*((soFar+1)/2), div.y + div.margin, circleWidth, circleWidth);
		}
		rectMode(CORNER); //reset
	}

	this.rectangle = function(character, soFar, startDiv, endDiv, extraSpace) {
		var roundedCorners = 20;
		var weight = 2;
		stroke(character.color);
		strokeWeight(weight);
		noFill();
		rectMode(CORNERS);
		if(soFar%2 == 0) {
			rect(width/2, startDiv.y + startDiv.margin, width/2 + this.initialOffset + this.extraOffset*(soFar/2) + extraSpace*((soFar+1)/2), endDiv.y + endDiv.margin, 0, roundedCorners, roundedCorners, 0);
		} else {
			rect(width/2 - this.initialOffset - this.extraOffset*((soFar-1)/2) - extraSpace*((soFar+1)/2), startDiv.y + startDiv.margin, width/2, endDiv.y + endDiv.margin, roundedCorners, 0, 0, roundedCorners);
		}
		rectMode(CORNER); //reset
	}
}