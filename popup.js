document.addEventListener("DOMContentLoaded", () => {
  const darkModeToggle = document.getElementById("darkModeToggle");
  const body = document.body;

  // --- Theme Handling ---
  const applyTheme = (theme) => {
    if (theme === "dark") {
      body.classList.add("dark-mode");
    } else {
      body.classList.remove("dark-mode");
    }
    // Save the applied theme
    chrome.storage.sync.set({ theme: theme });
  };

  // Load initial theme
  chrome.storage.sync.get("theme", (data) => {
    const savedTheme = data.theme;
    if (savedTheme) {
      applyTheme(savedTheme);
    } else {
      // Check system preference if no theme saved
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      applyTheme(prefersDark ? "dark" : "light");
    }
  });

  // Theme toggle button listener
  darkModeToggle.addEventListener("click", () => {
    const isDarkMode = body.classList.toggle("dark-mode");
    const newTheme = isDarkMode ? "dark" : "light";
    applyTheme(newTheme); // Apply and save
  });

  // --- Game Focus ---

  // --- WPM Display ---
  const lastWPM = localStorage.getItem("lastWPM") || "--";
  const highScore = localStorage.getItem("highScore") || "--";
  document.getElementById("lastWPM").textContent = `Last WPM: ${lastWPM}`;
  document.getElementById("highScore").textContent = `High Score: ${highScore}`;

  // --- Message Listener (REMOVED - typing.js updates DOM directly now) ---
  // chrome.runtime.onMessage.addListener((request, sender, sendResponse) => { ... });

  // --- Generic Function to Send Message (REMOVED - Using direct calls now) ---
  // function sendMessageToContentScript(messagePayload) { ... }

  // --- Slider Setup Function ---
  function setupSlider(
    infoId,
    sliderContainerId,
    sliderId,
    storageKey,
    messageType,
    valueFormatter,
    defaultValue
  ) {
    const infoDiv = document.getElementById(infoId);
    const sliderContainer = document.getElementById(sliderContainerId);
    const slider = document.getElementById(sliderId);
    const allSliderContainers = document.querySelectorAll(".slider-container"); // Get all containers

    // Function to update the display text
    function updateValueDisplay(value) {
      infoDiv.textContent = valueFormatter(value);
    }

    // Load saved setting or use default
    function loadSetting() {
      const savedValue = localStorage.getItem(storageKey) || defaultValue;
      slider.value = savedValue;
      updateValueDisplay(savedValue);
      // Send initial value in case content script missed it (optional, typing.js loads its own)
      // sendMessageToContentScript({ message: messageType, [storageKey.replace('game', '').toLowerCase()]: savedValue });
    }

    // Click listener for the info display (toggle slider visibility)
    infoDiv.addEventListener("click", () => {
      const isVisible = sliderContainer.style.display === "block";
      // Hide all sliders first
      allSliderContainers.forEach(
        (container) => (container.style.display = "none")
      );
      // Then show the target slider if it was hidden
      sliderContainer.style.display = isVisible ? "none" : "flex"; // Use flex for inline display
    });
    // Input listener for the slider
    slider.addEventListener("input", (e) => {
      const newValue = e.target.value;
      updateValueDisplay(newValue);
      localStorage.setItem(storageKey, newValue);
      // Call the global function in typing.js directly
      const settingKey = storageKey.replace("game", "").toLowerCase(); // e.g., 'time', 'lines', 'wpl'
      if (window.updateGameSetting) {
        window.updateGameSetting(settingKey, newValue);
      } else {
        console.error(
          "typing.js or updateGameSetting function not loaded yet."
        );
      }
    });

    // Close slider if clicking outside
    document.addEventListener("click", (event) => {
      if (
        !sliderContainer.contains(event.target) &&
        !infoDiv.contains(event.target)
      ) {
        sliderContainer.style.display = "none";
      }
    });
    // Initial load
    loadSetting();
  }

  // --- Initialize Sliders ---
  setupSlider(
    "info",
    "timeSliderContainer",
    "timeSlider",
    "gameTime",
    "updateTime",
    (value) => (value == 120 ? value + "s+" : value + "s"), // Formatter for time
    10 // Default value
  );

  setupSlider(
    "linesInfo",
    "linesSliderContainer",
    "linesSlider",
    "gameLines",
    "updateLines",
    (value) => `${value} line${value > 1 ? "s" : ""}`, // Formatter for lines
    4 // Default value
  );

  setupSlider(
    // *** NEW WPL Slider ***
    "wplInfo",
    "wplSliderContainer",
    "wplSlider",
    "gameWPL",
    "updateWPL",
    (value) => `${value} wpl`, // Formatter for WPL
    10 // Default value
  );
});
