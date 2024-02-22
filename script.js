"use strict";

// DOM
const boardEl = document.querySelector(".candies-board");
const candiesEls = document.getElementsByClassName("candy"); // HTML Collection (Live, listen to updates, no need to reassign)

// Game data
const candies = ["colour-bomb", "lolly", "peppermint", "saga"];
const board = [];
const [rows, cols] = [9, 9];

let currDragingCandy;
let finalCandy;

const MAX_ROW_CRUSH = 6;
const MAX_COL_CRUSH = 6;

const events = [
  { event: "dragstart", callback: onCandyDragStart },
  { event: "dragend", callback: onCandyDragEnd },
  { event: "drop", callback: onCandyDrop },
  { event: "dragover", callback: (e) => e.preventDefault() },
  { event: "dragenter", callback: (e) => e.preventDefault() },
  { event: "dragleave", callback: (e) => e.preventDefault() },
];

// Functions
function generateBoard() {
  // 1) Loop over the rows and columns, and for each create candy
  for (let r = 0; r < rows; r++) {
    const newRow = [];

    for (let c = 0; c < cols; c++) {
      // 1)
      const { candyDIV, candy } = generateCandy(r, c);
      // 2)
      boardEl.appendChild(candyDIV);
      // 3)
      newRow.push({ candy, candyDIV, row: r, col: c });
    }

    // 2)
    board.push(newRow);
  }
}

function generateCandy(row, col) {
  // 1)
  const candyDIV = document.createElement("div");
  // 2)
  candyDIV.setAttribute("data-row", row);
  candyDIV.setAttribute("data-col", col);
  // 3)
  const candyIMG = document.createElement("img");
  // 4)
  const randomCandy = candies[getRandomCandyNumber()];
  // 5)
  const candyImgUrl = `./assets/images/${randomCandy}.png`;
  // 6)
  candyIMG.src = candyImgUrl;
  // 7)
  candyDIV.appendChild(candyIMG);
  // 7) Set classes
  candyDIV.classList.add("candy");
  // 9)
  return { candyDIV, candy: randomCandy };
}

function getRandomCandyNumber() {
  return Math.floor(Math.random() * candies.length);
}

// this = candy

function onCandyDragStart() {
  // 1) Get column and row of candy we want to dragging;
  let { col, row } = this.dataset;
  // 2) Convert them to number
  col = +col;
  row = +row;
  // 3) Get candy from board
  const candy = board[row][col];
  // 4) Set that candy to draggingCandyy
  currDragingCandy = candy;
  // 5) Remove final candy if it exists
  if (finalCandy) finalCandy = null;
}

function onCandyDrop() {
  // 1) Get column and row of candy we want to drop draggingCandy on!
  let { col, row } = this.dataset;
  // 2) Convert them to number
  col = +col;
  row = +row;
  // 3) Get candy from board
  const candy = board[row][col];
  // 4) Set that candy to finalCandy
  finalCandy = candy;
}

function onCandyDragEnd() {
  // 1) Check is move a possible
  if (!isMovePossible(currDragingCandy, finalCandy)) return;

  //  If move is possible...

  // 2) Swap candies
  swapCandies();

  // 3) Crush board
  const didCrushHappen = crushBoard();

  // 4) If crush happened, move is valid, otherwise its not
  if (didCrushHappen) {
    console.log("Score!!!");
  } else {
    // Swap candies back after 0.2s
    setTimeout(() => {
      swapCandies();
    }, 200);
  }
}

function isMovePossible(currDragingCandy, finalCandy) {
  // 1)
  if (!currDragingCandy || !finalCandy) return;

  // 2) Get their coordinates
  const { row: startRow, col: startCol } = currDragingCandy;
  const { row: finalRow, col: finalCol } = finalCandy;

  // 3) Create moving variables

  const movingLeft = startRow === finalRow && finalCol === startCol - 1;
  const movingRight = startRow === finalRow && finalCol === startCol + 1;
  const movingUp = startRow === finalRow + 1 && finalCol === startCol;
  const movingDown = startRow === finalRow - 1 && finalCol === startCol;

  // 4) If any of theese conditions is true, move is possiblle.
  return movingLeft | movingRight | movingUp | movingDown;
}

function swapCandies() {
  // 1) Get their images
  const currDraggingCandyIMG = currDragingCandy.candyDIV.querySelector("img");
  const finalCandyIMG = finalCandy.candyDIV.querySelector("img");
  // 2) Get src of images
  const [draggingImgSrc, finalImgSrc] = [
    currDraggingCandyIMG.src,
    finalCandyIMG.src,
  ];
  // 3) Swap them
  // - Images
  currDraggingCandyIMG.src = finalImgSrc;
  finalCandyIMG.src = draggingImgSrc;
  // - Objects
  const temp = { ...finalCandy };
  finalCandy = { ...currDragingCandy };
  currDragingCandy = temp;
  // - Change candies in board
  board[currDragingCandy.row][currDragingCandy.col].candy = finalCandy?.candy;
  board[finalCandy.row][finalCandy.col].candy = currDragingCandy?.candy;
}

function crushBoard() {
  // 1) Track did crush happen during this process
  let didCrushHappen = false;

  // 2) Check are there matched candies (three in row)
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols - 2; c++) {
      // 1)
      const threeInRow = [board[r][c], board[r][c + 1], board[r][c + 2]];

      // 2) Are they matched
      if (matchedCandies(threeInRow)) {
        console.log(threeInRow);
        // If they are, crush them!
        crushCandies(threeInRow);
        //
        didCrushHappen = true;
      }
    }
  }

  // 3) Check are there matched candies (three in column)
  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rows - 2; r++) {
      // 1)
      const threeInRow = [board[r][c], board[r + 1][c], board[r + 2][c]];
      // 2) Are they matched
      if (matchedCandies(threeInRow)) {
        // If they are, crush them!
        crushCandies(threeInRow);
        //
        didCrushHappen = true;
      }
    }
  }

  // 4) Return
  return didCrushHappen;
}

function matchedCandies(candies) {
  if (candies.indexOf("empty") !== -1) return;

  return candies.every(({ candy }) => candy === candies[0].candy);
}

function crushCandies(candies) {
  candies.forEach((candy) => {
    candy.candyDIV.classList.add("crushed");
    board[candy.row][candy.col] = "empty";
  });
}

// On load
(() => {
  // 1) Generate board (including candies)
  generateBoard();
  // 2) Set event listeners for each candy, we dont want to loop over them because it can slow down our applcation, instead of that we will implement .closest() method on parent element (board)
  events.forEach(({ event, callback }) =>
    boardEl.addEventListener(event, (e) => {
      const candy = e.target.closest(".candy");
      if (!candy) return;
      callback.call(candy, e);
    })
  );
})();
