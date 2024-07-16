let englishDictionary
let irishDictionary

let targetWords
let targetWordNumber

// This is selected based on the number of days since January 1st, 2024. With the day number as the index from the targetWords array
const offsetFromData = new Date(2024, 0, 1)
let targetWord

let gameState = {
    puzzle: targetWordNumber,
    letters: [],
    attempts: 0,
    progress: "in-progress",
    completed: false
}
let stateWasLoaded = false
let wasReset = false

fetchCSV()

let lastPage

const WORD_LENGTH = 5
const FLIP_ANIMATION_DURATION = 500
const DANCE_ANIMATION_DURATION = 500

const languageBadge = document.querySelector("[data-language-badge]")
const keyboard = document.querySelector("[data-keyboard]")
const guessGrid = document.querySelector("[data-guess-grid]")

const alertContainer = document.querySelector("[data-alert-container]")
const statsAlertContainer = document.querySelector("[data-stats-alert-container]")

// Custom event is 'onFirstCompletion' and the event detail is the current gameState at the time of completion
// This will include:
// gameState.puzzle (puzzle number as int)
// gameState.letters (array of objects with letters[i].letter and letters[i].state where letter is a string with a single letter, and state is a string of either 'wrong', 'wrong-location', or 'correct')
// gameState.attempts (number of attempts as int)
// gameState.progress (string of either 'in-progress', 'won', or 'lost')
// gameState.completed (boolean, this will always be true at the time of completion)

document.addEventListener('onFirstCompletion', e => {
    const customGameState = e.detail
    console.log("Event Detail: " + customGameState.letters.length)
})

async function fetchCSV() {
    try {
        const responseCSV = await fetch('Focail_Dictionary.csv');
        const csvText = await responseCSV.text();
        targetWords = parseCSV(csvText);

        const response2 = await fetch('englishDictionary.json');
        englishDictionary = await response2.json();

        const response3 = await fetch('irishDictionary.json');
        irishDictionary = await response3.json();

        const msOffset = Date.now() - offsetFromData
        const dayOffset = msOffset / 1000 / 60 / 60 / 24
        const targetIndex = Math.floor(dayOffset + 0) % targetWords.length
        const targetEntry = targetWords[targetIndex];
        targetWordNumber = targetEntry.Number
        targetWord = targetEntry.Word.toLowerCase()

        showBadge(targetEntry.Status)
        fetchGameState()
    } catch (error) {
        console.error('Error reading JSON file:', error);
    }
}

function fetchGameState() {
    // need to get the game state for the account from the main site?

    const localStateJSON = localStorage.getItem("gameState")
    let localGameState = null
    if (localStateJSON != null) {
        localGameState = JSON.parse(localStateJSON)

        // Only use the local game state if it is for todays puzzle
        if (localGameState.puzzle === targetWordNumber) {
            gameState = localGameState
        } else {
            resetGameState()
        }
    } else {
        resetGameState()
    }

    if (gameState.attempts > 0) {
        showPage("welcome-back")
    } else {
        showPage('info')
    }
}

function resetGameState() {
    gameState = {
        puzzle: targetWordNumber,
        letters: [],
        attempts: 0,
        progress: "in-progress",
        completed: false
    }

    storeData()
}

function playAgain() {
    wasReset = true
    setReplayButton(false)
    clearAlerts()

    const tiles = document.querySelectorAll('.tile')

    tiles.forEach(tile => {
        const letter = tile.textContent
        const key = keyboard.querySelector(`[data-key="${letter}"i]`)
        if (key != null) {
            key.classList.remove("wrong")
            key.classList.remove("wrong-location")
            key.classList.remove("correct")
        }

        tile.textContent = ""
        delete tile.dataset.state
        delete tile.dataset.letter
    })

    gameState = {
        puzzle: targetWordNumber,
        letters: [],
        attempts: 0,
        progress: "in-progress",
        completed: true
    }

    startInteraction()
}

function parseCSV(csv) {
    const lines = csv.split('\n');
    const headers = lines[0].split(',');

    const result = lines.slice(1).map(line => {
        const values = line.split(',');
        const obj = {};
        headers.forEach((header, index) => {
            obj[header.trim()] = values[index].trim();
        });
        return obj;
    });

    return result;
}

