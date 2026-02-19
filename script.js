console.log("script loaded");

// =====================================================
// 🔗 WEBHOOK
// =====================================================
const WEBHOOK = "https://script.google.com/macros/s/AKfycbxVIMRmVGJ89sPp4RJsg6StN9rqVVF2EH1Ej3OTRMDVJaN_p_7ZQk3Bvmozs1c7YfRi/exec"; // <-- replace with your Apps Script URL

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
// 💳 TOGGLE TAB PAYMENT INPUT
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
// 💳 TOGGLE TAB NAME INPUT/DROPDOWN BASED ON TAB ITEM
// =====================================================
function toggleTabNameField() {
  const itemValue = document.getElementById("item").value;
  const newTabBlock = document.getElementById("newTabBlock");       // Text input for new tab
  const newTabInput = document.getElementById("newTabName");
  const existingTabBlock = document.getElementById("existingTabBlock"); // Dropdown for existing tabs
  const existingTabSelect = document.getElementById("existingTabSelect");

  if (itemValue === "TAB_CREATE") {
    // show new tab input, hide existing tabs dropdown
    newTabBlock.style.display = "block";
    newTabInput.required = true;

    if (existingTabBlock) {
      existingTabBlock.style.display = "none";
      existingTabSelect.value = "";
      existingTabSelect.required = false;
    }
  } else if (itemValue === "TAB_ADD") {
    // show existing tab dropdown, hide new tab input
    if (newTabBlock) {
      newTabBlock.style.display = "none";
      newTabInput.value = "";
      newTabInput.required = false;
    }

    if (existingTabBlock) {
      existingTabBlock.style.display = "block";
      existingTabSelect.required = true;

      // populate existing tabs
      existingTabSelect.innerHTML = '<option value="">Select Tab</option>';
      const existingTabs = ["Alpha", "Beta", "Gamma"]; // Replace with dynamic list if needed
      existingTabs.forEach(tab => {
        const opt = document.createElement("option");
        opt.value = tab;
        opt.textContent = tab;
        existingTabSelect.appendChild(opt);
      });
    }
  } else {
    // neither tab action selected → hide both
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


// =====================================================
// 💳 TOGGLE PAYMENT TAB FIELDS
// =====================================================
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
