function Circular($element) {
    this.CLASSES = {
        COMPLETE_0_25: 'input-circular-range_25',
        COMPLETE_25_50: 'input-circular-range_50',
        COMPLETE_50_75: 'input-circular-range_75',
        COMPLETE_75_100: 'input-circular-range_100'
    };
    this.STEP = 4;

    this.$element = $element;
    this.$input = $element.querySelector('[data-js=value]');
    this.$text = $element.querySelector('[data-js=text]');
    this.$range = $element.querySelector('[data-js=range]');
    this.$rangeOverlap = $element.querySelector('[data-js=range-overlap]');
    this.$rangeHelper = $element.querySelector('[data-js=range-helper]');
    this.mouseHold = false;
    this.mouseMoving = false;
    this.drag = false;
    this.coordsArray = [];

    this.value = parseInt(this.$input.value, 10);
    this.step = this.STEP;
    this.min = parseInt(this.$input.getAttribute('min'), 10) || 0;
    this.max = parseInt(this.$input.getAttribute('max'), 10) || 100;

    this.update();

    this.$element.addEventListener('mousedown', function(e) {
        this.mouseHold = true;
    }.bind(this));

    document.body.addEventListener('mousemove', function(e) {
        if (this.mouseHold) {
            this.lastX = e.clientX;
            this.lastY = e.clientY;
            this.drag = true;
        } else {
            this.drag = false;
        }
    }.bind(this));

    document.body.addEventListener('mouseup', function(e) {
        this.mouseHold = false;
        this.step = this.STEP;
        this.coordsArray = [];
    }.bind(this));

    setInterval(function() {
        if (this.drag) {
            if (this.coordsArray.length < 3) {
                this.coordsArray.push({
                    x: this.lastX,
                    y: this.lastY
                });
            } else {
                var a = this.coordsArray[2];
                var b = this.coordsArray[1];
                var c = this.coordsArray[0];

                var clockWiseCheck = ((b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x));

                if (clockWiseCheck < 0) {
                    this.increase();
                } else {
                    this.decrease();
                }
            }
        }
    }.bind(this), 100);
}

Circular.prototype.hasClass = function($el, cls) {
    return !!$el.className.match(new RegExp('(\\s|^)' + cls + '(\\s|$)'));
};

Circular.prototype.addClass = function($el, cls) {
    if (!this.hasClass($el, cls)) {
        $el.className += ' ' + cls;
    }
};

Circular.prototype.removeClass = function($el, cls) {
    if (this.hasClass($el, cls)) {
        $el.className = $el.className.replace(new RegExp('(\\s|^)' + cls + '(\\s|$)'), ' ');
    }
};

Circular.prototype.flushCompleteClasses = function() {
    Object.keys(this.CLASSES).forEach(function(cls) {
        this.removeClass(this.$range, this.CLASSES[cls]);
    }.bind(this));
};

Circular.prototype.flushRangeHelper = function() {
    if (this.$rangeHelper.style.display !== 'none') {
        this.$rangeHelper.style.display = 'none';
    }
};

Circular.prototype.setData = function($el, dataItem, value) {
    if ($el.dataset) {
        $el.dataset[dataItem] = value;
    } else {
        $el.setAttribute('data-' + dataItem, value);
    }
};

Circular.prototype.increase = function(e) {
    this.value += this.step;
    this.update();
};

Circular.prototype.decrease = function(e) {
    this.value -= this.step;
    this.update();
};

Circular.prototype.update = function() {
    var minValueThreshold = Math.max(this.min, this.value);
    this.valuePercent = Math.min(1, minValueThreshold / this.max) * 100;
    this.valueDeg = this.valuePercent * 3.6;
    this.overlapRotation = this.valueDeg + 45;

    this.$text.innerHTML = parseInt(this.valuePercent, 10) + '%';

    if (this.valuePercent <= 75) {
        this.flushRangeHelper();
        this.$rangeOverlap.style.transform = 'rotate(' + this.overlapRotation + 'deg)';
        this.setData(this.$rangeOverlap, 'rotation', this.overlapRotation);
    } else {
        this.helperRotation = this.valueDeg - 45;
        this.$rangeHelper.style.display = 'inherit';
        this.setData(this.$rangeHelper, 'rotation', this.helperRotation);
        this.$rangeHelper.style.transform = 'rotate(' + this.helperRotation + 'deg)';
    }

    if (this.valuePercent > 25 && this.valuePercent <= 50) {
        this.flushCompleteClasses();
        this.addClass(this.$range, this.CLASSES.COMPLETE_25_50);
    } else if (this.valuePercent > 50 && this.valuePercent <= 75) {
        this.flushCompleteClasses();
        this.addClass(this.$range, this.CLASSES.COMPLETE_50_75);
    } else if (this.valuePercent > 75 && this.valuePercent <= 100) {
        this.flushCompleteClasses();
        this.addClass(this.$range, this.CLASSES.COMPLETE_75_100);
    } else {
        this.flushCompleteClasses();
        this.addClass(this.$range, this.CLASSES.COMPLETE_0_25);
    }
};