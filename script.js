// Script adjustments
const ALLOW_MOBILE_SHARE = true; //This detects mobile devices, and uses the navigator.share() function to open the browsers built in share functionality. However, this relies on detecting mobile devices, which can be tricky. If the device is not mobile it will use the clipboard.  If this is set to false, it will always use the clipboard.
const DATE_OF_FIRST_PUZZLE = new Date(2024, 6, 25) // Make sure this is a thursday so that irish words align on wednesdays (This is based on the current order within the 'Focail_Answers.csv')

// To remedy any file location issues in the future, ensure that these constants point to the file locations used to fetch the dictionaries
const ENGLISH_DICTIONARY = 'Dictionary_English.csv'
const IRISH_DICTIONARY = 'Dictionary_Irish.csv'
const ANSWERS_DICTIONARY = 'Focail_Answers.csv'

// This is selected based on the number of days since the date of the first puzzle.
let targetWord

let englishDictionary
let irishDictionary

let tagetEntry = {}
let targetWords
let targetWordNumber

let gameState = {
    puzzle: targetWordNumber,
    letters: [],
    attempts: 0,
    progress: "in-progress",
    completed: false,
    hasOpenedPuzzle: false
}
let cumulativeData = {
    games: [],
    distribution: [
        0, 0, 0, 0, 0, 0
    ]
}

// game: { number, turns, isWin, isEnglish}

let currentGuesses = []

let stateWasLoaded = false
let wasReset = false
let hasOpennedGame = false
let pageTimeout

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
// gameState.hasOpenedPuzzle (boolean, used to track if the player has oppened the puzzle for the first time)

document.addEventListener('onFirstCompletion', e => {
    e.stopPropagation();

    const customGameState = e.detail

    let game = {
        number: customGameState.puzzle,
        turns: customGameState.attempts,
        isWin: customGameState.progress === "won",
        isEnglish: targetEntry.status.toLowerCase() === "in english today"
    }

    if (!cumulativeData.games.some(existingGame => existingGame.number === game.number)) {
        cumulativeData.games.push(game);
    } else {
        console.log("Entry for puzzle: " + game.number + " already present.")
    }

    let distribution = [
        0, 0, 0, 0, 0, 0
    ]

    for (let i = 0; i < cumulativeData.games.length; i++) {
        const game = cumulativeData.games[i]

        if (game.turns > distribution.length || game.turns <= 0 || !game.isWin) continue
        distribution[game.turns - 1]++
    }

    cumulativeData.distribution = distribution

    storeCumulativeData()
})

// Another custom event "onStatsUpdate" is called after the stats screen is updated.
const statsUpdateEvent = new Event("onStatsUpdate")

document.addEventListener('onStatsUpdate', e => {
    e.stopPropagation();

    console.log("Stats update")

    const dummyStatistics = [
        { number: 207, turns: 6, isWin: false, isEnglish: false },
        { number: 13, turns: 4, isWin: true, isEnglish: true },
        { number: 14, turns: 6, isWin: true, isEnglish: false },
        { number: 15, turns: 6, isWin: false, isEnglish: true },
        { number: 20, turns: 3, isWin: false, isEnglish: true },
        { number: 21, turns: 4, isWin: true, isEnglish: false }
    ]

    const dummyDist = [
        0, 0, 1, 2, 0, 0
    ]

    const statistics = getCumulativeStatistics()
    //const statistics = getCumulativeStatistics(dummyStatistics, dummyDist)

    populateStatistics(statistics)
    populateDistribution(cumulativeData.distribution)
    //populateDistribution(dummyDist)
})

// Another custom event "onStatsUpdate" is called after the stats screen is updated.
const gameStartEvent = new Event("onGameStart")

window.dataLayer = window.dataLayer || [];

function pushEventToDataLayer(event) {
    const eventName = event.type
    const eventDetails = event.detail

    window.dataLayer.push({
        'event': eventName,
        ...eventDetails
    })

    console.log(window.dataLayer)
}

