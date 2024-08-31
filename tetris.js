const canvas = document.getElementById("tetris");
const context = canvas.getContext("2d");
const nextPieceCanvas = document.getElementById("nextPiece");
const nextPieceContext = nextPieceCanvas.getContext("2d");
const holdPieceCanvas = document.getElementById("holdPiece");
const holdPieceContext = holdPieceCanvas.getContext("2d");

context.scale(20, 20);

let level = 1;
let linesCleared = 0;
let gameState = "start";
let nextPiece = null;
let holdPiece = null;
let canHold = true;

const pieces = "TJLOSZI";
nextPiece = createPiece(pieces[(pieces.length * Math.random()) | 0]);

function arenaSweep() {
  let rowCount = 1;
  outer: for (let y = arena.length - 1; y > 0; --y) {
    for (let x = 0; x < arena[y].length; ++x) {
      if (arena[y][x] === 0) {
        continue outer;
      }
    }

    const row = arena.splice(y, 1)[0].fill(0);
    arena.unshift(row);
    ++y;

    player.score += rowCount * 10 * level;
    rowCount *= 2;
    linesCleared++;

    if (linesCleared % 10 === 0) {
      level++;
      dropInterval = Math.max(100, 1000 - (level - 1) * 100);
    }
  }
}

function collide(arena, player) {
  const [m, o] = [player.matrix, player.pos];
  for (let y = 0; y < m.length; ++y) {
    for (let x = 0; x < m[y].length; ++x) {
      if (m[y][x] !== 0 && (arena[y + o.y] && arena[y + o.y][x + o.x]) !== 0) {
        return true;
      }
    }
  }
  return false;
}

function createMatrix(w, h) {
  const matrix = [];
  while (h--) {
    matrix.push(new Array(w).fill(0));
  }
  return matrix;
}

function createPiece(type) {
  if (type === "I") {
    return [
      [0, 1, 0, 0],
      [0, 1, 0, 0],
      [0, 1, 0, 0],
      [0, 1, 0, 0],
    ];
  } else if (type === "L") {
    return [
      [0, 2, 0],
      [0, 2, 0],
      [0, 2, 2],
    ];
  } else if (type === "J") {
    return [
      [0, 3, 0],
      [0, 3, 0],
      [3, 3, 0],
    ];
  } else if (type === "O") {
    return [
      [4, 4],
      [4, 4],
    ];
  } else if (type === "Z") {
    return [
      [5, 5, 0],
      [0, 5, 5],
      [0, 0, 0],
    ];
  } else if (type === "S") {
    return [
      [0, 6, 6],
      [6, 6, 0],
      [0, 0, 0],
    ];
  } else if (type === "T") {
    return [
      [0, 7, 0],
      [7, 7, 7],
      [0, 0, 0],
    ];
  }
}

function drawMatrix(matrix, offset) {
  matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        context.fillStyle = colors[value];
        context.fillRect(x + offset.x, y + offset.y, 1, 1);
      }
    });
  });
}

function draw() {
  context.fillStyle = "#000";
  context.fillRect(0, 0, canvas.width, canvas.height);

  drawMatrix(arena, { x: 0, y: 0 });
  drawMatrix(player.matrix, player.pos);
}

function drawNextPiece() {
  nextPieceContext.fillStyle = "#0f3460";
  nextPieceContext.fillRect(
    0,
    0,
    nextPieceCanvas.width,
    nextPieceCanvas.height
  );

  if (nextPiece) {
    nextPieceContext.save();
    nextPieceContext.scale(20, 20);
    nextPieceContext.translate(0.5, 0.5);

    nextPiece.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value !== 0) {
          nextPieceContext.fillStyle = colors[value];
          nextPieceContext.fillRect(x, y, 1, 1);
        }
      });
    });

    nextPieceContext.restore();
  }
}

function drawHoldPiece() {
  holdPieceContext.fillStyle = "#0f3460";
  holdPieceContext.fillRect(
    0,
    0,
    holdPieceCanvas.width,
    holdPieceCanvas.height
  );

  if (holdPiece) {
    holdPieceContext.save();
    holdPieceContext.scale(20, 20);
    holdPieceContext.translate(0.5, 0.5);

    holdPiece.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value !== 0) {
          holdPieceContext.fillStyle = colors[value];
          holdPieceContext.fillRect(x, y, 1, 1);
        }
      });
    });

    holdPieceContext.restore();
  }
}

function merge(arena, player) {
  player.matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        arena[y + player.pos.y][x + player.pos.x] = value;
      }
    });
  });
}

