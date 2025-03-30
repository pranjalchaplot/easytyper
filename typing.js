const words =
  "in one good real one not school set they state high life consider on and not come what also for set point can want as while with of order child about school thing never hold find order each too between program work end you home place around while place problem end begin interest while public or where see time those increase interest be give end think seem small as both another a child same eye you between way do who into again good fact than under very head become real possible some write know however late each that with because that place nation only for each change form consider we would interest with world so order or run more open that large write turn never over open each over change still old take hold need give by consider line only leave while what set up number part form want against great problem can because head so first this here would course become help year first end want both fact public long word down also long for without new turn against the because write seem line interest call not if line thing what work people way may old consider leave hold want life between most place may if go who need fact such program where which end off child down change to from people high during people find to however into small new general it do that could old for last get another hand much eye great no work and with but good there last think can around use like number never since world need what we around part show new come seem while some and since still small these you general which seem will place come order form how about just also they with state late use both early too lead general seem there point take general seem few out like might under if ask while such interest feel word right again how about system such between late want fact up problem stand new say move a lead small however large public out by eye here over so be way use like say people work for since interest so face order school good not most run problem group run she late other problem real form what just high no man do under would to each too end point give number child through so this large see get form also all those course to work during about he plan still so like down he look down where course at who plan way so since come against he all who at world because while so few last these mean take house who old way large no first too now off would in this course present order home public school back own little about he develop of do over help day house stand present another by few come that down last or use say take would each even govern play around back under some line think she even when from do real problem between long as there school do as mean to all on other good may from might call world thing life turn of he look last problem after get show want need thing old other during be again develop come from consider the now number say life interest to system only group world same state school one problem between for turn run at very against eye must go both still all a as so after play eye little be those should out after which these both much house become both school this he real and may mean time by real number other as feel at end ask plan come turn by all head increase he present increase use stand after see order lead than system here ask in of look point little too without each for both but right we come world much own set we right off long those stand go both but under now must real general then before with much those at no of we only back these person plan from run new as own take early just increase only look open follow get that on system the mean plan man over it possible if most late line would first without real hand say turn point small set at in system however to be home show new again come under because about show face child know person large program how over could thing from out world while nation stand part run have look what many system order some one program you great could write day do he any also where child late face eye run still again on by as call high the must by late little mean never another seem to leave because for day against public long number word about after much need open change also".split(
    " "
  );
const wordsCount = words.length;
let gameTime = 10 * 1000; // 30 seconds
window.timer = null;
window.gameStart = null;
// window.pauseTime = 0; // Not used in this version

// Get DOM elements (ensure these IDs match popup.html)
const gameEl = document.getElementById("game");
const wordsEl = document.getElementById("words");
const cursorEl = document.getElementById("cursor");
const infoEl = document.getElementById("info");
const newGameBtn = document.getElementById("newGameBtn");
const wpmFooterEl = document.querySelector(
  ".footer .format-indicator:first-child"
); // Target footer WPM display

function addClass(el, name) {
  if (el) el.classList.add(name);
}
function removeClass(el, name) {
  if (el) el.classList.remove(name);
}

function loadGameTime() {
  const savedTime = localStorage.getItem("gameTime");
  if (savedTime) {
    // Update your game's time variable
    gameTime = parseInt(savedTime) * 1000; // Convert seconds to milliseconds

    // If you have a countdown or timer display, update it
    if (document.getElementById("info")) {
      document.getElementById("info").textContent = savedTime + "s";
    }
  }
}

function randomWord() {
  const randomIndex = Math.floor(Math.random() * wordsCount); // Use floor for 0-based index
  return words[randomIndex];
}

function formatWord(word) {
  return `<div class="word"><span class="letter">${word
    .split("")
    .join('</span><span class="letter">')}</span></div>`;
}

function updateCursorPosition() {
  const nextLetter = document.querySelector(".letter.current");
  const nextWord = document.querySelector(".word.current");

  if (!cursorEl || (!nextLetter && !nextWord)) return; // Element doesn't exist or no current word/letter

  const gameRect = gameEl.getBoundingClientRect();
  let targetRect;

  if (nextLetter) {
    targetRect = nextLetter.getBoundingClientRect();
    cursorEl.style.top =
      targetRect.top - gameRect.top + gameEl.scrollTop + "px"; // Position relative to gameEl top + scroll
    cursorEl.style.left = targetRect.left - gameRect.left + "px"; // Position relative to gameEl left
  } else if (nextWord) {
    // Position cursor at the end of the word if no letters are left (e.g., after backspacing all)
    targetRect = nextWord.getBoundingClientRect();
    cursorEl.style.top =
      targetRect.top - gameRect.top + gameEl.scrollTop + "px";
    cursorEl.style.left = targetRect.right - gameRect.left + "px";
  }
  cursorEl.style.height = targetRect
    ? `${targetRect.height * 0.9}px`
    : "1.1rem"; // Adjust height slightly smaller than letter
}

