// Get the HTML elements we need
const journal = document.getElementById("journal");
const buttons = document.getElementById("buttons");

// Add a message to the game
function addMessage(text, type = "message") {
    const message = document.createElement("div");

    message.className = "message " + type;
    message.innerText = text;

    journal.appendChild(message);

    // Keep the latest message visible
    journal.scrollTop = journal.scrollHeight;
}

// Remove old buttons
function clearButtons() {
    buttons.innerHTML = "";
}

// Ask a question with Yes and No buttons
function askYesNo(question, yesText = "Yes", noText = "No") {

    addMessage(question, "question");

    return new Promise(function (resolve) {

        clearButtons();

        const yesButton = document.createElement("button");
        yesButton.innerText = yesText;

        const noButton = document.createElement("button");
        noButton.innerText = noText;
        noButton.className = "no-button";

        yesButton.onclick = function () {
            addMessage(yesText, "answer");
            clearButtons();
            resolve(true);
        };

        noButton.onclick = function () {
            addMessage(noText, "answer");
            clearButtons();
            resolve(false);
        };

        buttons.appendChild(yesButton);
        buttons.appendChild(noButton);
    });
}

// Show multiple choices
function askChoice(question, choices) {

    addMessage(question, "question");

    return new Promise(function (resolve) {

        clearButtons();

        choices.forEach(function (choice) {

            const button = document.createElement("button");

            button.innerText = choice.label;

            button.onclick = function () {
                addMessage(choice.label, "answer");
                clearButtons();
                resolve(choice.value);
            };

            buttons.appendChild(button);
        });
    });
}

// Ask the player to type something
function askText(question, placeholder, isNumber = false) {

    addMessage(question, "question");

    return new Promise(function (resolve) {

        clearButtons();

        const row = document.createElement("div");
        row.className = "input-row";

        const input = document.createElement("input");

        if (isNumber) {
            input.type = "number";
        } else {
            input.type = "text";
        }

        input.placeholder = placeholder;

        const button = document.createElement("button");
        button.innerText = "Submit";

        function submitAnswer() {

            const value = input.value.trim();

            addMessage(value || "(nothing)", "answer");

            clearButtons();

            resolve(value);
        }

        button.onclick = submitAnswer;

        input.addEventListener("keydown", function (event) {
            if (event.key === "Enter") {
                submitAnswer();
            }
        });

        row.appendChild(input);
        row.appendChild(button);

        buttons.appendChild(row);

        input.focus();
    });
}

// Show the ending message
function showFinished() {

    clearButtons();

    const message = document.createElement("div");
    message.className = "finished";
    message.innerText = "The adventure ends here. Thanks for playing!";

    buttons.appendChild(message);
}



// Game over function
function gameOver(message) {

    addMessage(message, "game-over");
    addMessage("Game Over! Thanks for playing.", "game-over");

    // Create restart button
    const restartButton = document.createElement("button");

    restartButton.innerText = "Restart Game";

    restartButton.onclick = function() {
        // Clear old game messages
        journal.innerHTML = "";
        clearButtons();

        // Start the game again
        startGame();
    };

    buttons.appendChild(restartButton);
}



// Number guessing part of the game
async function treasurePuzzle() {

    const targetNumber = Math.floor(Math.random() * 50);

    let attempts = 7;

    while (attempts > 0) {

        const guessText = await askText(
            "Guess the secret number between 0 and 49.",
            "Enter your number",
            true
        );

        const guess = Number(guessText);

        if (guess === targetNumber) {

            addMessage("🎉 Congratulations! You found the treasure!", "win");
            return;

        } else if (guess > targetNumber) {

            addMessage("Try a lower number.");

        } else {

            addMessage("Try a higher number.");
        }

        attempts--;

        if (attempts > 0) {
            addMessage("Attempts left: " + attempts);
        }
    }

    gameOver("You ran out of attempts. The treasure is still hidden.");
}

// Jungle path
async function junglePath() {

    addMessage("🌲 You entered the jungle.");

    const trap = Math.floor(Math.random() * 10);

    if (trap % 2 === 0) {

        addMessage("😅 You are lucky! You escaped a hidden trap.");

        const tool = await askChoice(
            "Choose a tool:",
            [
                { label: "Knife", value: "knife" },
                { label: "Torch", value: "torch" },
                { label: "Stick", value: "stick" }
            ]
        );

        if (tool === "knife") {

            addMessage("The bear is scared and runs away.");
            addMessage("There is a cave ahead. It may have the treasure.");

            await treasurePuzzle();

        } else if (tool === "torch") {

            addMessage("You found a path through the jungle.");
            addMessage("There is a cave ahead.");

            await treasurePuzzle();

        } else {

            gameOver("The stick was not a good choice!");
        }

    } else {

        gameOver("You fell into a hidden trap. Game Over!");
    }
}

// Beach path
async function beachPath() {

    addMessage("🏖️ You are walking along the beach.");

    const bottle = Math.floor(Math.random() * 10);

    if (bottle % 2 === 0) {

        addMessage("🍾 You found a message in a bottle!");

        const readMessage = await askYesNo(
            "Do you want to read the message?"
        );

        if (!readMessage) {
            gameOver("You decided not to read it.");
            return;
        }

        addMessage(
            "📜 The message says: Dig where the palm tree shadow falls at noon."
        );

        const dig = await askYesNo("Do you want to dig there?");

        if (!dig) {
            gameOver("You missed your chance.");
            return;
        }

        const spot = await askChoice(
            "Where do you want to dig?",
            [
                { label: "Left of palm tree", value: 1 },
                { label: "Right of palm tree", value: 2 },
                { label: "Under the palm tree", value: 3 }
            ]
        );

        if (spot === 2) {

            addMessage("🎉 You found a treasure chest!");
            await treasurePuzzle();

        } else {

            gameOver("❌ Wrong place! A crab bit you.");
        }

    } else {

        addMessage("🌊 A big wave is coming!");

        const run = await askYesNo("Do you want to run?");

        if (run) {

            addMessage("😅 You escaped the wave!");
            addMessage("You are back at the beginning.");

            await startGame();

        } else {

            gameOver("🌊 The wave carried you away.");
        }
    }
}

// Start the story
async function startGame() {

    addMessage("🏴‍☠️ Welcome to Treasure Hunter: The Lost Island!");

    const name = await askText(
        "What is your name, explorer?",
        "Enter your name"
    );

    addMessage(
        "Good luck, " + (name || "explorer") + "!"
    );

    const enterIsland = await askYesNo(
        "You see a dangerous island. Do you want to enter?"
    );

    if (!enterIsland) {
        addMessage("You chose to stay safe.");
        return;
    }

    const path = await askChoice(
        "Choose your path:",
        [
            { label: "🌲 Jungle", value: "jungle" },
            { label: "🏖️ Beach", value: "beach" }
        ]
    );

    if (path === "jungle") {
        await junglePath();
    } else {
        await beachPath();
    }
}

// Main game
async function main() {

    const start = await askYesNo(
        "Shall we begin the game?",
        "Start Game",
        "Exit"
    );

    if (start) {

        await startGame();

    } else {

        addMessage("Okay! Maybe next time.");
        showFinished();
    }
}

// Start the game
main();
