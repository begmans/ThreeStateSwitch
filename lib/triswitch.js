/*global jQuery */
(function ($){
    "use strict";
    var LEFT = "left";
    var CENTER = "center";
    var RIGHT = "right";

    var stateKeys = [LEFT, CENTER, RIGHT];

    var stateClasses = {
        left: "bnet-triswitch-a",
        center: "bnet-triswitch-aub",
        right: "bnet-triswitch-b"
    };

    var classesArray = (function() {
        var array = [];
        for (var k in stateClasses) {
            if (stateClasses.hasOwnProperty(k)) {
                array.push(stateClasses[k]);
            }
        }
        return array;
    })();

    var polyfill = {
        changeClass: function ($element, clazz) {
            if ($element.classList !== null &&
                $element.classList !== undefined) {
                for (var idxClass= 0; idxClass < classesArray.length; idxClass++) {
                    $element.classList.remove(classesArray[idxClass]);
                }
                $element.classList.add(clazz);
            } else {
                //for IE9 that does not understand classList
                var oldClassName = $element.className;
                var oldClasses = oldClassName.split(" ");

                for (var i = 0; i < classesArray.length; i++) {
                    var index = oldClasses.indexOf(classesArray[i]);
                    if (index >= 0) {
                        oldClasses.splice(index, 1);
                    }
                }
                oldClasses.push(clazz);
                $element.className = oldClasses.join(" ");
            }
        },

        addClass: function ($element, clazz) {
            if ($element.classList !== null &&
                $element.classList !== undefined) {
                $element.classList.add(clazz);
            } else {
                //for IE9 that does not understand classList
                var oldClassName = $element.className;
                var oldClasses = oldClassName.split(" ");
                var index = oldClasses.indexOf(clazz);
                if (index === -1) {
                    oldClasses.push(clazz);
                }
                $element.className = oldClasses.join(" ");
            }
        },

        removeClass: function ($element, clazz) {
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

    $.widget("bnet.triswitch", {

        options: {
            inputName: "state",
            initialState: "center",
            legend: {
                label: "",
                width: 300
            },

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
            },
            onchange: function() {}
        },


        _create: function() {

            //Properties
            this.currentState = this.options.states[this.options.initialState];

            //Elements
            this.$legendState = $("<span>").attr("class", "bnet-triswitch-legend-state")
                    .text(this.currentState.label);
            var $legend = $('<div>').attr("class", "bnet-triswitch-legend")
                    .css("width", this.options.legend.width)
                    .append(this.options.legend.label + "&nbsp;")  //todo bgm improve space-char
                    .append(this.$legendState);
            this.element.append($legend);

            this.$rail = $("<div>").attr("class", "bnet-triswitch-rail");
            this.$knob = $("<div>").attr("draggable", true)
                    .attr("class", "bnet-triswitch-knob bnet-triswitch-real-knob")
                    .addClass(stateClasses[this.options.initialState]);
            this.$rail.append(this.$knob);
            this._initGhosts();
            this.element.append(this.$rail);

            this.$input = $('<input type="hidden">')
                    .attr("name", this.options.inputName)
                    .attr("value", this.currentState.value);
            this.element.append(this.$input);


            // Behavior && Events


            // ghosts
            var $ghosts = document.querySelectorAll(".bnet-triswitch-ghost");
            var mouseEnterGhost =  function(e) {
                polyfill.addClass(e.target, "bnet-triswitch-ghost-highlight");
            };
            var mouseLeaveGhost = function(e) {
                polyfill.removeClass(e.target, "bnet-triswitch-ghost-highlight");
            };

            for (var i = 0; i < $ghosts.length; i++) {
                $ghosts[i].addEventListener("mouseenter", mouseEnterGhost);
                $ghosts[i].addEventListener("mouseleave", mouseLeaveGhost);
            }

            var that = this;
            // Click
            function clickOnSwitch(e) {
                var clickX = e.clientX;
                var coordsX = that._getCoordsX();
                if (clickX < coordsX.firstThirdX) {
                    that.state(LEFT);
                } else if (clickX < coordsX.secondThirdX) {
                    that.state(CENTER);
                } else {
                    that.state(RIGHT);
                }
            }

            this.$rail.on('click', clickOnSwitch);

            // Drag start
            function dragstartHandler(e) {
                /** @namespace e.dataTransfer */
                if (e.dataTransfer !== undefined) {
                    e.dataTransfer.effectAllowed = 'move';
                    e.dataTransfer.setData("Text", e.target.id);
                    /** @namespace e.dataTransfer.setDragImage */
                    if (e.dataTransfer.setDragImage !== undefined) {
                        var img = new Image();
                        img.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAMCAYAAABWdVznAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAYdEVYdFNvZnR3YXJlAHBhaW50Lm5ldCA0LjAuOWwzfk4AAAAQSURBVChTYxgFo4AqgIEBAAJMAAH8Lw67AAAAAElFTkSuQmCC";
                        e.dataTransfer.setDragImage(img, 0, 0);
                    }
                }
            }

            this.$knob.get(0).addEventListener('dragstart', dragstartHandler);

            // Drag
            function dragHandler(e) {}

            this.$knob.get(0).addEventListener('drag', dragHandler);

            // Drag over
            function dragoverHandler(e) {
                var states = that.options.states; // alias
                e.preventDefault();
                var coordsX = that._getCoordsX();
                if (e.clientX >= coordsX.low && e.clientX < coordsX.high) {
                    if (e.clientX < coordsX.firstThirdX && that.currentState !== states.left) {
                        that.state(LEFT);
                    } else if (e.clientX >= coordsX.firstThirdX &&
                        e.clientX < coordsX.secondThirdX &&
                        that.currentState !== states.center) {
                        that.state(CENTER);
                    } else if (e.clientX >= coordsX.secondThirdX && that.currentState !== states.right) {
                        that.state(RIGHT);
                    }
                }
            }
            this.$rail.get(0).addEventListener('dragover', dragoverHandler);

            // Drop
            function dropHandler(e) {
                e.preventDefault();
                that.$knob.title = that.currentState.label;
                that.$legendState.text(that.currentState.label);
            }

            that.$rail.get(0).addEventListener('drop', dropHandler);



        },

        //Public methods
        state: function(stateKey) {
            //Getter
            if(stateKey === undefined) {
                return this.currentState;
            }
            //Setter
            var neoState = this.options.states[stateKey];
            if (neoState !== undefined) {
                var cssClass = stateClasses[stateKey];
//                for ( var classIdx = 0; classIdx < classesArray.length; classIdx++) {
//                    this.$knob.removeClass(classesArray[classIdx]);
//                }
//                this.$knob.addClass(cssClass);
                polyfill.changeClass(this.$knob.get(0), cssClass);
                this.$input.val(neoState.value);
                this.$legendState.text(neoState.label);
                this.currentState = neoState;
                this.options.onchange(this.currentState);
            }


        },

        _initGhosts: function() {
            for (var i =0; i < stateKeys.length; i++) {
                var key = stateKeys[i];
                var $ghost = $("<div>").attr("title",this.options.states[key].label)
                    .attr("class", "bnet-triswitch-knob bnet-triswitch-ghost")
                    .addClass(stateClasses[key]);

                this.$rail.append($ghost);
            }
        },

        _getCoordsX: function() {
            var railBoundingRect = this.$rail.get(0).getBoundingClientRect();
            var railX = railBoundingRect.left;
            var result = {};
            result.low = railX;
            result.high = railX + railBoundingRect.width;
            result.firstThirdX = railX + Math.ceil(railBoundingRect.width / 3);
            result.secondThirdX = railX + Math.ceil(railBoundingRect.width * 2 / 3);
            return result;
        }


    });

}(jQuery));