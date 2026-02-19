console.log("script loaded");
/* ===============================
   GLOBAL VARIABLES
================================ */
let cart = [];
let total = 0;

const WEBHOOK = "https://script.google.com/macros/s/AKfycbzeLu0a62QSi7bvM2Ir_rTlgeRR-tQI3PN9vgftC_g8Tbeu0ZZvgEjvlXF8I09uXXig/exec";

function populateItems() {
  const category = document.getElementById("category").value;
  const itemSelect = document.getElementById("item");

  itemSelect.innerHTML = '<option value="">Select item</option>';

  if (!ITEM_DB[category]) return;

  ITEM_DB[category].forEach(entry => {
    const option = document.createElement("option");

    // Tab actions have custom label
    if (category === "TAB") {
      option.value = entry[0];
      option.dataset.price = entry[1];
      option.textContent = entry[2];
    } else {
      option.value = entry[0];
      option.dataset.price = entry[1];
      option.textContent = `${entry[0]} - $${entry[1]} per`;
    }

    itemSelect.appendChild(option);
  });

  // reset tab UI when category changes
  toggleTabPaymentItem();
}


/* ===============================
   ITEM DATABASE
================================ */

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


/* ===============================
   TOGGLE TAB PAYMENT INPUT
================================ */
function toggleTabPaymentItem() {
  const itemValue = document.getElementById("item").value;

  const qtyField = document.getElementById("qty");
  const qtyLabel = document.getElementById("qtyLabel");
  const tabAmountField = document.getElementById("tabPaymentAmount");
  const tabAmountLabel = document.getElementById("tabAmountLabel");

  if (itemValue === "TAB_PAYMENT") {
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

/* ===============================
   EXISTING TAB LOGIC
================================ */
function toggleTabField() {
  const payment = document.getElementById("payment").value;
  const tabBlock = document.getElementById("tabBlock");
  const newTabBlock = document.getElementById("newTabBlock");
  const tabSelect = document.getElementById("tabSelect");
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
  const tabSelect = document.getElementById("tabSelect").value;
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

/* ===============================
   ADD ITEM TO CART
================================ */
function addItem() {

  // 🔒 REQUIRE EMPLOYEE + BUYER FIRST
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
  const qty = Number(document.getElementById("qty").value);
  const itemValue = itemSelect.value;
   if (!itemValue) {
  alert("Select an item first.");
  return;
}

  const itemText = itemSelect.selectedOptions[0].text;

  let price = Number(itemSelect.selectedOptions[0].dataset.price);
  let lineTotal = 0;
  let name = itemText;

  // TAB PAYMENT CASE
const isTabAction = itemValue === "TAB_CREATE" || itemValue === "TAB_ADD";

if (isTabAction)
 {
    const amount = Number(document.getElementById("tabPaymentAmount").value);
    if (!amount || amount <= 0) {
      alert("Enter amount to add to tab.");
      return;
    }
    price = amount;
    lineTotal = amount;
    name = "Tab Payment";
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
   qty: isTabAction ? 1 : qty,
    price,
    lineTotal,
isTabPayment: isTabAction
  });

  document.getElementById("cart").innerHTML += `<li>${name} = $${lineTotal}</li>`;
  document.getElementById("total").textContent = total;

  // reset tab payment field
  if (itemValue === "TAB_PAYMENT") {
    document.getElementById("tabPaymentAmount").value = "";
  }
}

/* ===============================
   SUBMIT ORDER
   (splits sales and tab payments)
================================ */
async function submitOrder() {
  if (cart.length === 0) {
    alert("Cart is empty!");
    return;
  }

  // Determine final tab if needed
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
  }

  // Split cart
  const itemCart = cart.filter(c => !c.isTabPayment);
  const tabCart = cart.filter(c => c.isTabPayment);

  // payloads
const itemPayload = {
  employee: document.getElementById("employee").value,
  buyer: document.getElementById("buyer").value,
  paymentType: "Item Sale", // routing only
  originalPaymentMethod: document.getElementById("payment").value,
  tabName: "",
  cart: itemCart,
  total: itemCart.reduce((a, b) => a + b.lineTotal, 0)
};


 const tabPayload = {
  employee: document.getElementById("employee").value,
  buyer: document.getElementById("buyer").value,
  paymentType: "Tab",
  originalPaymentMethod: document.getElementById("payment").value,
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
