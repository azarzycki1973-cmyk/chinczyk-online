
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const diceCanvas = document.getElementById("diceCanvas");
const diceCtx = diceCanvas.getContext("2d");

diceCanvas.width = 140;
diceCanvas.height = 140;

if (!canvas || !ctx) {
    alert("Canvas error");
    throw new Error("Canvas fail");
}

// ===== SKALA =====
let boardSize = 800;
let scale = 1;

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    boardSize = Math.min(canvas.width * 0.75, canvas.height * 0.95);
    scale = boardSize / 800;
}
window.addEventListener("resize", resize);
resize();
function easeOut(t) {
    return 1 - Math.pow(1 - t, 3);
}
// ===== OBRAZY =====
const boardImg = new Image();
boardImg.src = "images/plansza.png";

const pawns = {
    RED: new Image(),
    BLUE: new Image(),
    GREEN: new Image(),
    YELLOW: new Image()
};

pawns.RED.src = "images/czerwony.png";
pawns.BLUE.src = "images/niebieski.png";
pawns.GREEN.src = "images/zielony.png";
pawns.YELLOW.src = "images/zolty.png";
const diceImg = new Image();
diceImg.src = "images/dice.webp";

const DICE_FRAMES = 6;

let diceFrameW = 0;
let diceFrameH = 0;

let diceRolling = false;
let diceStart = 0;
let diceDuration = 1600;

let diceFrame = 0;
let diceRotation = 0;
let diceScale = 1;
let diceOffsetY = 0;

let pendingDiceValue = null;

diceImg.onload = () => {

    diceFrameW = diceImg.width / DICE_FRAMES;
    diceFrameH = diceImg.height;
};

