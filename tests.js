function runStatisticsTest(testID, games, expectedResultData) {
    let result = getCumulativeStatistics(games);

    let pass = true;

    result[1] = (result[1] * 100).toFixed(0)
    result[4] = result[4].toFixed(2)

    const messageSummary = " Result: " + result + " and Expected: " + expectedResultData;

    if (result[0] != expectedResultData[0]) {
        pass = false;
        console.warn(
            "Test: " + testID + " FAILED due to mismatched total. " + 
            "Expected: " + expectedResultData[0] + ", but got: " + result[0] + 
            messageSummary
        );
    }

    if (result[1] != expectedResultData[1]) {
        pass = false;
        console.warn(
            "Test: " + testID + " FAILED due to mismatched win percent. " +
            "Expected: " + expectedResultData[1] + ", but got: " + result[1] +
            messageSummary
        ); 
    }

    if (result[2] != expectedResultData[2]) {
        pass = false;
        console.warn(
            "Test: " + testID + " FAILED due to mismatched current streak. " +
            "Expected: " + expectedResultData[2] + ", but got: " + result[2] +
            messageSummary
        );
    }

    if (result[3] != expectedResultData[3]) {
        pass = false;
        console.warn(
            "Test: " + testID + " FAILED due to mismatched longest streak. " +
            "Expected: " + expectedResultData[3] + ", but got: " + result[3] +
            messageSummary
        );
    }

    if (result[4] != expectedResultData[4]) {
        pass = false;
        console.warn(
            "Test: " + testID + " FAILED due to mismatched average turns. " + 
            "Expected: " + expectedResultData[4] + ", but got: " + result[4] +
            messageSummary
        );
    }

    if (pass) {
        console.warn(
            "Test: " + testID + " PASSED. " +
            messageSummary
        )
    }
}

runStatisticsTest(
    "1",
    [
        { number: 207, turns: 6, isWin: false, isEnglish: false },
        { number: 13, turns: 4, isWin: true, isEnglish: true },
        { number: 14, turns: 6, isWin: true, isEnglish: false },
        { number: 15, turns: 6, isWin: false, isEnglish: true },
        { number: 20, turns: 3, isWin: false, isEnglish: true },
        { number: 21, turns: 4, isWin: true, isEnglish: false }
    ],
    [ 6, 50, 1, 2, 4.83 ]
)

runStatisticsTest(
    "2",
    [
        { number: 207, turns: 6, isWin: false, isEnglish: false },
        { number: 13, turns: 4, isWin: true, isEnglish: true },
        { number: 14, turns: 6, isWin: true, isEnglish: false },
        { number: 15, turns: 6, isWin: false, isEnglish: true },
        { number: 20, turns: 3, isWin: false, isEnglish: true },
        { number: 21, turns: 4, isWin: true, isEnglish: false },
        { number: 22, turns: 4, isWin: true, isEnglish: true },
        { number: 23, turns: 5, isWin: true, isEnglish: true },
        { number: 26, turns: 5, isWin: true, isEnglish: true },
        { number: 34, turns: 2, isWin: true, isEnglish: true },
        { number: 35, turns: 2, isWin: true, isEnglish: false }
    ],
    [11, 73, 2, 3, 4.27]
)

runStatisticsTest(
    "3",
    [
        { number: 1, turns: 5, isWin: true, isEnglish: true },
        { number: 2, turns: 6, isWin: true, isEnglish: false },
        { number: 3, turns: 3, isWin: false, isEnglish: true },
        { number: 4, turns: 4, isWin: true, isEnglish: true },
        { number: 5, turns: 6, isWin: false, isEnglish: false },
        { number: 6, turns: 3, isWin: true, isEnglish: true }
    ],
    [6, 67, 1, 2, 4.50]
);

runStatisticsTest(
    "4",
    [
        { number: 10, turns: 4, isWin: true, isEnglish: true },
        { number: 11, turns: 5, isWin: false, isEnglish: true },
        { number: 12, turns: 3, isWin: true, isEnglish: false },
        { number: 13, turns: 2, isWin: true, isEnglish: true },
        { number: 14, turns: 5, isWin: true, isEnglish: true },
        { number: 15, turns: 4, isWin: true, isEnglish: false },
        { number: 16, turns: 6, isWin: false, isEnglish: true }
    ],
    [7, 71, 0, 4, 4.14]
);

runStatisticsTest(
    "5",
    [
        { number: 101, turns: 4, isWin: true, isEnglish: true },
        { number: 102, turns: 5, isWin: true, isEnglish: false },
        { number: 103, turns: 6, isWin: true, isEnglish: true },
        { number: 104, turns: 3, isWin: false, isEnglish: false },
        { number: 105, turns: 6, isWin: true, isEnglish: true },
        { number: 106, turns: 4, isWin: true, isEnglish: true },
        { number: 107, turns: 2, isWin: true, isEnglish: false }
    ],
    [7, 86, 3, 3, 4.29]
);

