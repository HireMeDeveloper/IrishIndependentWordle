Summary:
    This is a file that compiles a handful of notes to make testing the implementation easier.

Notes on Implementation:
    The targetWord is selected based on how many days have passed since the 'DATE_OF_FIRST_PUZZLE'. 
        This is currently set to July 25th, 2024, so the target word number should reflect the number of the day since then.
        If you need to align irish puzzles to a certain day, it is based on the order of the words in "Focail_Answers.csv'.
        Currently irish puzzles are set to appear only on wednesdays, but this is based on irish words apearing every 7 days in the 'Focail_Answers.csv', and the first puzzle appearing on a thursday.
    If you need to update the target words list, this is read from the "Focail_Dictionary.csv" file, but requires the same format, and spellings of the headings provided.
        Also note the order of the words, and how that might change the alignment of irish puzzles.
    If you need to update the dictionaries for english and irish words, there are a few notes on the format of the .csv Focail_Answers
        Currently the .csv is expected to just be a list of words, with the file names "Dictionary_English.csv" and "Dictionary_Irish.csv"
        There are no headings at the top, so the first item in the list is the first word in the array.
        The irish words can include fada or not, it works just the same with either
    After the first completion of the day, the 'onFirstCompletion' event is fired with the gameState of the completed puzzle. 
        This is currently only fired on this document, and not on the parent, as this was causing all the errors within your iframe.
        The event.details will represent the gameState object with the following format:
        gameState.puzzle (puzzle number as int)
        gameState.letters (array of objects with letters[i].letter and letters[i].state where letter is a string with a single letter, and state is a string of either 'wrong', 'wrong-location', or 'correct')
        gameState.attempts (number of attempts as int)
        gameState.progress (string of either 'in-progress', 'won', or 'lost')
        gameState.completed (boolean, this will always be true at the time of completion)
    There is also an event that is called when the stats page is loaded. 
        This event can be used to call both the "populateStatistics()" and "populateDistribution()" functions
        The "populateStatistics()" function takes an array of numbers with length of 5, each representing the data for the statistics in order
        The "populateDistribution()" function takes an array of ints with length of 6, for each of the bars in the distribution where the index is the number of guesses for a win (index 0 = 1 guess, index 5 = 6 guesses)
    Both of these events are currently used with event listeners on lines 61 and 98.
        These listeners are responsible for updating and populating stats with the cumulative local stats stored in localStorage for the player.

Testing:
    I have added a few variables at the top of script.js, that can quickly be adjusted.
        ALLOW_MOBILE_SHARE is a bool that controls if the share button will try to detect mobile browsers, and use the navigator.share() function.
            If this is false, or if a mobile browser is not detected, then the clipboard will be used instead.
            It is difficult to detect mobile browsers, as there are so many different mobile devices out there, but I have implemented the best mobile detection I could find using feature detection.
        DATE_OF_FIRST_PUZZLE is used the mark the date that the first puzzle in the 'Focail_Answers.csv' list will be active.
            This will also determine the alignment of irish puzzles, as they will appear in order starting from this date.
            Currently this is set to a thursday so that irish puzzles land on wednesdays.
