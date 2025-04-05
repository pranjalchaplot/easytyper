// Word list (shortened for brevity in example)
const words =
  "in one good real one not school set they state high life consider on and not come what also for set point can want as while with of order child about school thing never hold find order each too between program work end you home place around while place problem end begin interest while public or where see time those increase interest be give end think seem small as both another a child same eye you between way do who into again good fact than under very head become real possible some write know however late each that with because that place nation only for each change form consider we would interest with world so order or run more open that large write turn never over open each over change still old take hold need give by consider line only leave while what set up number part form want against great problem can because head so first this here would course become help year first end want both fact public long word down also long for without new turn against the because write seem line interest call not if line thing what work people way may old consider leave hold want life between most place may if go who need fact such program where which end off child down change to from people high during people find to however into small new general it do that could old for last get another hand much eye great no work and with but good there last think can around use like number never since world need what we around part show new come seem while some and since still small these you general which seem will place come order form how about just also they with state late use both early too lead general seem there point take general seem few out like might under if ask while such interest feel word right again how about system such between late want fact up problem stand new say move a lead small however large public out by eye here over so be way use like say people work for since interest so face order school good not most run problem group run she late other problem real form what just high no man do under would to each too end point give number child through so this large see get form also all those course to work during about he plan still so like down he look down where course at who plan way so since come against he all who at world because while so few last these mean take house who old way large no first too now off would in this course present order home public school back own little about he develop of do over help day house stand present another by few come that down last or use say take would each even govern play around back under some line think she even when from do real problem between long as there school do as mean to all on other good may from might call world thing life turn of he look last problem after get show want need thing old other during be again develop come from consider the now number say life interest to system only group world same state school one problem between for turn run at very against eye must go both still all a as so after play eye little be those should out after which these both much house become both school this he real and may mean time by real number other as feel at end ask plan come turn by all head increase he present increase use stand after see order lead than system here ask in of look point little too without each for both but right we come world much own set we right off long those stand go both but under now must real general then before with much those at no of we only back these person plan from run new as own take early just increase only look open follow get that on system the mean plan man over it possible if most late line would first without real hand say turn point small set at in system however to be home show new again come under because about show face child know person large program how over could thing from out world while nation stand part run have look what many system order some one program you great could write day do he any also where child late face eye run still again on by as call high the must by late little mean never another seem to leave because for day against public long number word about after much need open change also".split(
    " "
  );
const wordsCount = words.length;
const AVERAGE_WORD_LENGTH = 5; // Estimate for font calculation (chars + space)

// --- Global State ---
let gameTime = (localStorage.getItem("gameTime") || 10) * 1000; // Default 10s
let gameLines = parseInt(localStorage.getItem("gameLines") || 4); // Default 4 lines
window.timer = null;
window.gameStart = null;
let gameActive = false; // Track if the timer is running

// --- DOM Elements ---
const gameEl = document.getElementById("game");
const wordsEl = document.getElementById("words");
const cursorEl = document.getElementById("cursor");
const infoEl = document.getElementById("info"); // Top timer/status display
const newGameBtn = document.getElementById("newGameBtn");
const wpmFooterEl = document.getElementById("lastWPM"); // Footer WPM
const highScoreFooterEl = document.getElementById("highScore"); // Footer High Score

// --- Utility Functions ---
function addClass(el, name) {
  if (el) el.classList.add(name);
}
function removeClass(el, name) {
  if (el) el.classList.remove(name);
}

// --- *** NEW/MODIFIED: Calculate Font Size & Apply Settings *** ---

// Debounce function to limit rapid recalculations
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