runStatisticsTest(
    "6",
    [
        { number: 21, turns: 6, isWin: false, isEnglish: true },
        { number: 22, turns: 2, isWin: true, isEnglish: false },
        { number: 23, turns: 3, isWin: true, isEnglish: true },
        { number: 24, turns: 4, isWin: true, isEnglish: true },
        { number: 25, turns: 6, isWin: true, isEnglish: false },
        { number: 26, turns: 5, isWin: false, isEnglish: true },
        { number: 27, turns: 2, isWin: true, isEnglish: true },
        { number: 28, turns: 6, isWin: false, isEnglish: true }
    ],
    [8, 63, 0, 4, 4.25]
);

runStatisticsTest(
    "7",
    [
        { number: 50, turns: 5, isWin: true, isEnglish: false },
        { number: 51, turns: 6, isWin: true, isEnglish: true },
        { number: 52, turns: 4, isWin: true, isEnglish: true },
        { number: 53, turns: 3, isWin: true, isEnglish: true },
        { number: 54, turns: 6, isWin: false, isEnglish: false },
        { number: 55, turns: 5, isWin: false, isEnglish: true },
        { number: 56, turns: 2, isWin: true, isEnglish: false },
        { number: 57, turns: 4, isWin: true, isEnglish: true }
    ],
    [8, 75, 2, 4, 4.38]
);

runStatisticsTest(
    "8",
    [
        { number: 77, turns: 3, isWin: true, isEnglish: true },
        { number: 78, turns: 2, isWin: true, isEnglish: false },
        { number: 79, turns: 6, isWin: false, isEnglish: true },
        { number: 80, turns: 4, isWin: true, isEnglish: true },
        { number: 81, turns: 5, isWin: true, isEnglish: true },
        { number: 82, turns: 6, isWin: false, isEnglish: false },
        { number: 83, turns: 3, isWin: true, isEnglish: true },
        { number: 84, turns: 4, isWin: false, isEnglish: true },
        { number: 85, turns: 2, isWin: true, isEnglish: false }
    ],
    [9, 67, 1, 2, 3.89]
);

runStatisticsTest(
    "9",
    [
        { number: 130, turns: 5, isWin: true, isEnglish: true },
        { number: 131, turns: 4, isWin: true, isEnglish: true },
        { number: 132, turns: 3, isWin: true, isEnglish: true },
        { number: 133, turns: 6, isWin: false, isEnglish: false },
        { number: 134, turns: 2, isWin: true, isEnglish: true },
        { number: 135, turns: 6, isWin: false, isEnglish: true }
    ],
    [6, 67, 0, 3, 4.33]
);

runStatisticsTest(
    "10",
    [
        { number: 90, turns: 2, isWin: true, isEnglish: true },
        { number: 91, turns: 4, isWin: true, isEnglish: true },
        { number: 92, turns: 6, isWin: false, isEnglish: false },
        { number: 93, turns: 3, isWin: true, isEnglish: true },
        { number: 94, turns: 4, isWin: false, isEnglish: true },
        { number: 95, turns: 2, isWin: true, isEnglish: false },
        { number: 96, turns: 5, isWin: true, isEnglish: true },
        { number: 97, turns: 4, isWin: true, isEnglish: false }
    ],
    [8, 75, 3, 3, 3.75]
);

runStatisticsTest(
    "11",
    [
        { number: 200, turns: 6, isWin: false, isEnglish: true },
        { number: 201, turns: 4, isWin: true, isEnglish: true },
        { number: 202, turns: 5, isWin: true, isEnglish: true },
        { number: 203, turns: 6, isWin: false, isEnglish: true },
        { number: 204, turns: 4, isWin: true, isEnglish: true },
        { number: 205, turns: 5, isWin: false, isEnglish: true },
        { number: 206, turns: 3, isWin: true, isEnglish: true },
        { number: 207, turns: 4, isWin: false, isEnglish: true }
    ],
    [8, 50, 0, 2, 4.63]
);

runStatisticsTest(
    "12",
    [
        { number: 300, turns: 2, isWin: true, isEnglish: true },
        { number: 301, turns: 4, isWin: false, isEnglish: true },
        { number: 302, turns: 6, isWin: true, isEnglish: false },
        { number: 303, turns: 3, isWin: false, isEnglish: true },
        { number: 304, turns: 5, isWin: true, isEnglish: true },
        { number: 305, turns: 4, isWin: false, isEnglish: true },
        { number: 306, turns: 6, isWin: false, isEnglish: false },
        { number: 307, turns: 5, isWin: true, isEnglish: true }
    ],
    [8, 50, 1, 1, 4.38]
);