// ===== TRASY =====
const PATHS = {

  // ===== BLUE =====
  "B_0":[465,60],
  "B_1":[465,130],
  "B_2":[465,196],
  "B_3":[465,265],
  "B_4":[465,335],
  "B_5":[532,335],
  "B_6":[598,335],
  "B_7":[668,335],
  "B_8":[735,335],
  "B_9":[735,400],
  "B_10":[735,469],
  "B_11":[668,469],
  "B_12":[598,469],
  "B_13":[532,469],
  "B_14":[465,469],
  "B_15":[465,536],
  "B_16":[465,602],
  "B_17":[465,670],
  "B_18":[465,735],
  "B_19":[400,735],
  "B_20":[333,735],
  "B_21":[333,670],
  "B_22":[333,602],
  "B_23":[333,536],
  "B_24":[333,469],
  "B_25":[265,469],
  "B_26":[195,469],
  "B_27":[126,469],
  "B_28":[60,469],
  "B_29":[60,400],
  "B_30":[60,335],
  "B_31":[126,335],
  "B_32":[195,335],
  "B_33":[265,335],
  "B_34":[333,335],
  "B_35":[333,265],
  "B_36":[333,196],
  "B_37":[333,130],
  "B_38":[333,60],
  "B_39":[400,60],
  "B_40":[400,130],
  "B_41":[400,196],
  "B_42":[400,265],
  "B_43":[400,335],

  // ===== RED =====
  "R_0":[60,335],
  "R_1":[130,335],
  "R_2":[196,335],
  "R_3":[265,335],
  "R_4":[333,335],
  "R_5":[333,265],
  "R_6":[333,196],
  "R_7":[333,130],
  "R_8":[333,60],
  "R_9":[400,60],
  "R_10":[469,60],
  "R_11":[469,130],
  "R_12":[469,196],
  "R_13":[469,265],
  "R_14":[469,335],
  "R_15":[536,335],
  "R_16":[602,335],
  "R_17":[670,335],
  "R_18":[735,335],
  "R_19":[735,400],
  "R_20":[735,469],
  "R_21":[670,469],
  "R_22":[602,469],
  "R_23":[536,469],
  "R_24":[469,469],
  "R_25":[469,536],
  "R_26":[469,602],
  "R_27":[469,670],
  "R_28":[469,735],
  "R_29":[400,735],
  "R_30":[333,735],
  "R_31":[333,670],
  "R_32":[333,602],
  "R_33":[333,536],
  "R_34":[333,469],
  "R_35":[265,469],
  "R_36":[196,469],
  "R_37":[130,469],
  "R_38":[60,469],
  "R_39":[60,400],
  "R_40":[130,400],
  "R_41":[196,400],
  "R_42":[265,400],
  "R_43":[333,400],

  // ===== YELLOW =====
  "Y_0":[333,735],
  "Y_1":[333,670],
  "Y_2":[333,602],
  "Y_3":[333,536],
  "Y_4":[333,469],
  "Y_5":[265,469],
  "Y_6":[195,469],
  "Y_7":[130,469],
  "Y_8":[60,469],
  "Y_9":[60,400],
  "Y_10":[60,333],
  "Y_11":[130,333],
  "Y_12":[195,333],
  "Y_13":[265,333],
  "Y_14":[333,333],
  "Y_15":[333,265],
  "Y_16":[333,196],
  "Y_17":[333,130],
  "Y_18":[333,60],
  "Y_19":[400,60],
  "Y_20":[469,60],
  "Y_21":[469,130],
  "Y_22":[469,196],
  "Y_23":[469,265],
  "Y_24":[469,333],
  "Y_25":[536,333],
  "Y_26":[602,333],
  "Y_27":[670,333],
  "Y_28":[735,333],
  "Y_29":[735,400],
  "Y_30":[735,469],
  "Y_31":[670,469],
  "Y_32":[602,469],
  "Y_33":[536,469],
  "Y_34":[469,469],
  "Y_35":[469,536],
  "Y_36":[469,602],
  "Y_37":[469,670],
  "Y_38":[469,735],
  "Y_39":[400,735],
  "Y_40":[400,670],
  "Y_41":[400,602],
  "Y_42":[400,536],
  "Y_43":[400,469],

  // ===== GREEN =====
  "G_0":[735,469],
  "G_1":[670,469],
  "G_2":[602,469],
  "G_3":[536,469],
  "G_4":[469,469],
  "G_5":[469,536],
  "G_6":[469,602],
  "G_7":[469,670],
  "G_8":[469,735],
  "G_9":[400,735],
  "G_10":[333,735],
  "G_11":[333,670],
  "G_12":[333,602],
  "G_13":[333,536],
  "G_14":[333,469],
  "G_15":[265,469],
  "G_16":[195,469],
  "G_17":[130,469],
  "G_18":[60,469],
  "G_19":[60,400],
  "G_20":[60,333],
  "G_21":[130,333],
  "G_22":[195,333],
  "G_23":[265,333],
  "G_24":[333,333],
  "G_25":[333,265],
  "G_26":[333,196],
  "G_27":[333,130],
  "G_28":[333,60],
  "G_29":[400,60],
  "G_30":[465,60],
  "G_31":[465,130],
  "G_32":[465,196],
  "G_33":[465,265],
  "G_34":[465,333],
  "G_35":[532,333],
  "G_36":[598,333],
  "G_37":[668,333],
  "G_38":[735,333],
  "G_39":[735,400],
  "G_40":[670,400],
  "G_41":[602,400],
  "G_42":[536,400],
  "G_43":[465,400]
};

// ===== START POS =====
const START_POS = {
    RED: [[126,129],[128,58],[59,58],[59,126]],
    BLUE: [[667,61],[667,128],[734,59],[733,126]],
    GREEN:[[667,667],[735,667],[670,735],[734,735]],
    YELLOW:[[128,668],[61,669],[61,735],[130,738]]
};

// ===== STAN =====
let pawnsState = {
    RED: [-1,-1,-1,-1],
    BLUE: [-1,-1,-1,-1],
    GREEN: [-1,-1,-1,-1],
    YELLOW: [-1,-1,-1,-1]
};

