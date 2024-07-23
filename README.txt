Summary:
    This is a file that compiles a handful of notes to make testing the implementation easier, and provides some questions, answers, and needs that will help us wrap things up.

Notes on Implementation:
    The targetWord is selected based on how many days have passed since the 'offsetFromDate'. This is currently set to January 1st, 2024, so the target word number should reflect the number of the day we are at within the year.
    If you need to update the target words list, this is read from the "Focail_Dictionary.csv" file, but requires the same format, and spellings of the headings provided.
    If you need to update the dictionaries for english and irish words, there are a few notes on the format of the .csv Focail_Answers
        Currently the .csv is expected to just be a list of words, with the file names "Dictionary_English.csv" and "Dictionary_Irish.csv"
        There are no headings at the top, so the first item in the list is the first word in the array.
        The irish words can include fada or not, it works just the same with either
    After the first completion of the day, the 'onFirstCompletion' event is fired with the gameState of the completed puzzle. The event.details will represent the gameState object with the following format:
        gameState.puzzle (puzzle number as int)
        gameState.letters (array of objects with letters[i].letter and letters[i].state where letter is a string with a single letter, and state is a string of either 'wrong', 'wrong-location', or 'correct')
        gameState.attempts (number of attempts as int)
        gameState.progress (string of either 'in-progress', 'won', or 'lost')3
        gameState.completed (boolean, this will always be true at the time of completion)
    There is also an event that is called when the stats page is loaded. 
        This event can be used to call both the "populateStatistics()" and "populateDistribution()" functions
        The "populateStatistics()" function takes an array of numbers with length of 5, each representing the data for the statistics in order
        The "populateDistribution()" function takes an array of ints with length of 6, for each of the bars in the distribution where the index is the number of guesses for a win (index 0 = 1 guess, index 5 = 6 guesses)
    Examples for both events are shown at the top of the script.js on lines 47 and 63

Testing:
    There is a temporary way to test Irish words.
        To do this just open the game screen, and hold the Space Bar for 3 seconds.
        This will reset the game and switch to the first irish word in the dictionary.
        This will not store data, and the game will count as a replay.
        This is temporary, and can be removed by removing the event listeners for the space bar.
    The current stats menu has hardcoded stats.
        These dummy stats come from the Examples for the populateStatistics() and populateDistribution() functions starting on line 63

Questions:
    Ive implemented the replay button, and it currently appears after completing the current puzzle.
        Pressing it allows the user to play the current puzzle again, but without saving.
        It is currently replacing the language badge, is there another place you would like this? Possibly on the stats screen?
        If if you do not want the replay button, it is easy to remove, so let me know.
