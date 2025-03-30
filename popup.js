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
});
