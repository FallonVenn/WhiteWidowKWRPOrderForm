// =====================================================
// 🧾 POPULATE EXISTING TABS DROPDOWN
// =====================================================
function populateExistingTabs() {
  const existingTabSelect = document.getElementById("existingTabSelect");
  if (!existingTabSelect) return;

  existingTabSelect.innerHTML = '<option value="">Select Tab</option>';

  fetch("https://script.google.com/macros/s/AKfycbw2Ct4MIdj_JtnmkpyNu4-y39sBlL7oZaBwAwmZAC__PJ50dT8fdOdNqcY4Inko-37Y/exec") // replace with deployed doGet URL
    .then(res => res.json())
    .then(tabs => {
      tabs.forEach(tab => {
        const opt = document.createElement("option");
        opt.value = tab;
        opt.textContent = tab;
        existingTabSelect.appendChild(opt);
      });
    })
    .catch(err => console.error("Failed to fetch existing tabs:", err));
}

// =====================================================
// 💳 TOGGLE TAB NAME INPUT/DROPDOWN BASED ON TAB ITEM
// =====================================================
function toggleTabNameField() {
  const itemValue = document.getElementById("item").value;
  const newTabBlock = document.getElementById("newTabBlock");
  const newTabInput = document.getElementById("newTabName");
  const existingTabBlock = document.getElementById("existingTabBlock");
  const existingTabSelect = document.getElementById("existingTabSelect");

  if (itemValue === "TAB_CREATE") {
    newTabBlock.style.display = "block";
    newTabInput.required = true;
    if (existingTabBlock) {
      existingTabBlock.style.display = "none";
      existingTabSelect.value = "";
      existingTabSelect.required = false;
    }
  } else if (itemValue === "TAB_ADD") {
    if (newTabBlock) {
      newTabBlock.style.display = "none";
      newTabInput.value = "";
      newTabInput.required = false;
    }
    if (existingTabBlock) {
      existingTabBlock.style.display = "block";
      existingTabSelect.required = true;
      populateExistingTabs(); // <-- dynamically fill dropdown
    }
  } else {
    if (newTabBlock) {
      newTabBlock.style.display = "none";
      newTabInput.value = "";
      newTabInput.required = false;
    }
    if (existingTabBlock) {
      existingTabBlock.style.display = "none";
      existingTabSelect.value = "";
      existingTabSelect.required = false;
    }
  }
}
