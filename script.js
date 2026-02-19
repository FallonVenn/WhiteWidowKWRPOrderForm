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

const WEBHOOK = "https://script.google.com/macros/s/AKfycbzeLu0a62QSi7bvM2Ir_rTlgeRR-tQI3PN9vgftC_g8Tbeu0ZZvgEjvlXF8I09uXXig/exec";

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
    } else {
      option.textContent = `${entry[0]} - $${entry[1]}`;
    }

    itemSelect.appendChild(option);
  });

  toggleTabPaymentItem();
}

// =====================================================
// 🔄 TOGGLE TAB AMOUNT UI
// =====================================================
function toggleTabPaymentItem() {
  const itemValue = document.getElementById("item").value;

  const qtyField = document.getElementById("qty");
  const qtyLabel = document.getElementById("qtyLabel");
  const tabAmountField = document.getElementById("tabPaymentAmount");
  const tabAmountLabel = document.getElementById("tabAmountLabel");

  // 🔥 Updated condition for new TAB options
  if (itemValue === "TAB_CREATE" || itemValue === "TAB_ADD") {
    // hide qty
    qtyField.style.display = "none";
    qtyLabel.style.display = "none";
    qtyField.value = 1;

    // show tab amount
    tabAmountField.style.display = "inline-block";
    tabAmountLabel.style.display = "inline-block";
    tabAmountField.required = true;
  } else {
    // show qty
    qtyField.style.display = "inline-block";
    qtyLabel.style.display = "inline-block";

    // hide tab amount
    tabAmountField.style.display = "none";
    tabAmountLabel.style.display = "none";
    tabAmountField.required = false;
    tabAmountField.value = "";
  }
}

// =====================================================
// ➕ ADD ITEM
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
  const option = itemSelect.selectedOptions[0];

  if (!option) {
    alert("Select an item first.");
    return;
  }

  const itemValue = option.value;
  const price = Number(option.dataset.price);

  if (isNaN(price)) {
    alert("Price error.");
    return;
  }

  let qty = Number(document.getElementById("qty").value) || 1;
  let lineTotal = 0;
  let name = option.textContent;
  let isTabAction = false;

  // TAB actions
  if (itemValue === "TAB_CREATE" || itemValue === "TAB_ADD") {
    const amount = Number(document.getElementById("tabPaymentAmount").value);

    if (!amount || amount <= 0) {
      alert("Enter amount to add to tab.");
      return;
    }

    lineTotal = amount;
    qty = 1;
    isTabAction = true;
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
    qty,
    price: isTabAction ? lineTotal : price,
    lineTotal,
    isTabPayment: isTabAction
  });

  document.getElementById("cart").innerHTML +=
    `<li>${name} x${qty} = $${lineTotal}</li>`;

  document.getElementById("total").textContent = total;

  if (isTabAction) {
    document.getElementById("tabPaymentAmount").value = "";
  }
}

// =====================================================
// 🚀 SUBMIT ORDER
// =====================================================
async function submitOrder() {
  if (cart.length === 0) {
    alert("Cart is empty!");
    return;
  }

  const payload = {
    employee: document.getElementById("employee").value,
    buyer: document.getElementById("buyer").value,
    originalPaymentMethod: document.getElementById("payment").value,
    cart,
    total
  };

  try {
    await fetch(WEBHOOK, {
      method: "POST",
      mode: "no-cors",
      body: JSON.stringify(payload),
      headers: { "Content-Type": "text/plain;charset=utf-8" }
    });

    alert("Order submitted!");
  } catch (err) {
    console.error(err);
    alert("Submit failed.");
  }

  cart = [];
  total = 0;
  document.getElementById("cart").innerHTML = "";
  document.getElementById("total").textContent = "0";
}
