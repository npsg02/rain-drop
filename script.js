// Game state
let score = 0;
let lives = 3;
let level = 1;
let gameRunning = false;
let selectedRaindrop = null;
let raindrops = [];
let dropInterval;
let difficulty = 'medium';

// DOM elements
const scoreEl = document.getElementById('score');
const livesEl = document.getElementById('lives');
const levelEl = document.getElementById('level');
const gameArea = document.getElementById('game-area');
const raindropsContainer = document.getElementById('raindrops');
const answerInput = document.getElementById('answer-input');
const submitBtn = document.getElementById('submit-btn');
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');
const difficultySelect = document.getElementById('difficulty-select');
const gameOverScreen = document.getElementById('game-over');
const finalScoreEl = document.getElementById('final-score');

// Difficulty settings
const difficultySettings = {
    easy: { interval: 3000, speed: 8, maxNumber: 10 },
    medium: { interval: 2000, speed: 6, maxNumber: 20 },
    hard: { interval: 1500, speed: 4, maxNumber: 50 }
};

// Math problem generation
function generateProblem() {
    const settings = difficultySettings[difficulty];
    const operations = ['+', '-', '*'];
    const operation = operations[Math.floor(Math.random() * operations.length)];
    
    let num1, num2, answer;
    
    switch (operation) {
        case '+':
            num1 = Math.floor(Math.random() * settings.maxNumber) + 1;
            num2 = Math.floor(Math.random() * settings.maxNumber) + 1;
            answer = num1 + num2;
            break;
        case '-':
            num1 = Math.floor(Math.random() * settings.maxNumber) + 1;
            num2 = Math.floor(Math.random() * num1) + 1;
            answer = num1 - num2;
            break;
        case '*':
            num1 = Math.floor(Math.random() * Math.min(settings.maxNumber / 2, 12)) + 1;
            num2 = Math.floor(Math.random() * Math.min(settings.maxNumber / 2, 12)) + 1;
            answer = num1 * num2;
            break;
    }
    
    return {
        problem: `${num1} ${operation} ${num2}`,
        answer: answer
    };
}

// Create raindrop
function createRaindrop() {
    if (!gameRunning) return;
    
    const { problem, answer } = generateProblem();
    const raindrop = document.createElement('div');
    raindrop.className = 'raindrop';
    raindrop.textContent = problem;
    raindrop.dataset.answer = answer;
    
    // Random horizontal position
    const maxLeft = gameArea.offsetWidth - 100;
    const left = Math.floor(Math.random() * maxLeft);
    raindrop.style.left = `${left}px`;
    raindrop.style.top = '-80px';
    
    // Animation duration based on difficulty
    const settings = difficultySettings[difficulty];
    raindrop.style.animationDuration = `${settings.speed}s`;
    
    raindropsContainer.appendChild(raindrop);
    raindrops.push({ element: raindrop, answer: answer });
    
    // Click handler
    raindrop.addEventListener('click', () => selectRaindrop(raindrop));
    
    // Check if raindrop reached bottom
    setTimeout(() => {
        if (raindrop.parentElement && gameRunning) {
            loseLife();
            removeRaindrop(raindrop);
        }
    }, settings.speed * 1000);
}

// Select raindrop
function selectRaindrop(raindrop) {
    if (!gameRunning) return;
    
    // Deselect previous
    if (selectedRaindrop) {
        selectedRaindrop.classList.remove('selected');
    }
    
    // Select new
    selectedRaindrop = raindrop;
    raindrop.classList.add('selected');
    answerInput.focus();
}

// Remove raindrop
function removeRaindrop(raindrop) {
    const index = raindrops.findIndex(drop => drop.element === raindrop);
    if (index > -1) {
        raindrops.splice(index, 1);
    }
    if (raindrop.parentElement) {
        raindrop.remove();
    }
}

// Submit answer
function submitAnswer() {
    if (!selectedRaindrop || !gameRunning) return;
    
    const userAnswer = parseInt(answerInput.value);
    const correctAnswer = parseInt(selectedRaindrop.dataset.answer);
    
    if (userAnswer === correctAnswer) {
        // Correct answer
        score += 10 * level;
        updateScore();
        removeRaindrop(selectedRaindrop);
        
        // Level up every 100 points
        if (score > 0 && score % 100 === 0) {
            levelUp();
        }
    } else {
        // Wrong answer
        loseLife();
    }
    
    selectedRaindrop = null;
    answerInput.value = '';
}

// Update score display
function updateScore() {
    scoreEl.textContent = score;
}

// Level up
function levelUp() {
    level++;
    levelEl.textContent = level;
    
    // Increase difficulty slightly
    const settings = difficultySettings[difficulty];
    if (settings.speed > 3) {
        settings.speed -= 0.3;
    }
    if (settings.interval > 1000) {
        settings.interval -= 200;
        clearInterval(dropInterval);
        dropInterval = setInterval(createRaindrop, settings.interval);
    }
}

// Lose life
function loseLife() {
    lives--;
    livesEl.textContent = lives;
    
    if (lives <= 0) {
        gameOver();
    }
}

// Start game
function startGame() {
    // Reset game state
    score = 0;
    lives = 3;
    level = 1;
    gameRunning = true;
    selectedRaindrop = null;
    raindrops = [];
    
    // Update display
    updateScore();
    livesEl.textContent = lives;
    levelEl.textContent = level;
    
    // Clear existing raindrops
    raindropsContainer.innerHTML = '';
    
    // Enable controls
    answerInput.disabled = false;
    submitBtn.disabled = false;
    answerInput.value = '';
    
    // Hide menu and game over screen
    startBtn.style.display = 'none';
    difficultySelect.disabled = true;
    gameOverScreen.classList.add('hidden');
    
    // Get difficulty settings
    difficulty = difficultySelect.value;
    const settings = difficultySettings[difficulty];
    
    // Start creating raindrops
    dropInterval = setInterval(createRaindrop, settings.interval);
    
    // Create first raindrop immediately
    createRaindrop();
}

// Game over
function gameOver() {
    gameRunning = false;
    
    // Stop creating raindrops
    clearInterval(dropInterval);
    
    // Remove all raindrops
    raindrops.forEach(drop => {
        if (drop.element.parentElement) {
            drop.element.remove();
        }
    });
    raindrops = [];
    
    // Disable controls
    answerInput.disabled = true;
    submitBtn.disabled = true;
    
    // Show game over screen
    finalScoreEl.textContent = score;
    gameOverScreen.classList.remove('hidden');
    
    // Show start button
    startBtn.style.display = 'inline-block';
    difficultySelect.disabled = false;
}

// Event listeners
startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', () => {
    gameOverScreen.classList.add('hidden');
    startGame();
});

submitBtn.addEventListener('click', submitAnswer);

answerInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        submitAnswer();
    }
});

// Initialize
updateScore();
