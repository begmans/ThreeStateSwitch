function ThreeStateSwitch(options) {
	var LEFT = "left";
	var CENTER = "center";
	var RIGHT = "right";

	var _defaultSettings = {
		states: {
			left: {
				value: "a",
				label: "a"
			},
			center: {
				value: "aub",
				label: "aub"
			},
			right: {
				value: "b",
				label: "b"
			}
		}
		
	};

	var stateClasses = {
			left: "a",
			center: "aub",
			right: "b"
	};
	
	this.settings = _defaultSettings; // to override with options
	this.element = document.getElementById("container");
	var $knob = this.element.getElementsByClassName("real-knob")[0];
	var $rail = this.element.getElementsByClassName("rail")[0];
	var $state = this.element.getElementsByClassName("state")[0];
	var $legendState = this.element.getElementsByClassName("legend-state")[0];

	var railBoundingRect = $rail.getBoundingClientRect();
	var railX = railBoundingRect.left;
	var low = railX;
	var high = railX + railBoundingRect.width;
	var firstThirdX = railX + Math.ceil(railBoundingRect.width / 3);
	var secondThirdX = railX + Math.ceil(railBoundingRect.width * 2 / 3);
	var currentStatus = this.settings.states.center;
	var self = this;
	
	//Methods
	this.changeState = function(stateKey) {
		var neoState = this.settings.states[stateKey];
		var cssClass = stateClasses[stateKey];
		polyfill.changeClass($knob, cssClass);
		$state.value = neoState.value;
		$legendState.innerText = neoState.label;
		currentStatus = neoState;
	};
	
	// Events
	// Drag start
	function dragstartHandler(e) {
		if (e.dataTransfer) {
			e.dataTransfer.effectAllowed = 'move';
			e.dataTransfer.setData("Text", e.target.id);
			if (e.dataTransfer.setDragImage) {
				var img = new Image();
				img.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAMCAYAAABWdVznAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAYdEVYdFNvZnR3YXJlAHBhaW50Lm5ldCA0LjAuOWwzfk4AAAAQSURBVChTYxgFo4AqgIEBAAJMAAH8Lw67AAAAAElFTkSuQmCC";
				e.dataTransfer.setDragImage(img, 0, 0);
			}
		}
	};

	$knob.addEventListener('dragstart', dragstartHandler);

	// Drag
	function dragHandler(e) {};

	$knob.addEventListener('drag', dragHandler);

	// Drag over
	function dragoverHandler(e) {
		var states = self.settings.states; // alias
		e.preventDefault();
		if (e.clientX >= low && e.clientX < high) {
			if (e.clientX < firstThirdX && currentStatus !== states.left) {
				self.changeState(LEFT);
			} else if (e.clientX >= firstThirdX &&
				e.clientX < secondThirdX &&
				currentStatus !== states.center) {
				self.changeState(CENTER);
			} else if (e.clientX >= secondThirdX && currentStatus !== states.right) {
				self.changeState(RIGHT);
			}
		}
	}

	$rail.addEventListener('dragover', dragoverHandler);

	// Drop
	function dropHandler(e) {
		e.preventDefault();
		$knob.title = currentStatus.label;
		$legendState.innerText = currentStatus.label;
	}

	$rail.addEventListener('drop', dropHandler);

	// Click
	function clickOnSwitch(e) {
		var states = self.settings.states;
		var clickX = e.clientX;
		if (clickX < firstThirdX) {
			self.changeState("left");
		} else if (clickX < secondThirdX) {
			self.changeState("center");
		} else {
			self.changeState("right");
		}
	};

	$rail.addEventListener('click', clickOnSwitch);

	// ghosts
	var $ghosts = document.querySelectorAll(".ghost");

	for (var i = 0; i < $ghosts.length; i++) {
		(function(target) {
			target.addEventListener("mouseenter", function(e) {
				polyfill.addClass(target, "ghost-highlight");
			});

			target.addEventListener("mouseleave", function(e) {
				polyfill.removeClass(target, "ghost-highlight");
			});
		})($ghosts[i]);
	}

};

var mySwitch = new ThreeStateSwitch();

var polyfill = {
	changeClass: function($element, clazz) {
		var stateClasses = ["a", "aub", "b"];
		if ($element.classList !== null &&
			$element.classList !== undefined) {
			for (var i = 0; i < stateClasses.length; i++) {
				$element.classList.remove(stateClasses[i]);
			}	
			$element.classList.add(clazz);
		} else {
			//for IE9 that does not understand classList
			var oldClassName = $element.className;
			var oldClasses = oldClassName.split(" ");
			
			for (var i = 0; i < stateClasses.length; i++) {
				var index = oldClasses.indexOf(stateClasses[i]);
				if (index >= 0) {
					oldClasses.splice(index, 1);
				}
			}
			oldClasses.push(state);
			$element.className = oldClasses.join(" ");
		}
	},

	addClass: function($element, clazz) {
		if ($element.classList !== null &&
			$element.classList !== undefined) {
			$element.classList.add(clazz);
		} else {
			//for IE9 that does not understand classList
			var oldClassName = $element.className;
			var oldClasses = oldClassName.split(" ");
			var index = oldClasses.indexOf(clazz);
			if (index === -1) {
				oldClasses.push(state);
			}
			$element.className = oldClasses.join(" ");
		}
	},

	removeClass: function($element, clazz) {
		if ($element.classList !== null &&
			$element.classList !== undefined) {
			$element.classList.remove(clazz);
		} else {
			//for IE9 that does not understand classList
			var oldClassName = $element.className;
			var oldClasses = oldClassName.split(" ");
			var index = oldClasses.indexOf(clazz);
			if (index !== -1) {
				oldClasses.splice(index, 1);
			}
			$element.className = oldClasses.join(" ");
		}
	}
};