function applySettings() {
  // Apply Line Count Setting
  document.documentElement.style.setProperty("--line-count", gameLines);

  // Apply Words Per Line Setting (triggers font size calculation)

  // Update cursor height based on new font size (CSS handles this now via var)
  // cursorEl.style.height = `calc(var(--word-font-size) * var(--line-height-relative) * 0.8)`;

  // Ensure game element height updates (CSS should handle this via calc())
  // Force reflow to ensure browser recalculates layout based on new CSS vars
  gameEl.offsetHeight; // NOSONAR: This is a trick to force reflow

  // Re-calculate cursor position after applying settings
  requestAnimationFrame(updateCursorPosition);
}

// --- Word Generation and Formatting ---
function randomWord() {
  const randomIndex = Math.floor(Math.random() * wordsCount);
  return words[randomIndex];
}

function formatWord(word) {
  return `<div class="word"><span class="letter">${word
    .split("")
    .join('</span><span class="letter">')}</span></div>`;
}

// --- Cursor Position ---
function updateCursorPosition() {
  if (!gameEl || !cursorEl) return; // Elements not ready

  const currentLetter = document.querySelector(".letter.current");
  const currentWord = document.querySelector(".word.current");

  // If no current letter or word, maybe game hasn't started or is over
  if (!currentLetter && !currentWord) {
    // Position at the start of the first word if available
    const firstLetter = wordsEl.querySelector(".letter");
    if (firstLetter) {
      const gameRect = gameEl.getBoundingClientRect();
      const targetRect = firstLetter.getBoundingClientRect();
      cursorEl.style.top = `${
        targetRect.top - gameRect.top + gameEl.scrollTop
      }px`;
      cursorEl.style.left = `${targetRect.left - gameRect.left}px`;
    } else {
      cursorEl.style.display = "none"; // Hide cursor if no words
    }
    return;
  }

  cursorEl.style.display = "block"; // Ensure cursor is visible if we have a target

  const gameRect = gameEl.getBoundingClientRect();
  let targetRect;

  if (currentLetter) {
    // Position cursor at the start of the current letter
    targetRect = currentLetter.getBoundingClientRect();
    cursorEl.style.top = `${
      targetRect.top - gameRect.top + gameEl.scrollTop
    }px`;
    cursorEl.style.left = `${targetRect.left - gameRect.left}px`;
  } else if (currentWord) {
    // Position cursor at the end of the current word (no letters left or between words)
    targetRect = currentWord.getBoundingClientRect();
    const lastLetter = currentWord.lastChild; // Get the last span.letter
    if (lastLetter) {
      const lastLetterRect = lastLetter.getBoundingClientRect();
      cursorEl.style.top = `${
        lastLetterRect.top - gameRect.top + gameEl.scrollTop
      }px`;
      cursorEl.style.left = `${lastLetterRect.right - gameRect.left}px`; // Position after the last letter
    } else {
      // Empty word? Position at the start of the word's box
      cursorEl.style.top = `${
        targetRect.top - gameRect.top + gameEl.scrollTop
      }px`;
      cursorEl.style.left = `${targetRect.left - gameRect.left}px`;
    }
  }

  // Height is now set by CSS using the --word-font-size variable
  // cursorEl.style.height = `calc(var(--word-font-size, 1.5rem) * var(--line-height-relative) * 0.8)`;
}

// --- Game Logic ---
function newGame() {
  if (window.timer) clearInterval(window.timer);
  window.timer = null;
  window.gameStart = null;
  gameActive = false;
  removeClass(gameEl, "over");
  wordsEl.innerHTML = "";
  gameEl.scrollTop = 0; // Reset scroll explicitly

  // *** Apply latest settings (Lines and WPL/Font Size) ***
  applySettings();

  // Generate initial words
  // Estimate words needed based on lines
  const wordsNeeded = Math.ceil(gameLines * 1.5); // Add buffer
  const initialWordCount = Math.max(50, wordsNeeded); // Ensure reasonable minimum

  for (let i = 0; i < initialWordCount; i++) {
    wordsEl.innerHTML += formatWord(randomWord());
  }

  // Set first word/letter
  const firstWord = document.querySelector(".word");
  const firstLetter = document.querySelector(".letter");
  if (firstWord) addClass(firstWord, "current");
  if (firstLetter) addClass(firstLetter, "current");

  // Reset displays
  infoEl.textContent = `${gameTime / 1000}s`; // Show initial time
  // Footer WPM/High Score are updated via messages or on game over

  // Update cursor *after* words are added and settings applied
  requestAnimationFrame(() => {
    updateCursorPosition();
    gameEl.focus(); // Focus the game area
  });
}