const SAFE_POSITIONS = [0];

// ===== HELPER =====
function getCoords(color, pos) {
    return PATHS[`${color[0]}_${pos}`];
}

function getPlayablePawns(color, dice) {

    const result = [];

    pawnsState[color].forEach((pos, i) => {

        if (pos === -1) return;
        if (pos === 43) return;

        if (pos + dice <= 43) {
            result.push(i);
        }
    });

    return result;
}

// ===== GRACZE =====
let players = [];
const COLORS = ["RED","BLUE","GREEN","YELLOW"];

function updateInputs() {
    const count = parseInt(document.getElementById("players").value);
    const container = document.getElementById("inputs");

    container.innerHTML = "";

    for (let i = 0; i < count; i++) {
        container.innerHTML += `<input id="nick${i}" placeholder="Gracz ${i+1}">`;
    }
}
window.updateInputs = updateInputs;
updateInputs();

function startGame() {
if (players.length > 0) {

    document.getElementById("rollBtn")
        .style.display = "block";

    currentTurn = 0;
    currentPlayer = players[0];

    updateInfo(`
        Teraz rzuca:
        <b>${players[0].nick}</b>
    `);

    return;
}
    const count = parseInt(document.getElementById("players").value);

    players = [];

    for (let i = 0; i < count; i++) {

        const nick =
            document.getElementById("nick" + i).value || ("Gracz" + (i + 1));

        players.push({
            nick,
            color: COLORS[i]
        });
    }

    while (players.length < 4) {

        const color = COLORS[players.length];

        players.push({
            nick: `AI ${color}`,
            color
        });
    }

    // ===== UKRYJ MENU =====
    document.getElementById("players").style.display = "none";
    document.getElementById("inputs").style.display = "none";
    document.querySelector("button").style.display = "none";

    // ===== POKAŻ RZUT =====
    document.getElementById("rollBtn").style.display = "block";

    currentTurn = 0;
    currentPlayer = players[0];

    updateInfo(`Teraz rzuca: <b>${players[0].nick}</b>`);
}
// ===== TURY =====
let currentTurn = 0;
let currentPlayer = null;

let pendingDice = null;
let selectablePawns = [];
function updateInfo(text) {
    document.getElementById("info").innerHTML = text;
}

// ===== KOSTKA =====
function rollDice() {
	if(
    !currentPlayer.nick.startsWith("AI") &&
    currentPlayer.nick !== myNick
){
    return;
}

    if (!currentPlayer) return;
	if (
    !(
    currentPlayer.nick.startsWith("AI") ||
    currentPlayer.nick.startsWith("CPU")
)
    aiThinking
) return;
    if (isAnimating) return;
    if (diceRolling) return;
    if (pendingDice !== null) return;

    pendingDiceValue =
        Math.floor(Math.random() * 6) + 1;

    diceRolling = true;
    diceStart = performance.now();
}
function updateDice(time) {

    if (!diceRolling) return;

    let t = (time - diceStart) / diceDuration;

    if (t >= 1) {

        t = 1;

        diceRolling = false;

        diceFrame = pendingDiceValue - 1;

        diceRotation = 0;
        diceScale = 1;
        diceOffsetY = 0;

        // 🔥 TU ODDAJEMY DO STAREJ LOGIKI
        handleMove(pendingDiceValue);

        return;
    }

    const e = easeOut(t);

    diceFrame = Math.floor(Math.random() * 6);

    diceRotation = e * Math.PI * 4;

    diceScale =
        1 + Math.sin(t * Math.PI) * 0.15;

    diceOffsetY =
        Math.sin(t * Math.PI) * -15;
}

