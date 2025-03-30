document.addEventListener("DOMContentLoaded", () => {
  const darkModeToggle = document.getElementById("darkModeToggle");
  const body = document.body;
  // Function to apply theme based on stored preference or system preference
  const applyTheme = (theme) => {
    if (theme === "dark") {
      body.classList.add("dark-mode");
    } else {
      body.classList.remove("dark-mode");
    }
  };

  // Load saved theme preference
  chrome.storage.sync.get("theme", (data) => {
    const savedTheme = data.theme;
    if (savedTheme) {
      applyTheme(savedTheme);
    } else {
      // Optional: Check system preference if no theme is saved
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      applyTheme(prefersDark ? "dark" : "light");
    }
  });

  // Toggle theme on button click
  darkModeToggle.addEventListener("click", () => {
    const isDarkMode = body.classList.toggle("dark-mode");
    const newTheme = isDarkMode ? "dark" : "light";
    // Save the new theme preference
    chrome.storage.sync.set({ theme: newTheme });
  });

  // Ensure game gets focus when popup opens (might need slight delay)
  setTimeout(() => {
    const gameArea = document.getElementById("game");
    if (gameArea) {
      gameArea.focus();
    }
  }, 100); // Small delay to ensure elements are fully rendered

  // Optional: Refocus game area if user clicks outside and then back into the popup window
  window.addEventListener("focus", () => {
    const gameArea = document.getElementById("game");
    // Only refocus if the game isn't already over
    if (
      gameArea &&
      !gameArea.classList.contains("over") &&
      document.activeElement !== gameArea
    ) {
      gameArea.focus();
    }
  });

  loadGameTime();

  // Listen for messages from typing.js
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.message === "updateTime") {
      const newTime = parseInt(request.time);
      gameTime = newTime;
      if (!gameActive) {
        remainingTime = newTime;
      }
      localStorage.setItem("gameTime", newTime);
    }

    if (request.message === "updateWPM") {
      const lastWPM = request.lastWPM;
      const highScore = request.highScore;

      // Update the popup with the WPM values
      document.getElementById("lastWPM").textContent = `Last WPM: ${lastWPM}`;
      document.getElementById(
        "highScore"
      ).textContent = `High Score: ${highScore}`;
    }
  });

  // Load last WPM and high score from local storage on popup load
  const lastWPM = localStorage.getItem("lastWPM") || "--";
  const highScore = localStorage.getItem("highScore") || "--";

  // Update the popup with the WPM values
  document.getElementById("lastWPM").textContent = `Last WPM: ${lastWPM}`;
  document.getElementById("highScore").textContent = `High Score: ${highScore}`;

  // Get references to the elements
  const infoDiv = document.getElementById("info");
  const timeSliderContainer = document.getElementById("timeSliderContainer");
  const timeSlider = document.getElementById("timeSlider");
  const timeSliderValue = document.getElementById("timeSliderValue");

  // Function to update the displayed time value
  function updateTimeValue(value) {
    if (value == 120) {
      infoDiv.textContent = value + "s+";
    } else {
      infoDiv.textContent = value + "s";
    }
  }

  // Initially set the time value
  gameTime = localStorage.getItem("gameTime") || 10; // Default to 10 seconds
  timeSlider.value = gameTime;
  updateTimeValue(gameTime);

  // Add event listener to the info div to toggle the slider's visibility
  infoDiv.addEventListener("click", () => {
    timeSliderContainer.style.display =
      timeSliderContainer.style.display === "none" ? "block" : "none";
  });

  // Add event listener to the slider to update the displayed value and send the value to typing.js
  timeSlider.addEventListener("input", (e) => {
    const newTime = parseInt(e.target.value);
    updateTimeValue(newTime); // Update the displayed value immediately
    sendTimeValue(newTime); // Send the updated time to typing.js
    localStorage.setItem("gameTime", newTime); // Save to local storage
  });

  // Function to send the time value to typing.js
  function sendTimeValue(value) {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      if (tabs.length > 0) {
        chrome.tabs.sendMessage(
          tabs[0].id,
          {
            message: "updateTime",
            time: value,
          },
          function (response) {
            if (chrome.runtime.lastError) {
              const errorMessage = chrome.runtime.lastError.message;
              if (
                errorMessage.includes(
                  "Could not establish connection. Receiving end does not exist."
                )
              ) {
                console.error(
                  "Content script not found in the active tab. Ensure the content script is injected and the page is loaded."
                );
                // Optionally, you could display a message to the user here
              } else {
                console.error("Error sending message to tab:", errorMessage);
              }
            } else if (response && response.success) {
              console.log("Message sent successfully to tab.");
            } else {
              console.error("Tab did not respond to message.");
            }
          }
        );
      } else {
        console.error("No active tabs found.");
      }
    });
  }
});
