'use strict';
const menu = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#navigation');
menu.addEventListener('click', () => {
  const open = menu.getAttribute('aria-expanded') !== 'true';
  menu.setAttribute('aria-expanded', String(open));
  navigation.classList.toggle('open', open);
});
navigation.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  navigation.classList.remove('open'); menu.setAttribute('aria-expanded', 'false');
}));
document.querySelector('#year').textContent = new Date().getFullYear();
const dialog = document.querySelector('#demo-dialog');
const title = document.querySelector('#demo-title');
const content = document.querySelector('#demo-content');
let cancelDemo = () => {};
const closeDemo = () => dialog.close();
document.querySelector('#close-demo').addEventListener('click', closeDemo);
dialog.addEventListener('close', () => cancelDemo());
dialog.addEventListener('click', event => { if (event.target === dialog) { const box = dialog.getBoundingClientRect(); if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) closeDemo(); } });
document.querySelectorAll('[data-demo]').forEach(button => button.addEventListener('click', () => {
  cancelDemo();
  if (button.dataset.demo === 'sorting') sortingDemo();
  if (button.dataset.demo === 'guess') guessingDemo();
  if (button.dataset.demo === 'rover') roverDemo();
  dialog.showModal();
}));
function sortingDemo() {
  title.textContent = 'Order in the cosmos';
  content.innerHTML = '<p>Bubble sort compares neighboring numbers and swaps them when they are out of order. Step through the comparisons or sort the whole list.</p><div class="bars" aria-label="Numbers to sort"></div><p class="demo-status" role="status" aria-live="polite"></p><div class="demo-actions"><button class="button primary" id="step">Next comparison</button><button class="button secondary" id="sort">Sort all</button><button class="button secondary" id="shuffle">Shuffle</button></div>';
  let numbers, i, end, done;
  const bars = content.querySelector('.bars'), status = content.querySelector('.demo-status');
  const step = content.querySelector('#step'), sort = content.querySelector('#sort');
  function draw() { bars.replaceChildren(...numbers.map(n => { const bar = document.createElement('div'); bar.className = 'bar'; bar.style.height = `${n * 12 + 20}px`; bar.textContent = n; return bar; })); bars.setAttribute('aria-label', numbers.join(', ')); }
  function reset() { numbers = [7, 3, 9, 2, 6, 4]; for (let k = numbers.length - 1; k > 0; k--) { const j = Math.floor(Math.random() * (k + 1)); [numbers[k], numbers[j]] = [numbers[j], numbers[k]]; } i = 0; end = numbers.length - 1; done = false; step.disabled = sort.disabled = false; status.textContent = 'Ready to compare the first pair.'; draw(); }
  function compare() { const a = numbers[i], b = numbers[i + 1]; const swap = a > b; if (swap) [numbers[i], numbers[i + 1]] = [b, a]; status.textContent = `${a} and ${b}: ${swap ? 'swap them.' : 'already in order.'}`; i++; if (i >= end) { i = 0; end--; } if (end === 0) { done = true; status.textContent = 'Mission complete! All numbers are in ascending order.'; step.disabled = sort.disabled = true; } draw(); }
  step.onclick = compare; sort.onclick = () => { while (!done) compare(); }; content.querySelector('#shuffle').onclick = reset; cancelDemo = () => {}; reset();
}
function guessingDemo() {
  title.textContent = 'Mission: mystery number';
  content.innerHTML = '<p>I’m thinking of a whole number from 1 to 20. You have five attempts to find it.</p><form class="guess-form"><label for="guess-input">Your guess (1–20)</label><div class="demo-actions"><input id="guess-input" type="number" min="1" max="20" step="1" required><button class="button primary" type="submit">Check guess</button><button class="button secondary" type="button" id="restart">New mission</button></div></form><p class="demo-status" role="status" aria-live="polite"></p>';
  let target, attempts; const form = content.querySelector('form'), input = content.querySelector('input'), status = content.querySelector('.demo-status'), submit = form.querySelector('[type=submit]');
  function reset() { target = Math.floor(Math.random() * 20) + 1; attempts = 0; input.disabled = submit.disabled = false; input.value = ''; status.textContent = 'Mission ready. Five attempts remaining.'; }
  form.onsubmit = e => { e.preventDefault(); const guess = Number(input.value); if (!Number.isInteger(guess) || guess < 1 || guess > 20) { status.textContent = 'Enter a whole number from 1 to 20.'; return; } attempts++; if (guess === target) { status.textContent = `You found it! The number was ${target}. Attempts used: ${attempts}.`; input.disabled = submit.disabled = true; } else if (attempts === 5) { status.textContent = `Mission over! The number was ${target}. Try a new mission.`; input.disabled = submit.disabled = true; } else { status.textContent = `${guess < target ? 'Aim higher' : 'Aim lower'}! ${5 - attempts} attempts remaining.`; input.value = ''; input.focus(); } };
  content.querySelector('#restart').onclick = () => { reset(); input.focus(); }; cancelDemo = () => {}; reset();
}
function roverDemo() {
  title.textContent = 'A path to discovery';
  content.innerHTML = '<p>Guide the rover from the top-left corner to the star at the bottom-right. Queue up to 20 directions, then run your program. The rover stops if it reaches the edge.</p><div class="rover-grid" role="img" aria-label="Rover navigation grid"></div><div class="demo-actions"><button class="button secondary" data-dir="up" aria-label="Add up">↑</button><button class="button secondary" data-dir="left" aria-label="Add left">←</button><button class="button secondary" data-dir="down" aria-label="Add down">↓</button><button class="button secondary" data-dir="right" aria-label="Add right">→</button></div><p class="command-list" aria-label="Queued directions"></p><div class="demo-actions"><button class="button primary" id="run">Run program</button><button class="button secondary" id="undo">Undo</button><button class="button secondary" id="clear">Reset</button></div><p class="demo-status" role="status" aria-live="polite"></p>';
  let x = 0, y = 0, queue = [], timer = null;
  const grid = content.querySelector('.rover-grid'), list = content.querySelector('.command-list'), status = content.querySelector('.demo-status');
  const symbols = {up:'↑',down:'↓',left:'←',right:'→'};
  function draw() { grid.replaceChildren(...Array.from({length:25}, (_, n) => { const cell = document.createElement('div'); cell.className = 'cell'; if (n === 24) { cell.classList.add('goal'); cell.textContent = '✦'; } if (n === y * 5 + x) { cell.classList.add('rover'); cell.textContent = '◆'; } return cell; })); grid.setAttribute('aria-label', `Rover at row ${y + 1}, column ${x + 1}. Goal at row 5, column 5.`); list.textContent = queue.length ? queue.map(d => symbols[d]).join('  ') : 'Your route will appear here.'; }
  function lock(value) { content.querySelectorAll('button').forEach(b => b.disabled = value); content.querySelector('#clear').disabled = false; }
  function reset() { clearInterval(timer); timer = null; x = y = 0; queue = []; lock(false); status.textContent = 'Tip: four moves right and four moves down will reach the star.'; draw(); }
  content.querySelectorAll('[data-dir]').forEach(b => b.onclick = () => { if (queue.length < 20) { queue.push(b.dataset.dir); draw(); } else status.textContent = 'Your program can have up to 20 moves. Undo a move or reset.'; });
  content.querySelector('#undo').onclick = () => { queue.pop(); draw(); };
  content.querySelector('#clear').onclick = reset;
  content.querySelector('#run').onclick = () => { if (!queue.length) { status.textContent = 'Add some directions first.'; return; } x = y = 0; let index = 0; lock(true); draw(); status.textContent = 'Running your program…'; timer = setInterval(() => { const d = queue[index++]; let nx = x + (d === 'right' ? 1 : d === 'left' ? -1 : 0), ny = y + (d === 'down' ? 1 : d === 'up' ? -1 : 0); const edge = nx < 0 || nx > 4 || ny < 0 || ny > 4; if (!edge) { x = nx; y = ny; } draw(); if (edge || index === queue.length || (x === 4 && y === 4)) { clearInterval(timer); timer = null; lock(false); status.textContent = edge ? 'Edge reached! Adjust your route and run again.' : x === 4 && y === 4 ? 'Mission complete! Your rover reached the star.' : 'Program complete. Add more moves to reach the star.'; } }, 350); };
  cancelDemo = () => clearInterval(timer); reset();
}