function drawDice() {

    diceCtx.fillStyle = "black";

    diceCtx.fillRect(
        0,
        0,
        diceCanvas.width,
        diceCanvas.height
    );

    if (!diceImg.complete) return;

    const size = 90;

    diceCtx.save();

    diceCtx.translate(
        diceCanvas.width / 2,
        diceCanvas.height / 2 + diceOffsetY
    );

    diceCtx.rotate(diceRotation);

    diceCtx.scale(
        diceScale,
        diceScale
    );

    diceCtx.drawImage(
        diceImg,
        diceFrame * diceFrameW,
        0,
        diceFrameW,
        diceFrameH,
        -size / 2,
        -size / 2,
        size,
        size
    );

    diceCtx.restore();
}
// ===== RUCH =====
function spawnPawn(color) {
    const i = pawnsState[color].findIndex(p => p === -1);

    if(i === -1) return false;

    pawnsState[color][i] = 0;
    return true;
}

function animateMove(color, pawnIndex, steps, onFinish) {

    let step = 0;
    isAnimating = true;

    function nextStep() {

        if (step >= steps) {
			checkCapture(color, pawnIndex);
            isAnimating = false;
            animation = null;

            if (onFinish) onFinish();
            return;
        }

        const startPos = pawnsState[color][pawnIndex];

        if (startPos + 1 > 43) {
            isAnimating = false;
            animation = null;

            if (onFinish) onFinish();
            return;
        }

        const endPos = startPos + 1;

        let progress = 0;
        const duration = 180;

        function frame() {

            progress += 16 / duration;

            if (progress >= 1) {

                pawnsState[color][pawnIndex] = endPos;

                step++;
                nextStep();
                return;
            }

            const p1 = getCoords(color, startPos);
            const p2 = getCoords(color, endPos);

            const x = p1[0] + (p2[0] - p1[0]) * progress;
            const y = p1[1] + (p2[1] - p1[1]) * progress;

            const jump = Math.sin(progress * Math.PI) * 12;

            animation = {
                color,
                pawnIndex,
                x,
                y: y - jump,
                scale: 1 + Math.sin(progress * Math.PI) * 0.25
            };

            requestAnimationFrame(frame);
        }

        requestAnimationFrame(frame);
    }

    nextStep();
}

function movePawn(color, i, val, callback) {

    if (i === -1) {
        if (callback) callback();
        return;
    }

    if (pawnsState[color][i] === -1) return;
    if (pawnsState[color][i] === 43) return;

    if (pawnsState[color][i] + val > 43) {
        if (callback) callback();
        return;
    }

    animateMove(color, i, val, callback);
}
function animateReturn(color, pawnIndex, onFinish) {

    isAnimating = true;

    function stepBack() {

        const pos = pawnsState[color][pawnIndex];

        // dotarł do wejścia
        if (pos <= 1) {

            pawnsState[color][pawnIndex] = -1;

            isAnimating = false;
            animation = null;

            if (onFinish) onFinish();

            return;
        }

        const startPos = pos;
        const endPos = Math.max(1, pos - 1);

        let progress = 0;
        const duration = 320;

        function frame() {

            progress += 16 / duration;

            if (progress >= 1) {

                pawnsState[color][pawnIndex] = endPos;

                stepBack();
                return;
            }

            const p1 = getCoords(color, startPos);
            const p2 = getCoords(color, endPos);

            const x = p1[0] + (p2[0] - p1[0]) * progress;
            const y = p1[1] + (p2[1] - p1[1]) * progress;

            animation = {
                color,
                pawnIndex,
                x,
                y,
                scale: 1
            };

            requestAnimationFrame(frame);
        }

        requestAnimationFrame(frame);
    }

    stepBack();
}
function checkCapture(color, pawnIndex) {

    const myPos = pawnsState[color][pawnIndex];

    if (myPos === -1) return;
    if (myPos === 43) return;

    const myCoords = getCoords(color, myPos);

    if (!myCoords) return;

    let captured = null;

    for (let c in pawnsState) {

        if (c === color) continue;

        pawnsState[c].forEach((pos, i) => {

            if (captured) return;

            if (pos === -1) return;
            if (pos === 43) return;

            const enemyCoords = getCoords(c, pos);

            if (!enemyCoords) return;

            const dx = Math.abs(myCoords[0] - enemyCoords[0]);
            const dy = Math.abs(myCoords[1] - enemyCoords[1]);

            if (dx <= 10 && dy <= 10) {

                // start bezpieczny
                if (pos === 0) return;

                captured = {
                    color: c,
                    index: i
                };
            }
        });
    }

    if (captured) {
        animateReturn(captured.color, captured.index);
    }
}

