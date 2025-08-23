if (!window.__instahyreCollector) {
  window.__instahyreCollector = {
    running: false,
    applicationCount: 0,
    skillFrequency: {}
  };
}

let state = window.__instahyreCollector;

function extractSkillsAndClickNext() {
  if (!state.running) return;

  const skillElements = document.querySelectorAll('#job-skills-description li');

  if (skillElements.length > 0) {
    skillElements.forEach(el => {
      const skill = el.innerText.trim();
      if (skill) {
        state.skillFrequency[skill] = (state.skillFrequency[skill] || 0) + 1;
      }
    });
    state.applicationCount++;
  }

  chrome.storage.local.set({
    applicationCount: state.applicationCount,
    skillFrequency: state.skillFrequency
  });

  const applyButton = document.querySelector('.btn.btn-lg.btn-primary.new-btn');
  if (applyButton) {
    applyButton.click();
    setTimeout(extractSkillsAndClickNext, 1500); // small delay
  } else {
    state.running = false;
    chrome.storage.local.set({ isRunning: false });
  }
}

function startSkillCollector() {
  if (state.running) return;
  state.running = true;
  chrome.storage.local.set({ isRunning: true });
  extractSkillsAndClickNext();
}

function stopSkillCollector() {
  state.running = false;
  chrome.storage.local.set({ isRunning: false });
}

function resetCollector() {
  state.running = false;
  state.applicationCount = 0;
  state.skillFrequency = {};
  chrome.storage.local.set({
    isRunning: false,
    applicationCount: 0,
    skillFrequency: {}
  });
}

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === "START") startSkillCollector();
  if (msg.type === "STOP") stopSkillCollector();
  if (msg.type === "RESET") resetCollector();
});