function startInteraction() {
    document, addEventListener("click", handleMouseClick)
    document, addEventListener("keydown", handleKeyPress)

    selectNextTile()
}

function stopInteraction(){
    document, removeEventListener("click", handleMouseClick)
    document, removeEventListener("keydown", handleKeyPress)

    deselectAllTiles()
}

function selectNextTile() {
    deselectAllTiles()

    const activeTiles = getActiveTiles()
    if (activeTiles.length >= WORD_LENGTH) return
    const nextTile = guessGrid.querySelector(":not([data-letter])")
    if (nextTile === null) return;
    
    nextTile.dataset.state = "next"
}

function deselectAllTiles(){
    const selectedTiles = guessGrid.querySelectorAll('[data-state="next"]')
    selectedTiles.forEach(tile => {
        delete tile.dataset.state
    })
}

function handleMouseClick(e) {
    if (e.target.matches("[data-key]")) {
        pressKey(e.target.dataset.key)
        return
    }

    if (e.target.matches("[data-enter]")) {
        submitGuess()
        return
    }

    if (e.target.matches("[data-delete]")) {
        deleteKey()
        return
    }
}

function handleKeyPress(e) {
    if (e.key === "Enter") {
        submitGuess()
        return
    }

    if (e.key === "Backspace" || e.key === "Delete") {
        deleteKey()
        return
    }

    if (e.key.match(/^[a-z]$/)) {
        pressKey(e.key)
        return
    }
}

function pressKey(key, ignoreLength = false) {
    const activeTiles = getActiveTiles()
    if (activeTiles.length >= WORD_LENGTH && !ignoreLength) return
    const nextTile = guessGrid.querySelector(":not([data-letter])")
    nextTile.dataset.letter = key.toLowerCase()
    nextTile.textContent = key
    nextTile.dataset.state = "active"

    selectNextTile()
}

function deleteKey() {
    const activeTiles = getActiveTiles()
    const lastTile = activeTiles[activeTiles.length - 1]
    if (lastTile == null) return
    lastTile.textContent = ""
    delete lastTile.dataset.state
    delete lastTile.dataset.letter

    selectNextTile()
}

function loadGuess(guess) {
    console.log("Loading guess: " + guess)

    for (let i = 0; i < guess.length; i++) {
        pressKey(guess.charAt(i), true)
    }

    stopInteraction()
    const activeTiles = [...getActiveTiles()]
    activeTiles.forEach((...params) => flipTile(...params, guess, false))
}

function submitGuess() {
    const activeTiles = [...getActiveTiles()]
    if (activeTiles.length != WORD_LENGTH) {
        showAlert("Not enough letters")
        shakeTiles(activeTiles)
        return
    }

    const guess = activeTiles.reduce((word, tile) => {
        return word + tile.dataset.letter
    }, "")

    // Could alternatively sort to only allow the use of irish words to guess the irish wordle, and english words to guess the english wordle
    const targetWordsDictionary = targetWords.map(entry => entry.Word.toLowerCase()) 
    const validWord = englishDictionary.includes(guess) || irishDictionary.includes(guess) || targetWordsDictionary.includes(guess)

    if (!validWord) {
        showAlert("Not in word list")
        shakeTiles(activeTiles)
        return
    }

    gameState.attempts += 1
    storeData()

    stopInteraction()
    activeTiles.forEach((...params) => flipTile(...params, guess, true))
}

function flipTile(tile, index, array, guess, writeData) {
    const letter = tile.dataset.letter
    const key = keyboard.querySelector(`[data-key="${letter}"i]`)

    let state = ""
    if (targetWord[index] === letter) {
        state = "correct"
    } else if (targetWord.includes(letter)) {
        state = "wrong-location"
    } else {
        state = "wrong"
    }

    if (writeData) {
        gameState.letters.push({ letter: letter, state: state })
        storeData()
    }

    setTimeout(() => {
        tile.classList.add("flip")
    }, index % 5 * FLIP_ANIMATION_DURATION / (writeData ? 2 : 4))

    tile.addEventListener("transitionend", () => {

        tile.classList.remove("flip")

        tile.dataset.state = state
        key.classList.add(state)

        if (index === array.length - 1) {
            tile.addEventListener("transitionend", () => {
                startInteraction()
                checkWinLose(guess, array)
            }, {once: true})
        }
    }, {once: true})
}