function nextPlayer() {

    currentTurn =
        (currentTurn + 1) % players.length;

    currentPlayer =
        players[currentTurn];

    updateInfo(`
        Teraz rzuca: <b>${currentPlayer.nick}</b>
    `);

    // ===== CPU AUTO =====
    if (
        currentPlayer.nick.startsWith("CPU") ||
        currentPlayer.nick.startsWith("AI")
    ) {

        aiThinking = true;

        aiBlinkCount = 0;
    }
}

function handleMove(val) {

    const c = currentPlayer.color;
    const playerName = currentPlayer.nick;

    const hasPawn = pawnsState[c].some(p => p !== -1 && p !== 43);

    // ===== brak pionków =====
    if (!hasPawn && val !== 6) {

        nextPlayer();

        updateInfo(`
            <b>${playerName}</b> wyrzucił: <b>${val}</b><br>
            Musisz wyrzucić 6 aby wyjść<br>
            Teraz rzuca: <b>${currentPlayer.nick}</b>
        `);

        return;
    }

// ===== spawn =====
if (val === 6) {

    const spawned = spawnPawn(c);

    if (spawned) {

        updateInfo(`
            <b>${playerName}</b> wyrzucił: <b>${val}</b><br>
            Pionek wchodzi do gry<br>
            Rzucasz jeszcze raz
        `);

        // ===== AI rzuca ponownie =====
        if (
    currentPlayer.nick.startsWith("AI") ||
    currentPlayer.nick.startsWith("CPU")
) {

            aiThinking = true;
            aiBlinkCount = 0;
        }

        return;
    }
}

    const playable = getPlayablePawns(c, val);

    if (playable.length === 0) {

        nextPlayer();

        updateInfo(`
            <b>${playerName}</b> wyrzucił: <b>${val}</b><br>
            Brak możliwego ruchu<br>
            Teraz rzuca: <b>${currentPlayer.nick}</b>
        `);

        return;
    }

   // ===== CZŁOWIEK =====
if (
    !currentPlayer.nick.startsWith("AI") &&
    !currentPlayer.nick.startsWith("CPU")
) {

    pendingDice = val;
    selectablePawns = playable;

    updateInfo(`
        <b>${playerName}</b> wyrzucił: <b>${val}</b><br>
        Wybierz pionek
    `);

    return;
}

// ===== CPU =====
const pawnIndex = playable[0];

movePawn(c, pawnIndex, val, () => {

    if (val !== 6) {
        nextPlayer();
    }

    updateInfo(`
        <b>${playerName}</b> wyrzucił: <b>${val}</b><br>
        Teraz rzuca: <b>${currentPlayer.nick}</b>
    `);
	
});
}
// ===== RYSOWANIE =====
function drawBoard() {

    if (!boardImg.complete) return;

    const offsetX = (canvas.width - boardSize) / 2;
    const offsetY = (canvas.height - boardSize) / 2;

    ctx.drawImage(
        boardImg,
        offsetX,
        offsetY,
        boardSize,
        boardSize
    );
}
function sx(x) {
    return (canvas.width - boardSize) / 2 + x * scale;
}