async function fetchCSV() {
    try {
        const responseCSV1 = await fetch(ANSWERS_DICTIONARY);
        const csvText1 = await responseCSV1.text();
        targetWords = parseAnswerCSV(csvText1);

        // Parse csv for english dictionary
        const responseCSV2 = await fetch(ENGLISH_DICTIONARY);
        const csvText2 = await responseCSV2.text();
        englishDictionary = parseDictionaryCSV(csvText2);

        // Add in english words from the target words dictionary too
        const targetWordsEnglish = targetWords.filter(entry => entry.status.toLowerCase() === "in english today").map(entry => entry.word)
        englishDictionary.push(...targetWordsEnglish)

        const responseCSV3 = await fetch(IRISH_DICTIONARY);
        const csvText3 = await responseCSV3.text();
        irishDictionary = parseDictionaryCSV(csvText3);

        const msOffset = Date.now() - DATE_OF_FIRST_PUZZLE
        const dayOffset = msOffset / 1000 / 60 / 60 / 24
        const targetIndex = Math.floor(dayOffset + 0) % targetWords.length

        targetEntry = targetWords[targetIndex];
        //targetEntry = targetWords[16]

        targetWordNumber = targetEntry.number
        targetWord = targetEntry.word.toLowerCase()

        showBadge(targetEntry.status)
        fetchGameState()
        fetchCumulativeData()
    } catch (error) {
        console.error('Error reading JSON file:', error);
    }
}

function parseAnswerCSV(csv) {
    const lines = csv.split('\n');
    const headers = lines[0].split(',');

    const result = lines.slice(1).map(line => {
        const values = line.split(',');
        const obj = {};
        headers.forEach((header, index) => {
            obj[header.trim().toLowerCase()] = values[index].trim();
        });
        return obj;
    });

    return result;
}

function parseDictionaryCSV(csv) {
    const lines = csv.trim().split('\n')
    const result = lines.map(line => line.trim())

    return result
}

function matchIndexRegardlessOfFada(word, wordList) {
    const normalizedWord = convertFadaToEnglish(word);

    for (let i = 0; i < wordList.length; i++) {
        const normalizedListWord = convertFadaToEnglish(wordList[i]);
        if (normalizedListWord.toLowerCase() === normalizedWord.toLowerCase()) {
            return i
        }
    }

    return null
}

function convertFadaToEnglish(inputString) {
    let result = ''
    for (let char of inputString) {
        result += convertFada(char, false)
    }
    return result
}

function convertFada(char, toIrish = true) {
    const fadaMapToEnglish = {
        'á': 'a', 'é': 'e', 'í': 'i', 'ó': 'o', 'ú': 'u', 'Á': 'A', 'É': 'E', 'Í': 'I', 'Ó': 'O', 'Ú': 'U'
    }

    const fadaMapToIrish = {
        'a': 'á', 'e': 'é', 'i': 'í', 'o': 'ó', 'u': 'ú', 'A': 'Á', 'E': 'É', 'I': 'Í', 'O': 'Ó', 'U': 'Ú'
    }

    if (toIrish) {
        return fadaMapToIrish[char] || char
    } else {
        return fadaMapToEnglish[char] || char
    }
}

function hasFada(inputString) {
    const fadaRegex = /[áéíóúÁÉÍÓÚ]/

    return fadaRegex.test(inputString)
}

function fetchGameState() {
    const localStateJSON = localStorage.getItem("gameState")
    let localGameState = null
    if (localStateJSON != null) {
        localGameState = JSON.parse(localStateJSON)

        if (localGameState.puzzle === targetWordNumber) {
            gameState = localGameState
        } else {
            console.log("Game state was reset since puzzle does not match")
            resetGameState()
        }
    } else {
        console.log("Game state was reset since localStorage did not contain 'gameState'")
        resetGameState()
    }

    if (gameState.hasOpenedPuzzle === true) {
        showPage("welcome")
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
        completed: false,
        hasOpenedPuzzle: false
    }

    storeGameStateData()
}

