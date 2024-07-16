Summary:
    This is a file that compiles a handful of notes to make testing the implementation easier, and provides some questions, answers, and needs that will help us wrap things up.

Notes on Implementation:
    The targetWord is selected based on how many days have passed since the 'offsetFromDate'. This is currently set to January 1st, 2024, so the target word number should reflect the number of the day we are at within the year.
    If you need to update the target words list, this is read from the "Focail_Dictionary.csv" file, but requires the same format, and spellings of the headings provided.
    After the first completion of the day, the 'onFirstCompletion' event is fired with the gameState of the completed puzzle. The event.details will represent the gameState object with the following format:
        gameState.puzzle (puzzle number as int)
        gameState.letters (array of objects with letters[i].letter and letters[i].state where letter is a string with a single letter, and state is a string of either 'wrong', 'wrong-location', or 'correct')
        gameState.attempts (number of attempts as int)
        gameState.progress (string of either 'in-progress', 'won', or 'lost')
        gameState.completed (boolean, this will always be true at the time of completion)

Needs:
    We need dictionaries that include all valid irish, and english words (this can be provided an any format you would like, we will update the parsing accordingly)
    
Answers:
    How does code get which number to fetch from dictionary. I can see it loaded 403 today - is there any logic behind that we should be aware of?
        The previous implement was not correct, but now the date is selected based on the days since 'offsetFromDate' starting with targetWord number 1
    Is it possible to not expose the full dictionary csv and only words used today in source? All the words along with one that will be used tomorrow is visible - Probably not an issue as someone needs to be technical to check this.
        If this is referring to access within the webpage, I wasn't able to find access to the .csv file. If you could let me know where specifically you found access to it, then I can look into hiding it.
    Sometimes you can give your phone to a friend to try - if progressed is sync - do we need some button like "Start Again" to replay game?"
        I have implemented a 'Replay' button, that allows the user to reset the puzzle and play it again, without storing any of the data from it.
        The button only shows up when the current game is completed.
        The location of the share button is temporary, but it currently replaces the english/irish badge at the top of the screen, And is hidden when pressed, showing the badge again. (This can easly be moved/removed, so let us know if you want to keep it, or move it someplace else)
        The share button will still use their first attempt's data, and subsiquent refreshes of the page will reopen to the welcome screen, with their first attempt on the game board.
    Are the dictionaries supplied okay? 
        The format of the current dictionary is okay, but this only contains words that will be used as target words for the puzzle.  
        In order to check to see if any given word submited is valid, we need dictionaries of all valid english/irish words.  
        These can be in a simple listed json format, or even combined in .csv. 
        These valid word dictionaries should also include words used within the target words dictionary.
    Are you going to track the game state for users, to prevent reloading to get more guesses? Yes please, can you arrange this?
        Currently the game state can be loaded using the localStorage on the browser.  
        This means that if a player reloads, the localStorage data for their game is loaded, and they continue from there.  
        This should also be sent and stored on your user accounts somewhere, so that the data can be linked across devices.
    When the user revisits the page after failing or completing a puzzle, are they allowed back onto the game screen, and if so do we need to sync the state with their last attempt? Yes they are. Can you mirror the NYT approach here. A message appears and says 'Failte, you've made x of 6 guesses! Keep going'
        Now game state is stored, and reloaded when a player revisits the game.  
        They are given a welcome screen with a summary of the puzzle when they last left off.
     Can you advise what should happen here so that the stats page updates for each device?
        In order to have the game state sync across multiple devices, you will need somewhere internally to store gameData tied to an account.
        In order to sync the cumulative data for the stats page, you will need some way to sort data from the user database and report a summary to our game. 
        This could be done on your end, I would just need to create a function for you to call when the stats page is oppened that accepts the proper format of data.
        Currently the 'populateStatistic' function is called when the stats page is oppened but it just populates dummy data into the page.