runStatisticsTest(
    "13",
    [
        { number: 101, turns: 4, isWin: true, isEnglish: true },
        { number: 102, turns: 3, isWin: false, isEnglish: true },
        { number: 104, turns: 5, isWin: true, isEnglish: true },
        { number: 105, turns: 6, isWin: true, isEnglish: true },
        { number: 108, turns: 4, isWin: true, isEnglish: true }
    ],
    [5, 80, 1, 2, 4.40]
)

runStatisticsTest(
    "14",
    [
        { number: 200, turns: 6, isWin: true, isEnglish: true },
        { number: 203, turns: 4, isWin: true, isEnglish: true },
        { number: 205, turns: 3, isWin: false, isEnglish: true },
        { number: 207, turns: 5, isWin: true, isEnglish: true },
        { number: 210, turns: 4, isWin: true, isEnglish: true }
    ],
    [5, 80, 1, 1, 4.40]
)

runStatisticsTest(
    "15",
    [
        { number: 150, turns: 6, isWin: false, isEnglish: true },
        { number: 152, turns: 4, isWin: true, isEnglish: true },
        { number: 155, turns: 3, isWin: true, isEnglish: true },
        { number: 158, turns: 5, isWin: false, isEnglish: true },
        { number: 160, turns: 2, isWin: true, isEnglish: true }
    ],
    [5, 60, 1, 1, 4.00]
)

runStatisticsTest(
    "16",
    [
        { number: 300, turns: 6, isWin: true, isEnglish: true },
        { number: 301, turns: 3, isWin: true, isEnglish: true },
        { number: 303, turns: 2, isWin: false, isEnglish: true },
        { number: 305, turns: 4, isWin: true, isEnglish: true },
        { number: 306, turns: 4, isWin: false, isEnglish: true }
    ],
    [5, 60, 0, 2, 3.80]
)

runStatisticsTest(
    "17",
    [
        { number: 401, turns: 6, isWin: true, isEnglish: true },
        { number: 404, turns: 4, isWin: true, isEnglish: true },
        { number: 407, turns: 3, isWin: false, isEnglish: true },
        { number: 408, turns: 2, isWin: true, isEnglish: true },
        { number: 411, turns: 4, isWin: true, isEnglish: true }
    ],
    [5, 80, 1, 1, 3.80]
)

runStatisticsTest(
    "18",
    [
        { number: 500, turns: 5, isWin: true, isEnglish: true },
        { number: 501, turns: 4, isWin: false, isEnglish: true },
        { number: 503, turns: 3, isWin: true, isEnglish: true },
        { number: 505, turns: 2, isWin: true, isEnglish: true },
        { number: 508, turns: 6, isWin: true, isEnglish: true }
    ],
    [5, 80, 1, 1, 4.00]
)

runStatisticsTest(
    "19",
    [
        { number: 600, turns: 5, isWin: true, isEnglish: true },
        { number: 602, turns: 6, isWin: false, isEnglish: true },
        { number: 605, turns: 4, isWin: true, isEnglish: true },
        { number: 607, turns: 3, isWin: false, isEnglish: true },
        { number: 609, turns: 2, isWin: true, isEnglish: true }
    ],
    [5, 60, 1, 1, 4.00]
)

runStatisticsTest(
    "20",
    [
        { number: 701, turns: 4, isWin: true, isEnglish: true },
        { number: 702, turns: 5, isWin: false, isEnglish: true },
        { number: 704, turns: 3, isWin: true, isEnglish: true },
        { number: 707, turns: 2, isWin: true, isEnglish: true },
        { number: 709, turns: 6, isWin: true, isEnglish: true }
    ],
    [5, 80, 1, 1, 4.00]
)

runStatisticsTest(
    "21",
    [
        { number: 800, turns: 4, isWin: true, isEnglish: true },
        { number: 803, turns: 5, isWin: true, isEnglish: true },
        { number: 805, turns: 6, isWin: false, isEnglish: true },
        { number: 808, turns: 3, isWin: true, isEnglish: true },
        { number: 809, turns: 2, isWin: true, isEnglish: true }
    ],
    [5, 80, 2, 2, 4.00]
)

runStatisticsTest(
    "22",
    [
        { number: 901, turns: 6, isWin: true, isEnglish: true },
        { number: 904, turns: 5, isWin: false, isEnglish: true },
        { number: 906, turns: 4, isWin: true, isEnglish: true },
        { number: 909, turns: 3, isWin: true, isEnglish: true },
        { number: 911, turns: 2, isWin: true, isEnglish: true }
    ],
    [5, 80, 1, 1, 4.00]
)