function fetchCumulativeData() {
    const localStoreJSON = localStorage.getItem("cumulativeData")
    if (localStoreJSON != null) {
        cumulativeData = JSON.parse(localStoreJSON)
    } else {
        console.log("Cumulative Data was reset")
        resetCumulativeData()
    }
}

function resetCumulativeData() {
    cumulativeData = {
        games: [],
        distribution: [
            0, 0, 0, 0, 0, 0
        ]
    }

    storeCumulativeData()
}

function getCumulativeStatistics(games = null, distribution = null) {
    if (games === null) {
        games = cumulativeData.games
    }

    if (distribution === null) {
        distribution = cumulativeData.distribution
    }

    const wins = games.filter(game => game.isWin).length

    const totalGames = games.length
    const winPercent = wins / totalGames

    let currentWinStreak = 0
    let longestWinStreak = 0
    let lastGameNumber = null

    for (let i = 0; i < games.length; i++) {
        let game = games[i]

        if (game.isWin && (lastGameNumber === null || game.number === lastGameNumber + 1)) {
            currentWinStreak++

        } else {
            currentWinStreak = (game.isWin) ? 1 : 0
        }

        if (currentWinStreak > longestWinStreak) {
            longestWinStreak = currentWinStreak
        }

        lastGameNumber = game.number
    }

    let totalTurns = 0
    let totalGamesInDist = 0

    for (let i = 0; i < distribution.length; i++) {
        totalTurns += (distribution[i] * (i + 1))
        totalGamesInDist += distribution[i]
    }

    const averageTurns = (totalGamesInDist === 0) ? 0 : totalTurns / totalGamesInDist

    return [
        totalGames,
        (totalGames > 0) ? winPercent : 0,
        currentWinStreak,
        longestWinStreak,
        (totalGames > 0) ? averageTurns : 0
    ]
}


