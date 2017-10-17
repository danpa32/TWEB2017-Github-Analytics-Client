/*
 * Modification of the source code found here : https://codepen.io/linrock/pen/Amdhr
 */
const NUM_CONFETTI = 50;
const COLORS = [[85, 71, 106], [174, 61, 99], [219, 56, 83], [244, 92, 68], [248, 182, 70]];
const WORDS = ['Bugs', 'Issues', 'GitHub', 'Closed', 'Open', 'Repo', 'Duplicate', 'Enhancement', 'Invalid', "Won't Fix"];

const canvas = document.getElementById('world');
const context = canvas.getContext('2d');
window.w = 0;
window.h = 0;

const resizeWindow = function resizeW() {
  canvas.width = window.innerWidth;
  window.w = canvas.width;
  canvas.height = window.innerHeight;
  window.h = canvas.height;
  return window.h;
};

window.addEventListener('resize', resizeWindow, false);

window.onload = () => setTimeout(resizeWindow, 0);

const range = (a, b) => Math.floor(((b - a) * Math.random()) + a);

const drawCircle = function draws(x, y, r, style, word) {
  context.fillStyle = style;
  context.font = `2${r}px Arial`;
  return context.fillText(word, x, y);
};

let xpos = 0.5;

document.onmousemove = (e) => {
  xpos = e.pageX / window.w;
  return xpos;
};

window.requestAnimationFrame = (() =>
  window.requestAnimationFrame ||
  window.webkitRequestAnimationFrame ||
  window.mozRequestAnimationFrame ||
  window.oRequestAnimationFrame ||
  window.msRequestAnimationFrame ||
  (callback => window.setTimeout(callback, 1000 / 60))
)();


class Confetti {
  constructor() {
    this.style = COLORS[range(0, 5)];
    const index = Math.floor(Math.random() * WORDS.length);
    this.word = WORDS[index];
    this.rgb = `rgba(${this.style[0]},${this.style[1]},${this.style[2]}`;
    this.r = range(2, 6);
    this.r2 = 2 * this.r;
    this.replace();
  }

  replace() {
    this.opacity = 0;
    this.dop = 0.005 * range(1, 3);
    this.x = range(-this.r2, window.w - this.r2);
    this.y = range(-20, window.h - this.r2);
    this.xmax = window.w - this.r;
    this.ymax = window.h - this.r;
    this.vx = ((0.5 * range(0, 2)) + (8 * xpos)) - 5;
    this.vy = (0.7 * this.r) + (0.5 * range(-1, 1));
    return this.vy;
  }

  draw() {
    this.x += this.vx;
    this.y += this.vy;
    this.opacity += this.dop;
    if (this.opacity > 1) {
      this.opacity = 1;
      this.dop *= -1;
    }
    if ((this.opacity < 0) || (this.y > this.ymax)) { this.replace(); }
    if (!(this.x > 0 && this.x < this.xmax)) {
      this.x = (this.x + this.xmax) % this.xmax;
    }
    return drawCircle(this.x, this.y, this.r, `${this.rgb}, ${this.opacity})`, this.word);
  }
}

function rangeC(left, right, inclusive) {
  const rangeTmp = [];
  const ascending = left < right;
  let end;
  if (!inclusive) {
    end = right;
  } else {
    end = ascending ? right + 1 : right - 1;
  }
  for (let i = left; ascending ? i < end : i > end; ascending ? i += 1 : i -= 1) {
    rangeTmp.push(i);
  }
  return rangeTmp;
}

const confetti = (rangeC(1, NUM_CONFETTI, true).map(() => new Confetti()));

window.step = function stepC() {
  requestAnimationFrame(window.step);
  context.clearRect(0, 0, window.w, window.h);
  return Array.from(confetti).map(c => c.draw());
};

window.step();
