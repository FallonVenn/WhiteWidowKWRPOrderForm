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

    if (!Array.isArray(data)) return;

    // payment dropdown
    populatePaymentTabs(data);

    // existing tab dropdown (TAB_ADD)
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

  if (!qtyField) return;

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

  if (!newTabBlock || !existingTabBlock) return;

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
  if (tabBlock) {
    tabBlock.style.display = payment === "Tab" ? "block" : "none";
  }
}

// =====================================================
// 🧾 ADD ITEM TO CART (REAL VERSION)
// =====================================================
function addItem() {
  const category = document.getElementById("category").value;
  const itemEl = document.getElementById("item");
  const itemName = itemEl.value;
  const price = Number(itemEl.selectedOptions[0]?.dataset.price || 0);

  const qty = Number(document.getElementById("qty")?.value || 1);
  const tabAmount = Number(document.getElementById("tabPaymentAmount")?.value || 0);
  const newTabName = document.getElementById("newTabName")?.value || "";
  const existingTab = document.getElementById("existingTabSelect")?.value || "";

  if (!itemName) {
    alert("Select an item first.");
    return;
  }

  // =============================
  // TAB CREATE
  // =============================
  if (itemName === "TAB_CREATE") {
    if (!newTabName) {
      alert("Enter new tab name.");
      return;
    }

    if (!tabAmount || tabAmount <= 0) {
      alert("Enter deposit amount.");
      return;
    }

    cart.push({
      type: "TAB_CREATE",
      name: newTabName,
      amount: tabAmount
    });

    total += tabAmount;
  }

  // =============================
  // TAB ADD
  // =============================
  else if (itemName === "TAB_ADD") {
    if (!existingTab) {
      alert("Select existing tab.");
      return;
    }

    if (!tabAmount || tabAmount <= 0) {
      alert("Enter amount.");
      return;
    }

    cart.push({
      type: "TAB_ADD",
      name: existingTab,
      amount: tabAmount
    });

    total += tabAmount;
  }

  // =============================
  // NORMAL ITEM
  // =============================
  else {
    if (!qty || qty <= 0) {
      alert("Enter quantity.");
      return;
    }

    const lineTotal = price * qty;

    cart.push({
      type: "ITEM",
      name: itemName,
      price,
      qty,
      lineTotal
    });

    total += lineTotal;
  }

  renderCart();
}

// =====================================================
// 🧾 RENDER CART (VISIBLE LIST)
// =====================================================
function renderCart() {
  const cartEl = document.getElementById("cart");
  const totalEl = document.getElementById("total");

  if (!cartEl) {
    console.error("Cart element not found (id='cart')");
    return;
  }

  cartEl.innerHTML = "";

  cart.forEach((item, index) => {
    const li = document.createElement("li");
    li.textContent = `${item.name} x${item.qty} - $${item.price}`;
    cartEl.appendChild(li);
  });

  if (totalEl) {
    totalEl.textContent = total;
  }
}

// =====================================================
// 🧾 ADD ITEM TO CART
// =====================================================
function addItem() {
  const category = document.getElementById("category").value;
  const itemSelect = document.getElementById("item");
  const qtyField = document.getElementById("qty");
  const tabAmountField = document.getElementById("tabPaymentAmount");

  if (!itemSelect.value) {
    alert("Select an item first.");
    return;
  }

  const itemName = itemSelect.value;
  let qty = Number(qtyField.value) || 1;
  let price = Number(itemSelect.selectedOptions[0].dataset.price) || 0;

  // TAB actions use dollar amount instead
  if (itemName === "TAB_CREATE" || itemName === "TAB_ADD") {
    const amount = Number(tabAmountField.value);

    if (!amount || amount <= 0) {
      alert("Enter a valid tab amount.");
      return;
    }

    qty = 1;
    price = amount;
  }

  const lineTotal = price * qty;

  cart.push({
    name: itemName,
    qty: qty,
    price: lineTotal
  });

  total += lineTotal;

  console.log("Cart now:", cart);

  renderCart();
}

// =====================================================
// 🏦 SUBMIT ORDER
// =====================================================
function submitOrder() {
  if (cart.length === 0) {
    alert("Cart is empty.");
    return;
  }

  const employee = document.getElementById("employee")?.value || "";
  const buyer = document.getElementById("buyer")?.value || "";
  const payment = document.getElementById("payment")?.value || "";
  const tabName = document.getElementById("tabSelect")?.value || "";
  const timestamp = new Date().toISOString();

  // ============================
  // Build readable order summary
  // ============================
  const readableSummary = cart
    .map(item => `${item.name} x${item.qty} - $${item.price}`)
    .join(" | ");

  const orderJSON = JSON.stringify(cart);

  const payload = {
    timestamp: timestamp,
    employee: employee,
    buyer: buyer,
    payment: payment,
    tabName: tabName,
    orderSummary: readableSummary,
    orderJSON: orderJSON,
    total: total
  };

  console.log("Submitting payload:", payload);

  // =====================================================
  // SEND TO GOOGLE SCRIPT (IMPORTANT)
  // =====================================================
  fetch(WEBHOOK, {
    method: "POST",
    body: JSON.stringify(payload),
    headers: {
      "Content-Type": "application/json"
    }
  })
    .then(res => res.text())
    .then(data => {
      console.log("Webhook response:", data);
      alert("Order submitted.");

      // reset cart
      cart = [];
      total = 0;
      renderCart();
    })
    .catch(err => {
      console.error("Submit failed:", err);
      alert("Submit failed. Check console.");
    });
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
