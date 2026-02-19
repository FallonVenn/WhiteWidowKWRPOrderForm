console.log("script loaded");

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
// 📦 POPULATE ITEMS (CATEGORY → ITEM)
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
    option.dataset.price = Number(entry[1]); // ensure numeric

    if (category === "TAB") {
      option.textContent = entry[2]; // custom label
    } else {
      option.textContent = `${entry[0]} - $${entry[1]} per`;
    }

    itemSelect.appendChild(option);
  });

  toggleTabPaymentItem();
}

// =====================================================
// 💳 TOGGLE TAB PAYMENT INPUT
// =====================================================
function toggleTabPaymentItem() {
  const itemValue = document.getElementById("item").value;
  const qtyField = document.getElementById("qty");
  const qtyLabel = document.getElementById("qtyLabel");
  const tabAmountField = document.getElementById("tabPaymentAmount");
  const tabAmountLabel = document.getElementById("tabAmountLabel");

  if (itemValue === "TAB_CREATE" || itemValue === "TAB_ADD") {
    // hide qty, show amount to add
    qtyField.style.display = "none";
    qtyLabel.style.display = "none";
    qtyField.value = 1;

    tabAmountField.style.display = "inline-block";
    tabAmountLabel.style.display = "inline-block";
    tabAmountField.required = true;
  } else {
    // show qty, hide amount
    qtyField.style.display = "inline-block";
    qtyLabel.style.display = "inline-block";

    tabAmountField.style.display = "none";
    tabAmountLabel.style.display = "none";
    tabAmountField.required = false;
    tabAmountField.value = "";
  }
}

// =====================================================
// 🧾 ADD ITEM TO CART
// =====================================================
function addItem() {
  const employee = document.getElementById("employee").value;
  const buyer = document.getElementById("buyer").value;

  if (!employee) {
    alert("Select an employee before adding items.");
    return;
  }
  if (!buyer) {
    alert("Enter buyer name before adding items.");
    return;
  }

  const itemSelect = document.getElementById("item");
  const category = document.getElementById("category").value;
  const itemValue = itemSelect.value;
  const itemText = itemSelect.selectedOptions[0].text;
  const qty = Number(document.getElementById("qty").value);

  let price = Number(itemSelect.selectedOptions[0].dataset.price);
  let lineTotal = 0;
  let name = itemText;
  let isTabPayment = false;

  // TAB ACTIONS
  if (itemValue === "TAB_CREATE" || itemValue === "TAB_ADD") {
    const amount = Number(document.getElementById("tabPaymentAmount").value);
    if (!amount || amount <= 0) {
      alert("Enter amount to add to tab.");
      return;
    }
    price = amount;
    lineTotal = amount;
    name = itemValue === "TAB_CREATE" ? "New Tab Deposit" : "Add Funds to Tab";
    isTabPayment = true;
  } else {
    if (qty <= 0) {
      alert("Quantity must be at least 1.");
      return;
    }
    lineTotal = price * qty;
  }

  total += lineTotal;

  cart.push({
    name,
    qty: isTabPayment ? 1 : qty,
    price,
    lineTotal,
    isTabPayment
  });

  document.getElementById("cart").innerHTML += `<li>${name} = $${lineTotal}</li>`;
  document.getElementById("total").textContent = total;

  if (isTabPayment) {
    document.getElementById("tabPaymentAmount").value = "";
  }
}

// =====================================================
// 🏦 SUBMIT ORDER
// =====================================================
async function submitOrder() {
  if (cart.length === 0) {
    alert("Cart is empty!");
    return;
  }

  // Determine tab name if needed
  let tabNameFinal = "";
  if (document.getElementById("payment").value === "Tab") {
    const tabChoice = document.getElementById("tabSelect").value;
    if (tabChoice === "NEW") {
      tabNameFinal = document.getElementById("newTabName").value.trim();
      if (!tabNameFinal) {
        alert("Enter new tab name.");
        return;
      }
    } else {
      tabNameFinal = tabChoice;
    }
  } else {
    // fallback: for tab actions, still send to Tab Log
    const tabItem = cart.find(c => c.isTabPayment);
    if (tabItem) tabNameFinal = tabItem.name;
  }

  // split cart
  const itemCart = cart.filter(c => !c.isTabPayment);
  const tabCart = cart.filter(c => c.isTabPayment);

  // payloads
  const itemPayload = {
    employee: document.getElementById("employee").value,
    buyer: document.getElementById("buyer").value,
    paymentType: "Item Sale", // routing only
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
    if (itemCart.length > 0) {
      await fetch(WEBHOOK, {
        method: "POST",
        mode: "no-cors",
        body: JSON.stringify(itemPayload),
        headers: { "Content-Type": "text/plain;charset=utf-8" }
      });
    }

    if (tabCart.length > 0) {
      await fetch(WEBHOOK, {
        method: "POST",
        mode: "no-cors",
        body: JSON.stringify(tabPayload),
        headers: { "Content-Type": "text/plain;charset=utf-8" }
      });
    }

    alert("Order submitted!");
  } catch (err) {
    console.error("Submit failed:", err);
    alert("Submit FAILED - check console (F12)");
  }

  // reset cart
  cart = [];
  total = 0;
  document.getElementById("cart").innerHTML = "";
  document.getElementById("total").textContent = "0";
}
