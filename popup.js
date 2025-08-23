const toggleBtn = document.getElementById("startBtn");
const resetBtn = document.getElementById("resetBtn");
const appsDoneEl = document.getElementById("applicationsDone");
const skillsTableBody = document.getElementById("skillsTableBody");
const themeSwitch = document.getElementById("themeSwitch");


let isRunning = false;

function sendMessageToContent(message) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs[0]?.id) return;

    chrome.tabs.sendMessage(tabs[0].id, message, (response) => {
      if (chrome.runtime.lastError) {
        // Try injecting content.js and then retry
        chrome.scripting.executeScript(
          { target: { tabId: tabs[0].id }, files: ["content.js"] },
          () => {
            chrome.tabs.sendMessage(tabs[0].id, message);
          }
        );
      }
    });
  });
}



// Toggle Start/Stop
if (toggleBtn) {
  toggleBtn.addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tabId = tabs[0].id;
      sendMessageToContent({ type: isRunning ? "STOP" : "START" });
      isRunning = !isRunning;
      chrome.storage.local.set({ isRunning });
      toggleBtn.textContent = isRunning ? "Stop" : "Start";
    });
  });
}

// Reset
if (resetBtn) {
  resetBtn.addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tabId = tabs[0].id;
      sendMessageToContent({ type: "RESET" });
      chrome.storage.local.set({ isRunning: false });
      isRunning = false;
      toggleBtn.textContent = "Start";
      appsDoneEl.textContent = 0;
      skillsTableBody.innerHTML = "";
    });
  });
}

// Update UI
function renderStats({ applicationCount, skillFrequency }) {
  appsDoneEl.textContent = applicationCount || 0;

  skillsTableBody.innerHTML = "";
  if (skillFrequency) {
    const sortedSkills = Object.entries(skillFrequency)
      .sort((a, b) => b[1] - a[1]); // sort by count desc
    sortedSkills.forEach(([skill, count]) => {
      const row = document.createElement("tr");
      row.innerHTML = `<td>${skill}</td><td>${count}</td>`;
      skillsTableBody.appendChild(row);
    });
  }
}

// Load state on popup open
chrome.storage.local.get(["isRunning", "applicationCount", "skillFrequency"], (res) => {
  isRunning = res.isRunning || false;
  toggleBtn.textContent = isRunning ? "Stop" : "Start";
  renderStats(res);
});

// Listen for live updates
chrome.storage.onChanged.addListener((changes) => {
  chrome.storage.local.get(["isRunning", "applicationCount", "skillFrequency"], renderStats);
});

// Dark Mode toggle
chrome.storage.local.get("darkMode", (res) => {
  if (res.darkMode) {
    document.body.classList.add("dark");
    themeSwitch.checked = true;
  }
});

themeSwitch.addEventListener("change", () => {
  document.body.classList.toggle("dark");
  chrome.storage.local.set({ darkMode: themeSwitch.checked });
});

// === Theme toggle logic ===
document.addEventListener("DOMContentLoaded", () => {
  const switchEl = document.getElementById("themeSwitch");
  const labelEl = document.getElementById("themeLabel");

  // Restore saved theme
  chrome.storage.local.get("theme", (res) => {
    if (res.theme === "dark") {
      document.body.classList.add("dark");
      switchEl.checked = true;
      labelEl.textContent = "Dark";
    } else {
      labelEl.textContent = "Light";
    }
  });

  // Handle toggle
  switchEl.addEventListener("change", () => {
    if (switchEl.checked) {
      document.body.classList.add("dark");
      labelEl.textContent = "Dark";
      chrome.storage.local.set({ theme: "dark" });
    } else {
      document.body.classList.remove("dark");
      labelEl.textContent = "Light";
      chrome.storage.local.set({ theme: "light" });
    }
  });
});
