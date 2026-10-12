const GRID_SIZE = 8;
const GAME_TIME = 120; // 2분

let gridData = [];
let score = 0;
let highScore = localStorage.getItem('apple_game_high_score') || 0;
let timeLeft = GAME_TIME;
let timerInterval = null;
let isDragging = false;
let startCell = null;
let selectedCells = [];

const gridEl = document.getElementById('grid');
const selectionBox = document.getElementById('selection-box');
const scoreEl = document.getElementById('score');
const highScoreEl = document.getElementById('high-score');
const timerEl = document.getElementById('timer');

highScoreEl.textContent = highScore;

function startGame() {
  score = 0;
  timeLeft = GAME_TIME;
  scoreEl.textContent = score;
  timerEl.textContent = timeLeft;
  
  clearInterval(timerInterval);
  timerInterval = setInterval(updateTimer, 1000);

  createGrid();
}

function updateTimer() {
  timeLeft--;
  timerEl.textContent = timeLeft;
  if (timeLeft <= 0) {
    clearInterval(timerInterval);
    alert(`게임 종료! 최종 점수: ${score}점`);
    if (score > highScore) {
      highScore = score;
      localStorage.setItem('apple_game_high_score', highScore);
      highScoreEl.textContent = highScore;
    }
  }
}

function createGrid() {
  gridEl.innerHTML = '';
  gridData = [];

  for (let r = 0; r < GRID_SIZE; r++) {
    let row = [];
    for (let c = 0; c < GRID_SIZE; c++) {
      const num = Math.floor(Math.random() * 9) + 1; // 1~9
      row.push({ num, removed: false, el: null });

      const cell = document.createElement('div');
      cell.classList.add('cell');
      cell.dataset.row = r;
      cell.dataset.col = c;
      cell.innerHTML = `<span class="icon">🍎</span><span>${num}</span>`;

      gridEl.appendChild(cell);
      row[c].el = cell;
    }
    gridData.push(row);
  }
}

// 드래그 선택 이벤트 핸들러
gridEl.addEventListener('mousedown', (e) => {
  const cell = e.target.closest('.cell');
  if (!cell || cell.classList.contains('removed') || timeLeft <= 0) return;

  isDragging = true;
  const r = parseInt(cell.dataset.row);
  const c = parseInt(cell.dataset.col);
  startCell = { r, c };
  
  updateSelection(r, c, r, c);
});

window.addEventListener('mousemove', (e) => {
  if (!isDragging) return;

  const rect = gridEl.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  let targetCol = Math.floor(x / 63);
  let targetRow = Math.floor(y / 63);

  targetCol = Math.max(0, Math.min(GRID_SIZE - 1, targetCol));
  targetRow = Math.max(0, Math.min(GRID_SIZE - 1, targetRow));

  updateSelection(startCell.r, startCell.c, targetRow, targetCol);
});

window.addEventListener('mouseup', () => {
  if (!isDragging) return;
  isDragging = false;
  selectionBox.style.display = 'none';

  // 드래그 종료 시 합 계산
  let sum = 0;
  selectedCells.forEach(({ r, c }) => {
    if (!gridData[r][c].removed) {
      sum += gridData[r][c].num;
    }
  });

  if (sum === 10) {
    selectedCells.forEach(({ r, c }) => {
      gridData[r][c].removed = true;
      gridData[r][c].el.classList.add('removed');
    });
    score += selectedCells.length;
    scoreEl.textContent = score;
  }

  // 하이라이트 해제
  clearSelection();
});

function updateSelection(r1, c1, r2, c2) {
  clearSelection();

  const minR = Math.min(r1, r2);
  const maxR = Math.max(r1, r2);
  const minC = Math.min(c1, c2);
  const maxC = Math.max(c1, c2);

  selectedCells = [];
  for (let r = minR; r <= maxR; r++) {
    for (let c = minC; c <= maxC; c++) {
      if (!gridData[r][c].removed) {
        selectedCells.push({ r, c });
        gridData[r][c].el.classList.add('selected');
      }
    }
  }

  // 드래그 박스 시각화
  const startEl = gridData[minR][minC].el;
  const endEl = gridData[maxR][maxC].el;

  selectionBox.style.display = 'block';
  selectionBox.style.left = `${startEl.offsetLeft - 4}px`;
  selectionBox.style.top = `${startEl.offsetTop - 4}px`;
  selectionBox.style.width = `${endEl.offsetLeft + endEl.offsetWidth - startEl.offsetLeft + 8}px`;
  selectionBox.style.height = `${endEl.offsetTop + endEl.offsetHeight - startEl.offsetTop + 8}px`;
}

function clearSelection() {
  document.querySelectorAll('.cell.selected').forEach(el => {
    el.classList.remove('selected');
  });
}

// 초기 게임 실행
startGame();