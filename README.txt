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
        This event can be used to call both the "updateStatistics()" and "updateDistribution()" functions
        The "updateStatistics()" function takes an array of numbers with length of 5, each representing the data for the statistics in order
        The "updateDistribution()" function takes an array of ints with length of 6, for each of the bars in the distribution where the index is the number of guesses for a win (index 0 = 1 guess, index 5 = 6 guesses)
    Examples for both events are shown at the top of the script.js on lines 46 and 62

Questions:
    You mentioned an X at the top to close the info page. 
        I have currently replace the text on the "Play" button, to instead say "Continue" when the user revisits the page. 
        This is temporary, but where would you like the X at the top of the info page, since there is a header that matches the style of the game. 
        I could remove the header, and instead use the verical logo (similar to the stats page), and show the X or the "Play" button, based on if the player has revisited the info screen.
        So this means that on first openeing the puzzle for the day, the "Play" button will be at the bottom of the info screen, but after going from the game to the info screen, there would instead be the 'X' at the top.
        Let me know the specifics of the design here.
    You mentioned that it would require data from all users to provide the 'Average turns" statistic.
        In order to simplify this, I would recomend only tracking the players average turns, and not comparing it to the global average turns for all players.
        This will simplify the data being sent to the "populateStatistics()" function, and prevent the need to gather player data accross all players
    You mentioned needing to call events in the parent, since this html doc will be nested within an iframe on the main site.
        Currently both of the events (onStatsUpdate and onFirstCompletion) are dispatched both on the current document, and the parent document
        This can be seen on lines 572 and 617 of the current script.js
        Let me know if this is what you needed
    I wasnt sure if you literally meant "black" for the keys that dont appear in the Irish language (J, K, Q, V, W, X, Y, Z) when an Irish puzzl is present, but they are disabled using a light color to show that they are inactive
        Let me know if you would rather have a black color for these disabled keys
