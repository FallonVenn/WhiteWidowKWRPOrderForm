// =====================================================
// 🗄 ITEM DATABASE
// =====================================================
const ITEM_DB = {
  BAGS: [
    ["Skunk Bag", 500],
    ["OG Kush Bag", 600],
    ["White Widow Bag", 700],
    ["AK-47 Bag", 650],
    ["Amnesia Bag", 1500],
    ["Purple Haze Bag", 750],
    ["Gelato Bag", 800],
    ["Zkittles Bag", 800]
  ],

  JOINTS: [
    ["Skunk Joint", 100],
    ["OG Kush Joint", 120],
    ["White Widow Joint", 140],
    ["AK-47 Joint", 130],
    ["Amnesia Joint", 200],
    ["Purple Haze Joint", 150],
    ["Gelato Joint", 160],
    ["Zkittles Joint", 160]
  ],

  EDIBLES: [
    ["Raspberry Gummy Bears", 300],
    ["Strawberry Gummy Bears", 300],
    ["AK-47 Cookies", 400],
    ["Skunk Cookies", 400],
    ["White Widow Cookies", 400]
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
// 📦 POPULATE ITEMS
// =====================================================
function populateItems() {
  const category = document.getElementById("category").value;
  const itemSelect = document.getElementById("item");

  if (!itemSelect) return;

  itemSelect.innerHTML = '<option value="">Select item</option>';

  if (!ITEM_DB[category]) return;

  ITEM_DB[category].forEach(entry => {
    const option = document.createElement("option");

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

  toggleTabPaymentItem();
}

// =====================================================
// 🔄 TOGGLE QTY LABEL FOR TAB ACTIONS
// =====================================================
function toggleTabPaymentItem() {
  const itemSelect = document.getElementById("item");
  const qtyLabel = document.getElementById("qtyLabel");
  const qtyInput = document.getElementById("qty");

  if (!itemSelect || !qtyLabel || !qtyInput) return;

  const selectedValue = itemSelect.value;

  const isTabAction =
    selectedValue === "TAB_CREATE" ||
    selectedValue === "TAB_ADD";

  if (isTabAction) {
    qtyLabel.textContent = "Amount to Add:";
    qtyInput.placeholder = "Enter dollar amount";
    qtyInput.min = 1;
    qtyInput.step = 1;
  } else {
    qtyLabel.textContent = "Qty:";
    qtyInput.placeholder = "";
    qtyInput.min = 1;
    qtyInput.step = 1;

    if (!qtyInput.value || qtyInput.value < 1) {
      qtyInput.value = 1;
    }
  }
}

// =====================================================
// 💳 PAYMENT TAB VISIBILITY
// =====================================================
function toggleTabField() {
  const payment = document.getElementById("payment").value;
  const tabBlock = document.getElementById("tabBlock");
  const newTabBlock = document.getElementById("newTabBlock");
  const tabSelect = document.getElementById("tabSelect");

  if (!tabBlock || !newTabBlock || !tabSelect) return;

  if (payment === "Tab") {
    tabBlock.style.display = "block";
  } else {
    tabBlock.style.display = "none";
    newTabBlock.style.display = "none";
  }

  // handle NEW tab selection
  tabSelect.onchange = function () {
    if (this.value === "NEW") {
      newTabBlock.style.display = "block";
    } else {
      newTabBlock.style.display = "none";
    }
  };
}

// =====================================================
// 🧠 ADD ITEM TO CART
// =====================================================
function addItem() {
  const itemSelect = document.getElementById("item");
  const qtyInput = document.getElementById("qty");

  if (!itemSelect || !itemSelect.value) {
    alert("Select an item.");
    return;
  }

  const selectedOption = itemSelect.selectedOptions[0];
  const price = Number(selectedOption.dataset.price || 0);
  const qty = Number(qtyInput.value || 0);

  if (qty <= 0) {
    alert("Enter a valid amount.");
    return;
  }

  const isTabAction =
    itemSelect.value === "TAB_CREATE" ||
    itemSelect.value === "TAB_ADD";

  const lineTotal = isTabAction ? qty : price * qty;

  cart.push({
    item: itemSelect.value,
    qty: qty,
    price: price,
    lineTotal: lineTotal,
    isTabAction: isTabAction
  });

  total += lineTotal;

  renderCart();
}

// =====================================================
// 🖥 RENDER CART
// =====================================================
function renderCart() {
  const cartList = document.getElementById("cart");
  const totalSpan = document.getElementById("total");

  if (!cartList || !totalSpan) return;

  cartList.innerHTML = "";

  cart.forEach(entry => {
    const li = document.createElement("li");

    if (entry.isTabAction) {
      li.textContent = `${entry.item} - $${entry.qty}`;
    } else {
      li.textContent = `${entry.item} x${entry.qty} - $${entry.lineTotal}`;
    }

    cartList.appendChild(li);
  });

  totalSpan.textContent = total;
}

// =====================================================
// 🧾 BUILD ORDER SUMMARY
// =====================================================
function buildOrderSummary() {
  return cart
    .map(entry => {
      if (entry.isTabAction) {
        return `${entry.item}: $${entry.qty}`;
      }
      return `${entry.item} x${entry.qty}`;
    })
    .join(", ");
}

// =====================================================
// 🚀 SUBMIT ORDER
// =====================================================
function submitOrder() {
  const employee = document.getElementById("employee").value;
  const buyer = document.getElementById("buyer").value;
  const payment = document.getElementById("payment").value;
  const tabSelect = document.getElementById("tabSelect").value;
  const newTabName = document.getElementById("newTabName").value;

  if (!employee || !buyer) {
    alert("Employee and Buyer required.");
    return;
  }

  if (cart.length === 0) {
    alert("Cart is empty.");
    return;
  }

  const hasTabAction = cart.some(x => x.isTabAction);

  const payload = {
    employee,
    buyer,
    paymentType: hasTabAction ? "Tab Action" : "Item Sale",
    originalPaymentMethod: payment,
    tabName: tabSelect === "NEW" ? newTabName : tabSelect,
    orderSummary: buildOrderSummary(),
    orderJson: cart,
    total
  };

  document.getElementById("formData").value = JSON.stringify(payload);
  document.getElementById("orderForm").submit();

  // reset cart
  cart = [];
  total = 0;
  renderCart();
}