function newGame() {
  if (window.timer) clearInterval(window.timer); // Clear existing timer
  removeClass(gameEl, "over");
  wordsEl.innerHTML = "";
  wordsEl.style.marginTop = "0px"; // Reset scroll
  for (let i = 0; i < 150; i++) {
    // Generate fewer words initially for performance
    wordsEl.innerHTML += formatWord(randomWord());
  }
  // Set first word and letter
  const firstWord = document.querySelector(".word");
  const firstLetter = document.querySelector(".letter");
  if (firstWord) addClass(firstWord, "current");
  if (firstLetter) addClass(firstLetter, "current");

  // Load game time from local storage
  const savedTime = localStorage.getItem("gameTime");
  if (savedTime) {
    gameTime = parseInt(savedTime) * 1000; // Convert seconds to milliseconds
  }

  infoEl.innerHTML = gameTime / 1000 + "s"; // Show units
  // wpmFooterEl.innerHTML = "WPM: --"; // Reset footer WPM
  window.timer = null;
  window.gameStart = null;

  // Initial cursor position
  requestAnimationFrame(updateCursorPosition); // Use rAF for smoother updates

  // Auto-focus the game area for immediate typing
  gameEl.focus();
}

function getWpm() {
  const words = [...document.querySelectorAll(".word")];
  const currentWordEl = document.querySelector(".word.current");
  // If no current word, it means we haven't typed anything or game just ended weirdly
  const lastTypedWordIndex = currentWordEl
    ? words.indexOf(currentWordEl)
    : words.length - 1;

  // Only count words *before* the current word as fully typed (or all if game ended)
  const typedWords = words.slice(0, lastTypedWordIndex);

  const correctWords = typedWords.filter((word) => {
    const letters = [...word.children];
    // A word is correct if all its letters have the 'correct' class and none have 'incorrect'
    const incorrectLetters = letters.filter((letter) =>
      letter.classList.contains("incorrect")
    );
    const correctLetters = letters.filter((letter) =>
      letter.classList.contains("correct")
    );
    // Consider a word correct only if it was fully typed correctly
    return (
      incorrectLetters.length === 0 &&
      correctLetters.length === letters.length &&
      letters.length > 0
    );
  });

  // Calculate WPM based on time elapsed
  const timeElapsed = window.gameStart
    ? new Date().getTime() - window.gameStart
    : gameTime;
  const minutesElapsed = timeElapsed / 60000;

  // Avoid division by zero if timeElapsed is very small
  return minutesElapsed > 0
    ? Math.round(correctWords.length / minutesElapsed)
    : 0;
}

function gameOver() {
  clearInterval(window.timer);
  window.timer = null;
  addClass(gameEl, "over");
  const result = getWpm();
  infoEl.innerHTML = `Done!`; // Update top info
  wpmFooterEl.innerHTML = `Last WPM: ${result}`; // Update footer WPM

  // Store last WPM in local storage
  localStorage.setItem("lastWPM", result);

  // Get all-time high WPM from local storage
  let highScore = localStorage.getItem("highScore") || 0;

  // Update all-time high WPM if current WPM is higher
  if (result > highScore) {
    localStorage.setItem("highScore", result);
    highScore = result;
  }

  // Send WPM to popup.js
  chrome.runtime.sendMessage({
    message: "updateWPM",
    lastWPM: result,
    highScore: highScore,
  });
}