function getWpm() {
  if (!window.gameStart) return 0; // Game hasn't started or finished abruptly

  const words = [...document.querySelectorAll(".word")];
  const currentWordEl = document.querySelector(".word.current");

  // Index of the word *before* the currently active one
  const lastTypedWordIndex = currentWordEl
    ? words.indexOf(currentWordEl)
    : words.length;

  const typedWords = words.slice(0, lastTypedWordIndex); // Words fully passed

  const correctWords = typedWords.filter((word) => {
    const letters = [...word.children];
    // A word is correct if ALL letters have class 'correct'
    const incorrectLetters = letters.filter((l) =>
      l.classList.contains("incorrect")
    );
    const correctLetters = letters.filter((l) =>
      l.classList.contains("correct")
    );
    // Ensure the word was actually typed (has letters and all are correct)
    return (
      letters.length > 0 &&
      incorrectLetters.length === 0 &&
      correctLetters.length === letters.length
    );
  });

  const timeElapsed = new Date().getTime() - window.gameStart; // Milliseconds
  const minutesElapsed = timeElapsed / 60000;

  return minutesElapsed > 0
    ? Math.round(correctWords.length / minutesElapsed)
    : 0;
}

function gameOver() {
  clearInterval(window.timer);
  window.timer = null;
  gameActive = false;
  addClass(gameEl, "over");
  const result = getWpm(); // Calculate WPM *before* updating displays

  // Update displays
  infoEl.textContent = `Done!`;
  // Update footer DOM elements directly
  if (wpmFooterEl) wpmFooterEl.textContent = `Last WPM: ${result}`;
  // Save scores
  localStorage.setItem("lastWPM", result);
  let highScore = parseInt(localStorage.getItem("highScore") || 0);
  if (result > highScore) {
    highScore = result;
    localStorage.setItem("highScore", highScore);
  }
  if (highScoreFooterEl)
    highScoreFooterEl.textContent = `High Score: ${highScore}`;
}

// --- Event Listeners ---

// --- NEW: Function for popup.js to call directly ---
window.updateGameSetting = function (setting, value) {
  // console.log("updateGameSetting called:", setting, value); // Debugging
  let settingsChanged = false;
  const numericValue = parseInt(value);

  if (setting === "time") {
    gameTime = numericValue * 1000; // Convert s to ms
    localStorage.setItem("gameTime", numericValue); // Save immediately
    if (!gameActive && infoEl) {
      // Only update display if game isn't running
      infoEl.textContent = `${numericValue}s`;
    }
    settingsChanged = true;
  } else if (setting === "lines") {
    gameLines = numericValue;
    localStorage.setItem("gameLines", gameLines); // Save immediately
    settingsChanged = true;
  }

  // Optional: Auto-restart game on setting change (if desired)
  // if (settingsChanged && !gameActive) {
  //    // Debounce newGame call if settings are changed rapidly
  //    // clearTimeout(window.newGameTimeout);
  //    // window.newGameTimeout = setTimeout(newGame, 300);
  // }

  if (settingsChanged) newGame();
  return settingsChanged; // Indicate if a setting was actually updated
};

// Remove the old message listener
// chrome.runtime.onMessage.addListener((request, sender, sendResponse) => { ... });

