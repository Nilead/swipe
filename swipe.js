/**
 * Naive swipe helper
 *
 * @constructor
 */
(function () {
    "use strict";

    /** Detect free variable `global` from Node.js. */
    var freeGlobal = typeof global == 'object' && global && global.Object === Object && global;

    /** Detect free variable `self`. */
    var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

    /** Used as a reference to the global object. */
    var root = freeGlobal || freeSelf || Function('return this')();

    function Swipe() {
        this.index = 0;
        this.handlers = {};
    }

    Swipe.prototype.on = function (container, customOptions) {
        this.options = {
            threshold: 150, //required min distance traveled to be considered swipe
            restraint: 200, // maximum distance allowed at the same time in perpendicular direction
            allowedTime: 300, // maximum time allowed to travel that distance
            preventMove: true // prevent moving while swiping
        };

        if ('object' == typeof customOptions) {
            for (var attrname in customOptions) {
                if (this.options.hasOwnProperty(attrname)) {
                    this.options[attrname] = customOptions[attrname];
                }
            }
        }

        var touchstartX = 0;
        var touchstartY = 0;
        var touchendX = 0;
        var touchendY = 0;
        var distX = 0; // get horizontal dist traveled by finger while in contact with surface
        var distY = 0; // get vertical dist traveled by finger while in contact with surface
        var startTime = null; // record time when finger first makes contact with surface
        var elapsedTime = 0; // get time elapsed

        var swipe = container.getAttribute('data-swipe');
        if (null === swipe) {
            swipe = this.index ++;
            container.setAttribute('data-swipe', swipe);
            this.handlers[swipe] = {};
        }

        this.handlers[swipe]['touchstart'] = function (event) {
            touchstartX = event.changedTouches[0].screenX;
            touchstartY = event.changedTouches[0].screenY;
            startTime = new Date().getTime();
        };

        this.handlers[swipe]['touchmove'] = function (event) {
            event.preventDefault(); // prevent scrolling when inside DIV
        };

        this.handlers[swipe]['touchend'] = function (event) {
            elapsedTime = new Date().getTime() - startTime;

            if (elapsedTime <= this.options.allowedTime) {
                touchendX = event.changedTouches[0].screenX;
                touchendY = event.changedTouches[0].screenY;
                distX = Math.abs(touchendX - touchstartX);
                distY = Math.abs(touchendY - touchstartY);

                var swipeEvent;
                if (distY <= this.options.restraint && distX > this.options.threshold) {
                    swipeEvent = document.createEvent('Event');

                    if (touchendX < touchstartX) {
                        swipeEvent.initEvent('swipeleft', true, true);
                        container.dispatchEvent(swipeEvent);
                    } else {
                        swipeEvent.initEvent('swipeight', true, true);
                        container.dispatchEvent(swipeEvent);
                    }
                }

                if (distX <= this.options.restraint && distY > this.options.threshold) {
                    swipeEvent = document.createEvent('Event');

                    if (touchendY < touchstartY) {
                        swipeEvent.initEvent('swipeup', true, true);
                        container.dispatchEvent(swipeEvent);
                    } else {
                        swipeEvent.initEvent('swipedown', true, true);
                        container.dispatchEvent(swipeEvent);
                    }
                }
            }

            if (touchendY == touchstartY) {
                swipeEvent = document.createEvent('Event');
                swipeEvent.initEvent('tap', true, true);
                container.dispatchEvent(swipeEvent);
            }
        }.bind(this);

        container.addEventListener('touchstart', this.handlers[swipe]['touchstart'], false);

        if (this.options.preventMove) {
            container.addEventListener('touchmove', this.handlers[swipe]['touchmove'], false);
        }

        container.addEventListener('touchend', this.handlers[swipe]['touchend'], false);
    };

    Swipe.prototype.off = function (container) {
        var swipe = container.getAttribute('data-swipe');

        if (null !== swipe && this.handlers.hasOwnProperty(swipe)) {
            container.removeEventListener('touchstart', this.handlers[swipe]['touchstart'], false);

            if (this.options.preventMove) {
                container.removeEventListener('touchmove', this.handlers[swipe]['touchmove'], false);
            }

            container.removeEventListener('touchend', this.handlers[swipe]['touchend'], false);
        }
    };

    root.nuSwipe = Swipe;
}());