gameEl.addEventListener("keydown", (ev) => {
  // Use keydown for better backspace handling
  if (gameEl.classList.contains("over")) {
    return; // Don't process input if game is over
  }

  const key = ev.key;
  const currentWord = document.querySelector(".word.current");
  const currentLetter = document.querySelector(".letter.current");

  if (!currentWord) return; // Should not happen in normal flow, but safety check

  const expected = currentLetter?.innerHTML || " "; // If no current letter, expect space
  const isLetter = key.length === 1 && key !== " ";
  const isSpace = key === " ";
  const isBackspace = key === "Backspace";

  // Start timer on first valid keypress (letter or space, but not backspace)
  if (!window.timer && (isLetter || isSpace) && !isBackspace) {
    window.gameStart = new Date().getTime();
    window.timer = setInterval(() => {
      const currentTime = new Date().getTime();
      const msPassed = currentTime - window.gameStart;
      const sPassed = Math.round(msPassed / 1000);
      const sLeft = Math.max(0, Math.round(gameTime / 1000 - sPassed)); // Ensure non-negative

      infoEl.innerHTML = sLeft + "s";

      if (sLeft <= 0) {
        gameOver();
      }
    }, 1000);
  }

  // --- Input Handling ---

  if (isLetter) {
    ev.preventDefault(); // Prevent default action for letters
    if (currentLetter) {
      addClass(currentLetter, key === expected ? "correct" : "incorrect");
      removeClass(currentLetter, "current");
      if (currentLetter.nextSibling) {
        addClass(currentLetter.nextSibling, "current");
      }
      // else: handled below - cursor moves to end of word visually
    } else {
      // Typing extra letters (currentLetter is null) - DEPRECATED: Prevent extra letters
      console.log("Attempted extra letter - ignored");
      // Optionally add visual feedback (e.g., shake effect)
    }
  }

  if (isSpace) {
    ev.preventDefault(); // Prevent default space scroll/etc.
    // Only advance if the current letter was indeed a space (or if at end of word)
    if (expected === " " || !currentLetter) {
      // Mark remaining letters in the current word as incorrect if skipped
      if (currentLetter) {
        let letterToMark = currentLetter;
        while (letterToMark) {
          if (!letterToMark.classList.contains("correct")) {
            addClass(letterToMark, "incorrect"); // Mark skipped letters
          }
          removeClass(letterToMark, "current");
          letterToMark = letterToMark.nextSibling;
        }
      }

      removeClass(currentWord, "current");
      const nextWord = currentWord.nextSibling;
      if (nextWord) {
        addClass(nextWord, "current");
        addClass(nextWord.firstChild, "current"); // Move to first letter of next word
        // Add more words if getting close to the end
        if (!nextWord.nextSibling?.nextSibling?.nextSibling) {
          // Look ahead a few words
          for (let i = 0; i < 50; i++) {
            wordsEl.innerHTML += formatWord(randomWord());
          }
        }
      } else {
        gameOver(); // Reached end of generated words (or error)
      }
    } else {
      // Incorrect space press - maybe add subtle error feedback
    }
  }

  if (isBackspace) {
    ev.preventDefault(); // Prevent backspace navigating back
    const isFirstLetter = currentLetter === currentWord.firstChild;

    if (currentLetter && !isFirstLetter) {
      // Move back one letter within the same word
      removeClass(currentLetter, "current");
      addClass(currentLetter.previousSibling, "current");
      removeClass(currentLetter.previousSibling, "incorrect");
      removeClass(currentLetter.previousSibling, "correct");
    } else if (currentLetter && isFirstLetter) {
      // If on first letter, try to move to previous word's last letter
      const prevWord = currentWord.previousSibling;
      if (prevWord) {
        removeClass(currentWord, "current");
        addClass(prevWord, "current");
        // Remove status from all letters in prevWord
        [...prevWord.children].forEach((l) => {
          removeClass(l, "current");
          removeClass(l, "incorrect");
          removeClass(l, "correct");
        });
        // Make last letter of prevWord current
        if (prevWord.lastChild) {
          addClass(prevWord.lastChild, "current");
        }
      }
      // If it's the very first letter of the first word, do nothing more
    } else if (!currentLetter) {
      // We are at the end of the word (after the last letter)
      // Move back to the actual last letter
      if (currentWord.lastChild) {
        addClass(currentWord.lastChild, "current");
        removeClass(currentWord.lastChild, "incorrect");
        removeClass(currentWord.lastChild, "correct");
      }
    }
  }

  // --- Scrolling ---
  const currentWordElForScroll = document.querySelector(".word.current");
  if (currentWordElForScroll) {
    const wordRect = currentWordElForScroll.getBoundingClientRect();
    const gameRect = gameEl.getBoundingClientRect();
    // If the top of the current word is below the middle line of the game area
    const scrollThreshold = gameRect.top + gameEl.clientHeight / 2; // Adjust threshold slightly lower

    if (wordRect.bottom > gameRect.bottom - 10) {
      // If word bottom is near game bottom
      gameEl.scrollTop += currentWordElForScroll.offsetHeight * 1.2; // Scroll down one line height plus a bit
    } else if (wordRect.top < gameRect.top + 10 && gameEl.scrollTop > 0) {
      // If word top is near game top
      gameEl.scrollTop -= currentWordElForScroll.offsetHeight * 1.2; // Scroll up one line height plus a bit
    }
  }

  // Update cursor position after state changes
  requestAnimationFrame(updateCursorPosition);
});

// Event listener for the New Game button
newGameBtn.addEventListener("click", newGame);

// Initial game setup on load
newGame();