gameEl.addEventListener("keydown", (ev) => {
  if (gameEl.classList.contains("over")) return; // Ignore input if game over

  const key = ev.key;
  const currentWord = document.querySelector(".word.current");
  const currentLetter = document.querySelector(".letter.current");

  if (!currentWord && key !== "Backspace") return; // Should not happen unless starting

  const expected = currentLetter?.textContent || " "; // Expect space if between words
  const isLetter = key.length === 1 && key !== " ";
  const isSpace = key === " ";
  const isBackspace = key === "Backspace";

  // Start timer on first valid typing input (not backspace)
  if (!gameActive && !window.timer && (isLetter || isSpace)) {
    window.gameStart = new Date().getTime();
    gameActive = true;
    window.timer = setInterval(() => {
      const currentTime = new Date().getTime();
      const msPassed = currentTime - window.gameStart;
      const sLeft = Math.max(0, Math.round((gameTime - msPassed) / 1000));
      infoEl.textContent = `${sLeft}s`;
      if (sLeft <= 0) {
        gameOver();
      }
    }, 1000);
  }

  // --- Input Handling ---
  if (isLetter) {
    ev.preventDefault(); // Prevent default letter actions
    if (currentLetter) {
      addClass(currentLetter, key === expected ? "correct" : "incorrect");
      removeClass(currentLetter, "current");
      if (currentLetter.nextSibling) {
        addClass(currentLetter.nextSibling, "current");
      }
      // If no next sibling, cursor moves visually to end of word via updateCursorPosition
    } else {
      // Typed letter when expecting space (end of word) - ignore
      // console.log("Extra letter typed - ignored");
    }
  }

  if (isSpace) {
    ev.preventDefault(); // Prevent default space actions (like scrolling)

    // Check if we are at the end of a word (no current letter) OR the expected char is a space
    if (!currentLetter || expected === " ") {
      // Mark remaining (untyped) letters in current word as incorrect (skipped)
      let letterToMark = currentLetter; // Start from current (if exists)
      while (letterToMark) {
        if (!letterToMark.classList.contains("correct")) {
          addClass(letterToMark, "incorrect"); // Mark skipped letters as incorrect
        }
        removeClass(letterToMark, "current"); // Ensure no letters in the old word remain current
        letterToMark = letterToMark.nextSibling;
      }

      // If currentLetter was null, we were already at the end, just move to next word
      removeClass(currentWord, "current");
      const nextWord = currentWord.nextSibling;

      if (nextWord) {
        addClass(nextWord, "current");
        if (nextWord.firstChild) {
          addClass(nextWord.firstChild, "current"); // Move to first letter of next word
        }

        // Add more words dynamically if nearing the end
        // Check if few words remaining in the buffer
        let wordsAhead = 0;
        let checkWord = nextWord;
        while (checkWord && wordsAhead < 15) {
          // Check about 1.5 lines ahead approx
          checkWord = checkWord.nextSibling;
          wordsAhead++;
        }

        if (wordsAhead < 15) {
          const wordsToAdd = Math.max(20, gameLines); // Add decent batch
          // Use DocumentFragment for performance
          const fragment = document.createDocumentFragment();
          for (let i = 0; i < wordsToAdd; i++) {
            fragment.appendChild(
              document
                .createRange()
                .createContextualFragment(formatWord(randomWord()))
            );
          }
          wordsEl.appendChild(fragment);
        }
      } else {
        gameOver(); // No more words left
      }
    } else {
      // Incorrect space (pressed space mid-word)
      if (currentLetter) {
        addClass(currentLetter, "incorrect"); // Mark the letter where space was pressed as incorrect
        // Optionally move cursor forward like a wrong letter? Current logic keeps cursor.
      }
    }
  }

  if (isBackspace) {
    ev.preventDefault(); // Prevent backspace from navigating back

    const isFirstLetterOfWord = currentLetter === currentWord?.firstChild;

    if (currentLetter && !isFirstLetterOfWord) {
      // Backspace within the word
      removeClass(currentLetter, "current"); // Remove current status from current letter
      addClass(currentLetter.previousSibling, "current"); // Make previous letter current
      // Clear status of the now-current letter
      removeClass(currentLetter.previousSibling, "correct");
      removeClass(currentLetter.previousSibling, "incorrect");
    } else if (currentLetter && isFirstLetterOfWord) {
      // Backspace on the first letter of the current word
      const prevWord = currentWord.previousSibling;
      if (prevWord) {
        removeClass(currentWord, "current"); // Deactivate current word
        addClass(prevWord, "current"); // Activate previous word

        // Find the first letter of the previous word to remove its current status if any
        const firstLetterPrev = prevWord.firstChild;
        if (firstLetterPrev) removeClass(firstLetterPrev, "current");

        // Make the *last* letter of the previous word current (ready for backspace again)
        const lastLetterPrev = prevWord.lastChild;
        if (lastLetterPrev) {
          addClass(lastLetterPrev, "current");
          // Clear its status as well, ready for re-typing or further backspace
          removeClass(lastLetterPrev, "correct");
          removeClass(lastLetterPrev, "incorrect");
        }
      }
      // If prevWord doesn't exist (it's the very first word), just clear the current letter
      else {
        removeClass(currentLetter, "current"); // Deselect letter
        addClass(currentWord, "current"); // Keep word current
        addClass(currentLetter, "current"); // Re-select the first letter
        removeClass(currentLetter, "correct"); // Clear status
        removeClass(currentLetter, "incorrect");
      }
    } else if (!currentLetter && currentWord?.lastChild) {
      // Cursor is visually after the last letter, move back to the last letter
      addClass(currentWord.lastChild, "current");
      removeClass(currentWord.lastChild, "correct");
      removeClass(currentWord.lastChild, "incorrect");
    }
    // If !currentLetter and no lastChild (empty word somehow?), do nothing
  }

  // --- Scrolling ---
  const currentWordElForScroll = document.querySelector(".word.current");
  if (currentWordElForScroll && gameEl.clientHeight < gameEl.scrollHeight) {
    const wordRect = currentWordElForScroll.getBoundingClientRect();
    const gameRect = gameEl.getBoundingClientRect();
    const currentLetterElForScroll = document.querySelector(".letter.current");

    let targetTop = wordRect.top;
    // Use letter position if available for more accuracy on multi-line words (though unlikely with current CSS)
    if (currentLetterElForScroll) {
      targetTop = currentLetterElForScroll.getBoundingClientRect().top;
    }

    const targetBottom =
      targetTop + (currentWordElForScroll.offsetHeight || 20); // Estimate height if needed

    // Calculate visible boundaries
    const visibleTop = gameRect.top + 5; // Add small buffer
    const visibleBottom = gameRect.bottom - 5; // Add small buffer

    // Calculate line height approximation based on current styles
    const computedStyle = window.getComputedStyle(currentWordElForScroll);
    const fontSize = parseFloat(computedStyle.fontSize);
    const lineHeightMultiplier =
      parseFloat(computedStyle.lineHeight) / fontSize; // Get effective multiplier
    const effectiveLineHeight =
      fontSize * (isNaN(lineHeightMultiplier) ? 1.8 : lineHeightMultiplier); // Use multiplier or fallback

    // Scroll down if the word/letter bottom is past the visible area bottom
    if (targetBottom > visibleBottom) {
      gameEl.scrollTop += effectiveLineHeight;
    }
    // Scroll up if the word/letter top is above the visible area top
    else if (targetTop < visibleTop) {
      gameEl.scrollTop -= effectiveLineHeight;
    }

    // Ensure scrollTop doesn't go negative
    if (gameEl.scrollTop < 0) gameEl.scrollTop = 0;
  }

  // --- Update Cursor ---
  // Use requestAnimationFrame to ensure calculations happen after layout updates
  requestAnimationFrame(updateCursorPosition);
});

newGameBtn.addEventListener("click", newGame);

// --- Initial Setup ---
// Apply saved settings on load (Lines)
applySettings();
// Start the first game
newGame();