function rotate(matrix, dir) {
  for (let y = 0; y < matrix.length; ++y) {
    for (let x = 0; x < y; ++x) {
      [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
    }
  }

  if (dir > 0) {
    matrix.forEach((row) => row.reverse());
  } else {
    matrix.reverse();
  }
}

function playerDrop() {
  player.pos.y++;
  if (collide(arena, player)) {
    player.pos.y--;
    merge(arena, player);
    playerReset();
    arenaSweep();
    updateScore();
  }
  dropCounter = 0;
}

function playerMove(offset) {
  player.pos.x += offset;
  if (collide(arena, player)) {
    player.pos.x -= offset;
  }
}

function playerReset() {
  const pieces = "TJLOSZI";
  if (nextPiece === null) {
    nextPiece = createPiece(pieces[(pieces.length * Math.random()) | 0]);
  }
  player.matrix = nextPiece;
  nextPiece = createPiece(pieces[(pieces.length * Math.random()) | 0]);
  player.pos.y = 0;
  player.pos.x =
    Math.floor(arena[0].length / 2) - Math.floor(player.matrix[0].length / 2);
  if (collide(arena, player)) {
    gameOver();
  }
  drawNextPiece();
  canHold = true;
}

function playerRotate(dir) {
  const pos = player.pos.x;
  let offset = 1;
  rotate(player.matrix, dir);
  while (collide(arena, player)) {
    player.pos.x += offset;
    offset = -(offset + (offset > 0 ? 1 : -1));
    if (offset > player.matrix[0].length) {
      rotate(player.matrix, -dir);
      player.pos.x = pos;
      return;
    }
  }
}

let dropCounter = 0;
let dropInterval = 1000;

let lastTime = 0;
function update(time = 0) {
  if (gameState === "playing") {
    const deltaTime = time - lastTime;

    dropCounter += deltaTime;
    if (dropCounter > dropInterval) {
      playerDrop();
    }

    lastTime = time;

    draw();
  }
  requestAnimationFrame(update);
}

function updateScore() {
  document.getElementById("score").innerText = `Puntuación: ${player.score}`;
  document.getElementById("level").innerText = `Nivel: ${level}`;
  document.getElementById("lines").innerText = `Líneas: ${linesCleared}`;
  document.getElementById("highScore").innerText = `Récord: ${
    localStorage.getItem("tetrisHighScore") || 0
  }`;
}

function togglePause() {
  if (gameState === "playing") {
    gameState = "paused";
  } else if (gameState === "paused") {
    gameState = "playing";
    lastTime = performance.now();
  }
}

document.addEventListener("keydown", (event) => {
  if (gameState === "playing") {
    if (event.keyCode === 37) {
      playerMove(-1);
    } else if (event.keyCode === 39) {
      playerMove(1);
    } else if (event.keyCode === 40) {
      playerDrop();
    } else if (event.keyCode === 38) {
      playerRotate(-1);
    } else if (event.keyCode === 87) {
      playerRotate(1);
    } else if (event.keyCode === 67) {
      holdCurrentPiece();
    }
  }
  if (event.keyCode === 80) {
    togglePause();
  }
  if (event.keyCode === 82) {
    if (gameState === "gameOver") {
      restartGame();
    }
  }
});

const colors = [
  null,
  "#FF0D72",
  "#0DC2FF",
  "#0DFF72",
  "#F538FF",
  "#FF8E0D",
  "#FFE138",
  "#3877FF",
];

const arena = createMatrix(12, 20);

const player = {
  pos: { x: 0, y: 0 },
  matrix: null,
  score: 0,
};

function holdCurrentPiece() {
  if (!canHold) return;

  if (holdPiece === null) {
    holdPiece = player.matrix;
    playerReset();
  } else {
    const temp = player.matrix;
    player.matrix = holdPiece;
    holdPiece = temp;
    player.pos.y = 0;
    player.pos.x =
      Math.floor(arena[0].length / 2) - Math.floor(player.matrix[0].length / 2);
  }

  canHold = false;
  drawHoldPiece();
}

function createTetrominoes() {
  const tetrominoes = "IJLOSTZ";
  for (let i = 0; i < 20; i++) {
    const tetromino = document.createElement("div");
    tetromino.classList.add("tetromino");
    tetromino.textContent =
      tetrominoes[Math.floor(Math.random() * tetrominoes.length)];
    tetromino.style.left = `${Math.random() * 100}%`;
    tetromino.style.top = `${Math.random() * 100}%`;
    tetromino.style.transform = `rotate(${Math.random() * 360}deg)`;
    document.body.appendChild(tetromino);
  }
}

createTetrominoes();

function startGame() {
  gameState = "playing";
  document.getElementById("startScreen").style.display = "none";
  playerReset();
  updateScore();
  drawNextPiece();
  drawHoldPiece();
  update();
}

function gameOver() {
  gameState = "gameOver";
  document.getElementById("gameOverScreen").style.display = "flex";
  document.getElementById(
    "finalScore"
  ).textContent = `Puntuación final: ${player.score}`;
}

function restartGame() {
  arena.forEach((row) => row.fill(0));
  player.score = 0;
  level = 1;
  linesCleared = 0;
  dropInterval = 1000;
  gameState = "playing";
  document.getElementById("gameOverScreen").style.display = "none";
  playerReset();
  updateScore();
  drawNextPiece();
  drawHoldPiece();
  update();
}

document.getElementById("startButton").addEventListener("click", startGame);
document.getElementById("restartButton").addEventListener("click", restartGame);

// Inicialización
createTetrominoes();
drawNextPiece();
drawHoldPiece();
