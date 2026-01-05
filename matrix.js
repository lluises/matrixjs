// class MatrixEffect
// Created by LluisE <kitsune.cat>


function MatrixEffect(parent) {
  // Matrix letters rainfall effect by LluisE

  if (this === window)
    return new MatrixEffect(parent);

  this.about = {
    version : "1.0",
    author  : "LluisE",
    source  : "https://github.com/lluises/matrixjs",
    website : "https://kitsune.cat/",
    license : "MPL-2.0",
  };

  this.parent = parent;
  this.canvas = null;

  this.fps = 1000 / 30;
  // Note on fps: requestAnimationFrame is used for animation, not this.fps
  // fps are used for the color transition effect

  this.filling      = 'rgba(0, 0, 0, .08)';
  this.color        = '#00FF00';
  this.font_size    = 10; // in px
  this.font_height  = 11; // in px
  this.font         = '10pt Georgia';
  this.fade_start   = .05; // relative to height
  this.stop_on_blur = true;

  this.color_transitions = [
    [  1, 254,   1], // First one will only appear once
    [  0, 255,   0], [255,   0, 255], [  0, 255, 255],
    [255,   0,   0], [  0,   0, 255], [255, 255,   0],
  ];
  this.color_duration = 10;
  this.recolor = false;
  this._color_trans_pos = null;
  this._color_rgb = this.color_transitions[0];
  this._running = false;
  this._col_divider = 1; // Divides the total columns

  this._interval = null;
  this._interval_color = null;

  this.setup();
}


// Public /////////////////////////////////////////////////////////////////////

MatrixEffect.prototype.setup = function() {
  // Setup and install MatrixEffect
  this.canvas || this._create_canvas();

  const box     = this._get_elem_size(this.parent);
  this.width    = this.canvas.width   = box.width;
  this.height   = this.canvas.height  = box.height;
  this.matrix_y = Array((this.width / this.font_size / this._col_divider) << 0 + 1).join(0).split('');
  this._matrix_y_fade = [];
  for (let i = 0; i < this.matrix_y.length; i++)
    this._matrix_y_fade[i] = this.height;

  this.ctx = this.canvas.getContext('2d');
  this.ctx.font = this.font;
  this._fade_min = box.height * this.fade_start;
  this._fade_max = box.height - this._fade_min;

  this._precompute_chars();

  // Freeze the animation when webpage is not focused
  document.addEventListener("focus", function() {
    this._running || this.run();
  }.bind(this));

  // Unfreeze it when we focus the page
  document.addEventListener("blur", function() {
    this.stop_on_blur && this._running && this.stop();
  }.bind(this));

  return this;
};

MatrixEffect.prototype.set_recolor = function(enable) {
  // Enable or disable color transitions
  this.recolor = !!enable;
  if (this._running
      && ((!this.recolor && this._interval_color)
       || (this.recolor && !this._interval_color))) {
    this.run();
  }
  return this;
};

MatrixEffect.prototype.set_stop_on_blur = function(enable) {
  // Enable or disable pausing the animation when the window is not focused.
  this.stop_on_blur = !!enable;
  return this;
}

MatrixEffect.prototype.run = function() {
  // Play/Resume the animation
  if (this._running)
    this.stop();
  if (this.recolor && this._color_trans_pos === null)
    this._next_color();
  this._interval = window.requestAnimationFrame(this._tick.bind(this));
  if (this.recolor)
    this._interval_color = window.setInterval(this._recolor.bind(this), this.fps);
  this._running = true;
  return this;
};

MatrixEffect.prototype.stop = function() {
  // Pause the animation
  if (this._interval)
    window.cancelAnimationFrame(this._interval);
  if (this._interval_color) {
    window.clearInterval(this._interval_color);
    this._interval_color = null;
  }
  this._running = false;
  return this;
};


// Private ////////////////////////////////////////////////////////////////////

MatrixEffect.prototype._tick = function(timestamp) {
  // Run a frame
  this._draw();
  this._interval = window.requestAnimationFrame(this._tick.bind(this));
};

MatrixEffect.prototype._draw = function() {
  // Draw a rainfall frame
  this.ctx.fillStyle = this.filling;
  this.ctx.fillRect(0, 0, this.width, this.height);
  this.ctx.fillStyle = this.color;

  for (let i = 0; i < this.matrix_y.length; i++) {
    this.ctx.fillText(this._get_char(), i * this.font_size * this._col_divider, this.matrix_y[i]);
    this.matrix_y[i] += this.font_height;
    if (this.matrix_y[i] > this._matrix_y_fade[i]) {
      this.matrix_y[i] = 0;
      this._matrix_y_fade[i] = this._fade_min + Math.random() * this._fade_max;
    }
  };
};

MatrixEffect.prototype._recolor = function() {
  // Apply color transition
  const next_rgb = this.color_transitions[this._color_trans_pos];
  let rgb = this._color_rgb;

  for (let i = 0; i < 3; i++) {
    if (rgb[i] > next_rgb[i]) {
      rgb[i] -= this._color_increment[i];
      if (rgb[i] <= next_rgb[i])
        this._color_increment[i] = 0;
      if (rgb[i] < 0x00)
        rgb[i] = 0x00;
    } else {
      rgb[i] += this._color_increment[i];
      if (rgb[i] >= next_rgb[i])
        this._color_increment[i] = 0;
      if (rgb[i] > 0xFF)
        rgb[i] = 0xFF;
    }
  }

  this.color = "rgb(" + rgb.join(',') + ')';

  if (this._color_increment[0] == 0 &&
      this._color_increment[1] == 0 &&
      this._color_increment[2] == 0)
    this._next_color();
};

MatrixEffect.prototype._next_color = function() {
  // Calculate next color and color increment
  this._color_trans_pos++;
  if (this._color_trans_pos >= this.color_transitions.length)
    this._color_trans_pos = 0;
  this._color_increment = this._calc_color_transition(
    this._color_rgb,
    this.color_transitions[this._color_trans_pos],
    this.fps,
    this.color_duration,
  );
};

MatrixEffect.prototype._calc_color_transition = function(now, next, fps, duration) {
  // now: [r, g, b]
  // next: [r, g, b]
  // fps: frames/second
  // duration: in fps;
  // Returns increments array: [r, g, b];

  // Calculate increment
  let increment = [0, 0, 0];
  for (let i = 0; i < 3; i++) {
    increment[i] = (now[i] - next[i]) / (fps * duration);
    if (increment[i] < 0)
      increment[i] = -increment[i]; // abs
    else if (increment[i] == 0) 
      increment[i] = .4;
  }

  return increment;
};

MatrixEffect.prototype._get_char = function() {
  // Get a new random char to print
  return (this._last_char >= this._chars_table.length ?
          this._chars_table[this._last_char = 0]
          : this._chars_table[this._last_char++]);
};

MatrixEffect.prototype._precompute_chars = function() {
  // Precompute random chars (slightly more efficient than generating on demand)
  this._last_char = 0;
  this._chars_table = [];
  for (let i = 1e3; i--; )
    this._chars_table.push(String.fromCharCode(97 + Math.random() * 29));
};

MatrixEffect.prototype._create_canvas = function() {
  // Create a <canvas> element to draw the matrix effect on
  this.canvas = document.createElement('canvas');
  this.parent.appendChild(this.canvas);
};

MatrixEffect.prototype._get_elem_size = function(elem) {
  // Get an element size.
  // Returns DOMRect { x: 0, y: 0, width: 1920, height: 1080, top: 0, right: 1920, bottom: 0, left: 0 }
  return elem.getBoundingClientRect();
};
