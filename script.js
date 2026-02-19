console.log("script loaded");

// =====================================================
// 🔗 WEBHOOK URL
// =====================================================
const WEBHOOK = "https://script.google.com/macros/s/AKfycbxkbgEVWUOn2Fs5Ck954jtYTrfAy12POIPCNTqAYDZRCYgRazhcqlEqH7eEhRkDsMqJ/exec";

// =====================================================
// 🗄 ITEM DATABASE
// =====================================================
const ITEM_DB = {
  BAGS: [
    ["Skunk Bag", 1500],
    ["OG Kush Bag", 1500],
    ["White Widow Bag", 1500],
    ["AK-47 Bag", 1500],
    ["Amnesia Bag", 1500],
    ["Purple Haze Bag", 1500],
    ["Gelato Bag", 1500],
    ["Zkittles Bag", 1500]
  ],
  JOINTS: [
    ["Skunk Joint", 1800],
    ["OG Kush Joint", 1800],
    ["White Widow Joint", 1800],
    ["AK-47 Joint", 1800],
    ["Amnesia Joint", 1800],
    ["Purple Haze Joint", 1800],
    ["Gelato Joint", 1800],
    ["Zkittles Joint", 1800]
  ],
  EDIBLES: [
    ["Raspberry Gummy Bears", 2000],
    ["Strawberry Gummy Bears", 2000],
    ["AK-47 Cookies", 2000],
    ["Skunk Cookies", 2000],
    ["White Widow Cookies", 2000]
  ],
  TAB: [
    ["TAB_CREATE", 0, "Create New Tab (Deposit)"],
    ["TAB_ADD", 0, "Add Funds to Existing Tab"]
  ]
};

// =====================================================
// CART STATE
// =====================================================
let cart = [];
let total = 0;

// =====================================================
// INIT EVENTS
// =====================================================
document.addEventListener("DOMContentLoaded", () => {
  const categoryEl = document.getElementById("category");
  if (categoryEl) categoryEl.addEventListener("change", populateItems);

  const itemEl = document.getElementById("item");
  if (itemEl) itemEl.addEventListener("change", () => {
    toggleTabPaymentItem();
    toggleTabNameField();
  });

  const paymentEl = document.getElementById("payment");
  if (paymentEl) paymentEl.addEventListener("change", toggleTabField);

  fetchTabs();
});

// =====================================================
// 🌐 FETCH EXISTING TABS
// =====================================================
async function fetchTabs() {
  try {
    console.log("Fetching tabs...");

    const resp = await fetch(WEBHOOK + "?action=getTabs");
    const data = await resp.json();

    console.log("Tabs received:", data);

    if (!Array.isArray(data)) {
      console.warn("Tabs response not array:", data);
      return;
    }

    // Populate TAB_ADD dropdown
    const existingTabSelect = document.getElementById("existingTabSelect");
    if (existingTabSelect) {
      existingTabSelect.innerHTML = '<option value="">Select Tab</option>';
      data.forEach(tabName => {
        const opt = document.createElement("option");
        opt.value = tabName;
        opt.textContent = tabName;
        existingTabSelect.appendChild(opt);
      });
    }

    // Populate PAYMENT dropdown (NO NEW OPTION)
    populatePaymentTabs(data);

  } catch (err) {
    console.error("Failed to fetch tabs:", err);
  }
}

// =====================================================
// 💳 POPULATE PAYMENT TAB DROPDOWN
// =====================================================
function populatePaymentTabs(tabNames) {
  const paymentSelect = document.getElementById("tabSelect");
  if (!paymentSelect) return;

  paymentSelect.innerHTML = '<option value="">Select Tab</option>';

  tabNames.forEach(name => {
    const opt = document.createElement("option");
    opt.value = name;
    opt.textContent = name;
    paymentSelect.appendChild(opt);
  });
}

// =====================================================
// 📦 POPULATE ITEMS
// =====================================================
function populateItems() {
  const categoryEl = document.getElementById("category");
  const itemSelect = document.getElementById("item");
  if (!categoryEl || !itemSelect) return;

  const category = categoryEl.value;
  itemSelect.innerHTML = '<option value="">Select item</option>';

  if (!category || !ITEM_DB[category]) return;

  ITEM_DB[category].forEach(entry => {
    const option = document.createElement("option");
    option.value = entry[0];
    option.dataset.price = Number(entry[1]);

    if (category === "TAB") {
      option.textContent = entry[2];
    } else if (category === "BAGS") {
      option.textContent = `${entry[0]} - $${entry[1]} per bag`;
    } else if (category === "JOINTS") {
      option.textContent = `${entry[0]} - $${entry[1]} per joint`;
    } else if (category === "EDIBLES") {
      option.textContent = `${entry[0]} - $${entry[1]} each`;
    }

    itemSelect.appendChild(option);
  });

  toggleTabPaymentItem();
}

// =====================================================
// 💳 TAB PAYMENTS INPUT
// =====================================================
function toggleTabPaymentItem() {
  const itemValue = document.getElementById("item").value;
  const qtyField = document.getElementById("qty");
  const qtyLabel = document.getElementById("qtyLabel");
  const tabAmountField = document.getElementById("tabPaymentAmount");
  const tabAmountLabel = document.getElementById("tabAmountLabel");

  if (itemValue === "TAB_CREATE" || itemValue === "TAB_ADD") {
    qtyField.style.display = "none";
    qtyLabel.style.display = "none";
    qtyField.value = 1;

    tabAmountField.style.display = "inline-block";
    tabAmountLabel.style.display = "inline-block";
    tabAmountField.required = true;
  } else {
    qtyField.style.display = "inline-block";
    qtyLabel.style.display = "inline-block";

    tabAmountField.style.display = "none";
    tabAmountLabel.style.display = "none";
    tabAmountField.required = false;
    tabAmountField.value = "";
  }
}

// =====================================================
// 💳 TAB NAME INPUT/DROPDOWN
// =====================================================
function toggleTabNameField() {
  const itemValue = document.getElementById("item").value;
  const newTabBlock = document.getElementById("newTabBlock");
  const existingTabBlock = document.getElementById("existingTabBlock");

  if (itemValue === "TAB_CREATE") {
    newTabBlock.style.display = "block";
    existingTabBlock.style.display = "none";
  } else if (itemValue === "TAB_ADD") {
    newTabBlock.style.display = "none";
    existingTabBlock.style.display = "block";
  } else {
    newTabBlock.style.display = "none";
    existingTabBlock.style.display = "none";
  }
}

// =====================================================
// 💳 TOGGLE PAYMENT TAB FIELD
// =====================================================
function toggleTabField() {
  const payment = document.getElementById("payment").value;
  const tabBlock = document.getElementById("tabBlock");

  tabBlock.style.display = payment === "Tab" ? "block" : "none";
}

// =====================================================
// 🧾 ADD ITEM TO CART
// =====================================================
function addItem() {
  alert("AddItem wired correctly.");
}

// =====================================================
// 🏦 SUBMIT ORDER
// =====================================================
function submitOrder() {
  alert("SubmitOrder wired correctly.");
}

// =====================================================
// 🌍 EXPOSE FUNCTIONS TO HTML
// =====================================================
window.addItem = addItem;
window.submitOrder = submitOrder;
window.populateItems = populateItems;
window.toggleTabField = toggleTabField;
window.toggleTabNameField = toggleTabNameField;
window.toggleTabPaymentItem = toggleTabPaymentItem;