function getActiveTiles() {
    return guessGrid.querySelectorAll('[data-state="active"]')
}

function showAlert(message, duration = 1000) {
    if (duration === null) {
        clearAlerts()
    }

    const alert = document.createElement("div")
    alert.textContent = message
    alert.classList.add("alert")
    alertContainer.prepend(alert)
    if (duration == null) return

    setTimeout(() => {
        alert.classList.add("hide")
        alert.addEventListener("transitionend", () => {
            alert.remove()
        })
    }, duration)
}

function clearAlerts() {
    const alerts = document.querySelectorAll('.alert')

    alerts.forEach((alert) => {
        alert.remove()
    })
}

function showShareAlert(message, duration = 1000) {
    clearAlerts()

    const alert = document.createElement("div")
    alert.textContent = message
    alert.classList.add("alert")

    statsAlertContainer.append(alert)

    setTimeout(() => {
        alert.classList.add("hide")
        alert.addEventListener("transitionend", () => {
            alert.remove()
        })
    }, duration)
}

function showBadge(tag) {
    languageBadge.replaceChildren()

    const badge = document.createElement("img")
    badge.src = tag === "As gaeilge inniu" ? "irish-badge.svg" : "english-badge.svg"
    badge.classList.add("badge")

    languageBadge.appendChild(badge)
}

function setReplayButton(isSet) {
    const replayDiv = document.querySelector('[data-replay-button]')

    // This is only hiding the language badge because it shares a location
    // Remove the language badge lines if there is a new non conflicting location
    if (isSet) {
        languageBadge.classList.add("hide")

        // reveal and shake the replay button
        replayDiv.classList.remove("hide")
        replayDiv.classList.add("shake")
        replayDiv.addEventListener("animationend", () => {
            replayDiv.classList.remove("shake")
        }, { once: true })
    } else {
        replayDiv.classList.add("hide")
        languageBadge.classList.remove("hide")
    }
}

function shakeTiles(tiles) {
    tiles.forEach(tile => {
        tile.classList.add("shake")
        tile.addEventListener("animationend", () => {
            tile.classList.remove("shake")
        }, {once: true})
    });
}

function checkWinLose(guess, tiles) {
    if (guess === targetWord) {
        showAlert("You Win", 5000)
        danceTiles(tiles)
        stopInteraction()
        gameState.progress = "won"
        storeData()

        // Remove this if replay is not desired
        setReplayButton(true)

        if (gameState.completed === false) {
            completeFirstPuzzleOfTheDay()
        }
        return
    }

    const remainingTiles = guessGrid.querySelectorAll(":not([data-letter])")
    if (remainingTiles.length === 0) {
        showAlert(targetWord.toUpperCase(), null)
        stopInteraction();
        gameState.progress = "lost"
        storeData()

        // Remove this if replay is not desired
        setReplayButton(true)

        if (gameState.completed === false) {
            completeFirstPuzzleOfTheDay()
        }
    }
}

function completeFirstPuzzleOfTheDay() {
    gameState.completed = true
    storeData()

    const gameStateEvent = new CustomEvent("onFirstCompletion", { detail: gameState })
    document.dispatchEvent(gameStateEvent)
}

function danceTiles(tiles) {
    tiles.forEach((tile, index) => {
        setTimeout(() => {
            tile.classList.add("dance")
            tile.addEventListener("animationend", () => {
                tile.classList.remove("dance")
            }, { once: true })
        }, (index * DANCE_ANIMATION_DURATION) / 5)
    });
}

function showLast() {
    showPage(lastPage)
}