function playAgain() {
    wasReset = true
    setReplayButton(false)
    clearAlerts()

    currentGuesses = []

    const tiles = document.querySelectorAll('.tile')

    tiles.forEach(tile => {
        if (!tile.classList.contains("dummy")) {
            const letter = convertFada(tile.textContent.trim(), false)
            const key = keyboard.querySelector(`[data-key="${letter}"i]`)
            if (key != null) {
                key.classList.remove("wrong")
                key.classList.remove("wrong-location")
                key.classList.remove("correct")
            }

            tile.textContent = ""
            delete tile.dataset.state
            delete tile.dataset.letter
        }
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
    } else if (e.key.match(/^[A-Z]$/)) {
        pressKey(e.key.toLowerCase())
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
    //console.log("Loading guess: " + guess)

    for (let i = 0; i < guess.length; i++) {
        pressKey(guess.charAt(i), true)
    }

    currentGuesses.push(guess)

    stopInteraction()
    const activeTiles = [...getActiveTiles()].slice(-5)
    activeTiles.forEach((...params) => flipTile(...params, guess, false))
}

function submitGuess() {
    const activeTiles = [...getActiveTiles()]
    if (activeTiles.length != WORD_LENGTH) {
        showAlert("Not enough letters")
        shakeTiles(activeTiles)
        return
    }

    let guess = activeTiles.reduce((word, tile) => {
        return word + tile.dataset.letter;
    }, "")

    let validWord = false

    // Check the word based on the target word (irish, english)
    if (targetEntry.status.toLowerCase() === "as gaeilge inniu") {
        // Target word is irish
        const matchIndex = matchIndexRegardlessOfFada(guess, irishDictionary)
        if (matchIndex === null) {
            validWord = irishDictionary.includes(guess)
        } else {
            validWord = true
            guess = irishDictionary[matchIndex]
            console.log("Converted guess to: " + guess)
        }
    } else {
        // Target word is english
        validWord = englishDictionary.includes(guess)
    }

    if (!validWord) {
        showAlert("Not in word list")
        shakeTiles(activeTiles)
        return
    }

    currentGuesses.push(guess)

    gameState.attempts += 1
    storeGameStateData()

    stopInteraction()
    activeTiles.forEach((...params) => flipTile(...params, guess, true))
}

function flipTile(tile, index, array, guess, writeData) {
    const englishLetter = convertFada(tile.dataset.letter, false)
    const key = keyboard.querySelector(`[data-key="${englishLetter}"i]`)

    const trueLetter = guess[index]

    let correctLetters = []
    let lettersInTargetWord = 0

    for (let i = 0; i < targetWord.length; i++) {
        const targetLetter = targetWord[i]

        if (targetLetter === trueLetter) {
            if (targetLetter === guess[i]) {
                lettersInTargetWord++
                correctLetters.push(i)
            } else {
                lettersInTargetWord++
            }
        }
    }

    let guessDuplicates = []

    for (let i = 0; i < guess.length; i++){
        const current = guess[i]

        if (current === trueLetter) {
            guessDuplicates.push(i)
        }
    }

    //console.log(trueLetter + "'s in word: " + lettersInTargetWord + " with " + correctLetters.length + " correct.")
    //console.log(guessDuplicates)

    let state = ""
    if (targetWord[index] === trueLetter) {
        state = "correct"
    } else if (targetWord.includes(trueLetter)) {
        let allowedDuplicates = lettersInTargetWord
        let isWrong = true

        // First pass is used to check for corrects
        for (let i = 0; i < guessDuplicates.length; i++) {
            let duplicate = guessDuplicates[i]

            if (allowedDuplicates === 0) continue
            if (trueLetter === targetWord[duplicate]) {
                allowedDuplicates--
            }
        }

        // Second Pass is used to check for wrong-locations
        for (let i = 0; i < guessDuplicates.length; i++){
            let duplicate = guessDuplicates[i]

            if (correctLetters.includes(duplicate)) continue
            if (allowedDuplicates === 0) continue

            allowedDuplicates--

            if (duplicate === index) isWrong = false
        }

        if (isWrong) {
            state = "wrong"
        } else {
            state = "wrong-location"
        }
    } else {
        state = "wrong"
    }

    if (writeData) {
        gameState.letters.push({ letter: trueLetter, state: state })
        storeGameStateData()
    }

    setTimeout(() => {
        tile.classList.add("flip")
    }, index % 5 * FLIP_ANIMATION_DURATION / (writeData ? 2 : 4))

    tile.addEventListener("transitionend", () => {

        tile.classList.remove("flip")

        if (tile.textContent != trueLetter) {
            tile.textContent = trueLetter
        }
        
        tile.dataset.state = state
        
        if (key.classList.contains("correct")) {
            // Do nothing to the key state
        } else if (key.classList.contains("wrong-location")) {
            if (state === "correct") key.classList.add(state)
        } else if (key.classList.contains("wrong")) {
            if (state === "wrong-location" || state === "correct") key.classList.add(state)
        } else {
            key.classList.add(state)
        }

        if (index === array.length - 1) {
            tile.addEventListener("transitionend", () => {
                startInteraction()
                checkWinLose(guess, array, writeData)
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
    const isIrish = tag.toLowerCase() === "as gaeilge inniu"
    badge.src = isIrish ? "irish-badge.svg" : "english-badge.svg"
    badge.classList.add("badge")

    if (isIrish) {
        setKeyboardToIrish()
    } else {
        setKeyboardToEnglish()
    }

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

function checkWinLose(guess, tiles, hasTimeout) {
    const remainingTiles = guessGrid.querySelectorAll(":not([data-letter])")

    let progressString = ""
    const hasWon = guess === targetWord

    if (hasWon) {
        // Win
        showAlert("You Win", 5000)
        danceTiles(tiles)
        progressString = "won"
    } else if (remainingTiles.length === 0 && !currentGuesses.includes(targetWord)) {
        // Loss
        showAlert(targetWord.toUpperCase(), null)
        progressString = "lost"
    } else {
        // No win or loss
        return
    }

    stopInteraction();
    gameState.progress = progressString
    storeGameStateData()

    if (gameState.completed === false && wasReset === false) {
        completeFirstPuzzleOfTheDay()
    }

    if (hasTimeout) {
        pageTimeout = setTimeout(() => {
            showPage("stats")
        }, 1000 * (3))
    }
}

function completeFirstPuzzleOfTheDay() {
    gameState.completed = true
    localStorage.setItem("gameState", JSON.stringify(gameState))

    const gameStateEvent = new CustomEvent("onFirstCompletion", { detail: gameState })
    //parent.document.dispatchEvent(gameStateEvent)
    document.dispatchEvent(gameStateEvent)

    pushEventToDataLayer(gameStateEvent)
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
    console.log("Showing last: " + lastPage)
    showPage(lastPage)
}

function showPage(pageId, oldPage = null) {
    if (pageTimeout != null) clearTimeout(pageTimeout)
    
    if (pageId === "game" && gameState.hasOpenedPuzzle === false) {
        // Call game start event
        document.dispatchEvent(gameStartEvent)
        pushEventToDataLayer(gameStartEvent)

        gameState.hasOpenedPuzzle = true
        storeGameStateData()
    }

    if (oldPage === null) {
        const page = document.querySelector('.page.active')
        if (page != null) {
            oldPage = page.id
        } else {
            oldPage = "game"
        }
    }

    if (pageId != "welcome" && pageId != "game" && pageId != "info" && pageId != "stats") {
        console.log("Invalid page: " + pageId + ". Openning 'game' page.")
        pageId = "game"
    }

    const pages = document.querySelectorAll('.page')
    pages.forEach(page => {
        page.classList.remove('active')
    })
    stopInteraction()

    document.getElementById(pageId).classList.add('active')
    if (pageId === "game") {
        hasOpennedGame = true

        if (gameState.progress === "in-progress") startInteraction()

        if (!stateWasLoaded) {
            loadGameStateOntoBoard()
        }

        if (gameState.progress === "lost") {
            console.log("Lost in showpage")
            showAlert(targetWord.toUpperCase(), null)
        }
    } 
    else if (pageId === "stats") {
        //parent.document.dispatchEvent(statsUpdateEvent)
        document.dispatchEvent(statsUpdateEvent)
        pushEventToDataLayer(statsUpdateEvent)

    } else if (pageId === "welcome") {
        generateWelcomeMessage()
    } else if (pageId === "info") {
        updateInfoScreen()
    }
    
    if (oldPage != null) lastPage = oldPage
}

function updateInfoScreen() {
    const playButton = document.querySelector('.button.play')

    playButton.textContent = hasOpennedGame ? "Continue" : " Play"
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
    const welcomeHeader = document.querySelector("[data-return-header]")
    const welcomeMessage = document.querySelector("[data-return-message]")
    const welcomeButton = document.querySelector("[data-return-button]")
    const welcomeDate = document.querySelector("[data-return-date]")
    const welcomeNumber = document.querySelector("[data-return-number]")

    if (gameState.progress === "in-progress") {
        welcomeHeader.textContent = "Failte,"
        welcomeMessage.textContent = "You've made " + gameState.attempts + " of 6 guesses. Keep going!"
        welcomeButton.textContent = "Continue"
        welcomeButton.onclick = () => {
            showPage('game')
        }
    } else {
        welcomeHeader.textContent = "Well?"
        welcomeMessage.textContent = "Tomorrow brings another puzzle. See you then."
        welcomeButton.textContent = "See Stats"
        welcomeButton.onclick = () => {
            showPage('stats', 'game')
        }
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

function populateStatistics(statisticsData) {
    // This function is called when the statistics are loaded
    // This is the ideal location to try and retreive cumulative data and display it

    const statistics = document.querySelectorAll('.statistic')

    const statisticsLabels = [
        "Played",
        "Win %",
        "Current Win Streak",
        "Longest Win Streak",
        "Average Turns"
    ]

    statistics.forEach((stat, index) => {
        const data = stat.querySelector('.statistic-data')
        const label = stat.querySelector('.statistic-label')

        let entry = statisticsData[index]
        if (index === 1) {
            entry *= 100
            entry = entry.toFixed(0)
        }
        if (index === 4) entry = entry.toFixed(2)

        if (entry != null) {
            data.textContent = entry
            label.textContent = statisticsLabels[index]
        } else {
            data.textContent = ""
            label.textContent = ""
        }
    })
}

function populateDistribution(arr) {
    const statBars = document.querySelectorAll('.stat-bar')
    const largest = Math.max(...arr)

    statBars.forEach((bar, index) => {
        const number = arr[index]

        bar.textContent = number

        bar.style.width = ((number === 0) ? 1 : 1 + ((number / largest) * 16)) + "em"

        if (number === largest && number != 0) bar.classList.add('last')
        else bar.classList.remove('last')
    })
}

function pressShare() {
    let alertMessage = "Link Copied! Share with Your Friends!"
    let gameStateForShare = null

    const localStateJSON = localStorage.getItem("gameState")
    let localGameState = null
    if (localStateJSON != null) {
        localGameState = JSON.parse(localStateJSON)

        // Only use the local game state if it is for todays puzzle
        if (localGameState.puzzle === targetWordNumber) {
            gameStateForShare = localGameState
            if (wasReset) alertMessage = "Link Copied! Share with Your Friends!"
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

    let textToCopy ="Try Focail! " + targetWordNumber + " " + gameStateForShare.attempts + "/6\n\n"

    gameStateForShare.letters.forEach((tile, index) => {
        switch (tile.state) {
            case "wrong":
                textToCopy += "⬛"
                break;
            case "wrong-location":
                textToCopy += "🟧"
                break;
            case "correct":
                textToCopy += "🟩"
                break;
        }

        let letterNumber = index + 1
        if (letterNumber % 5 === 0 && letterNumber != gameStateForShare.letters.length) textToCopy += "\n"
    })

    if (navigator.share && detectTouchscreen() && ALLOW_MOBILE_SHARE) {
        navigator.share({
            text: textToCopy
        })
    } else {
        navigator.clipboard.writeText(textToCopy)
        showShareAlert(alertMessage)
    }
}

function detectTouchscreen() {
    var result = false
    if (window.PointerEvent && ('maxTouchPoints' in navigator)) {
        if (navigator.maxTouchPoints > 0) {
            result = true
        }
    } else {
        if (window.matchMedia && window.matchMedia("(any-pointer:coarse)").matches) {
            result = true
        } else if (window.TouchEvent || ('ontouchstart' in window)) {
            result = true
        }
    }
    return result
}

function setKeyboardToIrish() {
    const keys = []

    keys.push(keyboard.querySelector(`[data-key="J"]`))
    keys.push(keyboard.querySelector(`[data-key="K"]`))
    keys.push(keyboard.querySelector(`[data-key="Q"]`))
    keys.push(keyboard.querySelector(`[data-key="V"]`))
    keys.push(keyboard.querySelector(`[data-key="W"]`))
    keys.push(keyboard.querySelector(`[data-key="X"]`))
    keys.push(keyboard.querySelector(`[data-key="Y"]`))
    keys.push(keyboard.querySelector(`[data-key="Z"]`))

    keys.forEach(key => {
        key.classList.add("disable");
    });
}

function setKeyboardToEnglish() {
    const keys = document.querySelectorAll('.key.disable');

    keys.forEach(key => {
        key.classList.remove("disable")
    })
}

function storeGameStateData() {
    // Only store data on the first playthrough
    if (gameState.completed === true) return

    localStorage.setItem("gameState", JSON.stringify(gameState))
}

function storeCumulativeData() {
    localStorage.setItem("cumulativeData", JSON.stringify(cumulativeData))
}
