console.log("script loaded");

// =====================================================
// 🔗 WEBHOOK URL
// =====================================================
const WEBHOOK = "https://script.google.com/macros/s/AKfycbyPf0iyeS2A0bzLLhtP1HfINP5qiVCqnozy8AGq6L7JUbto2N4ruHRUy6r9YBEn4N0/exec";

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
// 🛒 CART STATE
// =====================================================
let cart = [];
let total = 0;

// =====================================================
// 📦 INIT EVENTS AFTER DOM LOAD
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

  const tabSelectEl = document.getElementById("existingTabSelect");
  if (tabSelectEl) tabSelectEl.addEventListener("change", toggleNewTabField);

  fetchTabs(); // load existing tabs dynamically
});

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
  const newTabInput = document.getElementById("newTabName");
  const existingTabBlock = document.getElementById("existingTabBlock");
  const existingTabSelect = document.getElementById("existingTabSelect");

  if (itemValue === "TAB_CREATE") {
    newTabBlock.style.display = "block";
    newTabInput.required = true;
    existingTabBlock.style.display = "none";
    existingTabSelect.value = "";
    existingTabSelect.required = false;
  } else if (itemValue === "TAB_ADD") {
    newTabBlock.style.display = "none";
    newTabInput.value = "";
    newTabInput.required = false;
    existingTabBlock.style.display = "block";
    existingTabSelect.required = true;
  } else {
    newTabBlock.style.display = "none";
    newTabInput.value = "";
    newTabInput.required = false;
    existingTabBlock.style.display = "none";
    existingTabSelect.value = "";
    existingTabSelect.required = false;
  }
}

// =====================================================
// 💳 TOGGLE PAYMENT TAB FIELDS
// =====================================================
function toggleTabField() {
  const payment = document.getElementById("payment").value;
  const tabBlock = document.getElementById("tabBlock");
  const newTabBlock = document.getElementById("newTabBlock");
  const tabSelect = document.getElementById("existingTabSelect");
  const newTabField = document.getElementById("newTabName");

  if (payment === "Tab") {
    tabBlock.style.display = "block";
    tabSelect.required = true;
  } else {
    tabBlock.style.display = "none";
    newTabBlock.style.display = "none";
    tabSelect.required = false;
    tabSelect.value = "";
    newTabField.value = "";
  }
}

function toggleNewTabField() {
  const tabSelect = document.getElementById("existingTabSelect").value;
  const newTabBlock = document.getElementById("newTabBlock");
  const newTabField = document.getElementById("newTabName");

  if (tabSelect === "NEW") {
    newTabBlock.style.display = "block";
    newTabField.required = true;
  } else {
    newTabBlock.style.display = "none";
    newTabField.required = false;
    newTabField.value = "";
  }
}

// =====================================================
// 🧾 ADD ITEM TO CART
// =====================================================
function addItem() {
  const employee = document.getElementById("employee").value;
  const buyer = document.getElementById("buyer").value;
  if (!employee || !buyer) return alert("Enter employee and buyer.");

  const itemSelect = document.getElementById("item");
  const itemValue = itemSelect.value;
  const qty = Number(document.getElementById("qty").value);

  let price = Number(itemSelect.selectedOptions[0].dataset.price);
  let lineTotal = 0;
  let name = itemSelect.selectedOptions[0].text;
  let isTabPayment = false;

  if (itemValue === "TAB_CREATE") {
    const amount = Number(document.getElementById("tabPaymentAmount").value);
    const groupName = document.getElementById("newTabName").value.trim();
    if (!amount || !groupName) return alert("Enter amount and group name.");
    price = lineTotal = amount;
    name = groupName;
    isTabPayment = true;
  } else if (itemValue === "TAB_ADD") {
    const amount = Number(document.getElementById("tabPaymentAmount").value);
    const groupName = document.getElementById("existingTabSelect").value;
    if (!amount || !groupName) return alert("Enter amount and select tab.");
    price = lineTotal = amount;
    name = groupName;
    isTabPayment = true;
  } else {
    if (qty <= 0) return alert("Quantity must be at least 1.");
    lineTotal = price * qty;
  }

  total += lineTotal;

  cart.push({
    name,
    qty: isTabPayment ? 1 : qty,
    price,
    lineTotal,
    isTabPayment,
    tabAction: itemValue === "TAB_CREATE" ? "New Tab Deposit" : itemValue === "TAB_ADD" ? "Add Funds to Tab" : ""
  });

  document.getElementById("cart").innerHTML += `<li>${name} = $${lineTotal}</li>`;
  document.getElementById("total").textContent = total;

  if (isTabPayment) document.getElementById("tabPaymentAmount").value = "";

  // After creating new tab, refresh the dropdown
  if (itemValue === "TAB_CREATE") fetchTabs();
}

// =====================================================
// 🏦 SUBMIT ORDER
// =====================================================
async function submitOrder() {
  if (!cart.length) return alert("Cart is empty!");

  const tabChoice = document.getElementById("existingTabSelect")?.value;
  const tabNameFinal = tabChoice === "NEW"
    ? document.getElementById("newTabName").value.trim()
    : tabChoice || (cart.find(c => c.isTabPayment)?.name || "");

  const itemCart = cart.filter(c => !c.isTabPayment);
  const tabCart = cart.filter(c => c.isTabPayment);

  const itemPayload = {
    employee: document.getElementById("employee").value,
    buyer: document.getElementById("buyer").value,
    paymentType: "Item Sale",
    originalPaymentMethod: document.getElementById("payment").value || "Cash",
    tabName: "",
    cart: itemCart,
    total: itemCart.reduce((a, b) => a + b.lineTotal, 0)
  };

  const tabPayload = {
    employee: document.getElementById("employee").value,
    buyer: document.getElementById("buyer").value,
    paymentType: "Tab",
    originalPaymentMethod: document.getElementById("payment").value || "Cash",
    tabName: tabNameFinal,
    cart: tabCart,
    total: tabCart.reduce((a, b) => a + b.lineTotal, 0)
  };

  try {
    if (itemCart.length) await fetch(WEBHOOK, { method: "POST", mode: "no-cors", body: JSON.stringify(itemPayload), headers: { "Content-Type": "text/plain;charset=utf-8" } });
    if (tabCart.length) await fetch(WEBHOOK, { method: "POST", mode: "no-cors", body: JSON.stringify(tabPayload), headers: { "Content-Type": "text/plain;charset=utf-8" } });
    alert("Order submitted!");
  } catch (err) { console.error("Submit failed:", err); alert("Submit FAILED"); }

  cart = [];
  total = 0;
  document.getElementById("cart").innerHTML = "";
  document.getElementById("total").textContent = "0";

  // Refresh tabs after submission
  fetchTabs();
}

// =====================================================
// 🌐 FETCH EXISTING TABS
// =====================================================
async function fetchTabs() {
  try {
    const resp = await fetch(WEBHOOK + "?action=getTabs");
    const data = await resp.json();
    const existingTabSelect = document.getElementById("existingTabSelect");
    if (!existingTabSelect || !Array.isArray(data)) return;

    existingTabSelect.innerHTML = '<option value="">Select Tab</option>';
    data.forEach(tabName => {
      const opt = document.createElement("option");
      opt.value = tabName;
      opt.textContent = tabName;
      existingTabSelect.appendChild(opt);
    });
  } catch (err) {
    console.error("Failed to fetch tabs:", err);
  }
}