function showPage(pageId) {
    const oldPage = document.querySelector('.page.active')

    const pages = document.querySelectorAll('.page')
    pages.forEach(page => {
        page.classList.remove('active')
    })
    stopInteraction()

    document.getElementById(pageId).classList.add('active')
    if (pageId === "game" ) {
        if (gameState.progress === "in-progress") startInteraction()

        if (!stateWasLoaded) {
            loadGameStateOntoBoard()
        }

        if (gameState.progress === "lost") {
            showAlert(targetWord.toUpperCase(), null)
        }
    } 
    else if (pageId === "stats") {
        populateStatistics()
        populateDistribution()
    } else if (pageId === "welcome-back") {
        generateWelcomeMessage()
    }
    
    if (oldPage != null) lastPage = oldPage.id
}

function loadGameStateOntoBoard() {
    stateWasLoaded = true

    let guess = ""

    gameState.letters.forEach((tile, index) => {
        guess += gameState.letters[index].letter

        if ((index + 1) % 5 === 0) {
            loadGuess(guess)
            guess = ""
        }
    })
}

function generateWelcomeMessage() {
    const welcomeMessage = document.querySelector("[data-return-message]")
    const welcomeDate = document.querySelector("[data-return-date]")
    const welcomeNumber = document.querySelector("[data-return-number]")

    if (gameState.progress === "in-progress") {
        welcomeMessage.textContent = "You've made " + gameState.attempts + " of 6 guesses. Keep going!"
    } else {
        welcomeMessage.textContent = "Tomorrow's a new day, with a new puzzle. See you then."
    }

    const today = new Date();
    const yyyy = today.getFullYear();
    let mm = today.getMonth();
    let dd = today.getDate();

    let months = [
        "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
    ]

    if (dd < 10) dd = '0' + dd;

    const formattedToday = months[mm] + " " + dd + ", " + yyyy
    welcomeDate.textContent = formattedToday

    welcomeNumber.textContent = "No. " + targetWordNumber
}

function populateStatistics() {
    const statistics = document.querySelectorAll('.statistic')

    statistics.forEach((stat, index) => {
        const data = stat.querySelector('.statistic-data')
        const label = stat.querySelector('.statistic-label')

        data.textContent = index
        label.textContent = "Dummy statistic label"
    })
}

function populateDistribution() {
    const statBars = document.querySelectorAll('.stat-bar')

    statBars.forEach((bar, index) => {
        bar.textContent = index

        bar.style.width = 1 + ((index / 5) * 16) + "em"

        if (index === 5) bar.classList.add('last')
        else bar.classList.remove('last')
    })
}

function pressShare() {
    let alertMessage = "Coppied to clipboard"
    let gameStateForShare = null

    const localStateJSON = localStorage.getItem("gameState")
    let localGameState = null
    if (localStateJSON != null) {
        localGameState = JSON.parse(localStateJSON)

        // Only use the local game state if it is for todays puzzle
        if (localGameState.puzzle === targetWordNumber) {
            gameStateForShare = localGameState
            if (wasReset) alertMessage = "First completion coppied to clipboard"
        } else {
            gameStateForShare = gameState
        }
    } else {
        gameStateForShare = gameState
    }

    if (gameStateForShare.progress === "in-progress") {
        showShareAlert("Complete the puzzle to share")
        return
    } 

    let textToCopy = "Focail " + targetWordNumber + " " + gameStateForShare.attempts + "/6\n\n"

    gameStateForShare.letters.forEach((tile, index) => {
        switch (tile.state) {
            case "wrong":
                textToCopy += "⬛"
                break;
            case "wrong-location":
                textToCopy += "🟨"
                break;
            case "correct":
                textToCopy += "🟩"
                break;
        }

        let letterNumber = index + 1
        if (letterNumber % 5 === 0 && letterNumber != gameStateForShare.letters.length) textToCopy += "\n"
    })

    navigator.clipboard.writeText(textToCopy)

    showShareAlert(alertMessage)
}

function storeData() {
    // Only store data on the first playthrough
    if (gameState.completed === true) return

    localStorage.setItem("gameState", JSON.stringify(gameState))

    // Also can store a version of the current state to an account of somekind
    // This could then be recalled and used as a priority of localStorage
}