function sy(y) {
    return (canvas.height - boardSize) / 2 + y * scale;
}
function drawPawn(color, x, y) {

    const img = pawns[color];
    if (!img.complete) return;

    const size = 68 * scale;

    ctx.drawImage(
        img,
        sx(x) - size / 2,
        sy(y) - size / 2,
        size,
        size
    );
}
function drawPawnScaled(color, x, y, scaleMul) {

    const img = pawns[color];
    if (!img.complete) return;

    const size = 68 * scale * scaleMul;

    ctx.drawImage(
        img,
        sx(x) - size / 2,
        sy(y) - size / 2,
        size,
        size
    );
}

let animation = null;
let isAnimating = false;
let blinkTimer = 0;
let blinkVisible = true;
let aiBlinkCount = 0;
let aiThinking = false;
///////////
function drawAllPawns() {

    for (let color in pawnsState) {

        pawnsState[color].forEach((pos, i) => {

            // ===== animowany pionek =====
            if (
                animation &&
                animation.color === color &&
                animation.pawnIndex === i
            ) {
                return;
            }

            // ===== pionek w domku =====
            if (pos === -1) {

                // ===== miganie aktywnego gracza =====
                if (
                    currentPlayer &&
                    currentPlayer.color === color &&
                    !blinkVisible
                ) {
                    return;
                }

                const p = START_POS[color][i];

                drawPawn(color, p[0], p[1]);
            }

            // ===== pionek na planszy =====
            else {

                const p = getCoords(color, pos);

                if (p) {
                    drawPawn(color, p[0], p[1]);
                }
            }

        });
    }

    // ===== animowany pionek =====
    if (animation) {

        drawPawnScaled(
            animation.color,
            animation.x,
            animation.y,
            animation.scale
        );
    }
}
function drawPlayerNames() {

    ctx.fillStyle = "black";
    ctx.font = `${16 * scale}px Arial`;
    ctx.textAlign = "center";

    players.forEach(p => {

        let x = 0;
        let y = 0;

        // ===== RED =====
        if (p.color === "RED") {
            x = 95;
            y = 20;
        }

        // ===== BLUE =====
        if (p.color === "BLUE") {
            x = 705;
            y = 20;
        }

        // ===== YELLOW =====
        if (p.color === "YELLOW") {
            x = 95;
            y = 785;
        }

        // ===== GREEN =====
        if (p.color === "GREEN") {
            x = 705;
            y = 785;
        }

        ctx.fillText(
            p.nick,
            sx(x),
            sy(y)
        );
    });
}
canvas.addEventListener("click", e => {

    if (pendingDice === null) return;

    const rect = canvas.getBoundingClientRect();

    const mx = (e.clientX - rect.left - (canvas.width - boardSize) / 2) / scale;
    const my = (e.clientY - rect.top - (canvas.height - boardSize) / 2) / scale;

    const color = currentPlayer.color;

    selectablePawns.forEach(i => {

        const pos = pawnsState[color][i];

        const p = getCoords(color, pos);

        if (!p) return;

        const dx = mx - p[0];
        const dy = my - p[1];

        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist <= 35) {

            const dice = pendingDice;

            pendingDice = null;
            selectablePawns = [];

            movePawn(color, i, dice, () => {

                if (dice !== 6) {
                    nextPlayer();
                }

                updateInfo(`
                    <b>${currentPlayer.nick}</b> rzuca
                `);
            });
        }
    });
});

// ===== LOOP =====
function loop() {

    if (performance.now() - blinkTimer > 500) {

        blinkTimer = performance.now();

        blinkVisible = !blinkVisible;

        // ===== AI ODLICZANIE =====
        if (aiThinking) {

            aiBlinkCount++;

            // 5 mignięć
            if (aiBlinkCount >= 2) {

                aiThinking = false;

                rollDice();
            }
        }
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawBoard();
    drawAllPawns();
    drawPlayerNames();

    updateDice(performance.now());
    drawDice();

    requestAnimationFrame(loop);
}

window.startRenderLoop = function(){

    loop();
}