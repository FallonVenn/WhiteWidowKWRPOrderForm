const WEBHOOK = "https://script.google.com/macros/s/AKfycbyu7uQT7Gos6IsgrJvtEX6y7D66Y8_xOokGVqys2OUqMAL6OrXzlzzYO1GbT-6iMAh0/exec";

let cart = [];
let total = 0;

/* ===============================
   TAB PAYMENT VISIBILITY
================================ */
function toggleTabPaymentItem() {
  const itemValue = document.getElementById("item").value;
  const qtyField = document.getElementById("qty");
  const qtyLabel = document.getElementById("qtyLabel");
  const tabAmountField = document.getElementById("tabPaymentAmount");
  const tabAmountLabel = document.getElementById("tabAmountLabel");

  if (itemValue === "TAB_PAYMENT") {
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

/* ===============================
   ADD ITEM
================================ */
function addItem() {
  const itemSelect = document.getElementById("item");
  const qty = Number(document.getElementById("qty").value);
  const itemValue = itemSelect.value;
  const itemText = itemSelect.selectedOptions[0].text;

  let price = Number(itemSelect.selectedOptions[0].dataset.price);
  let lineTotal = 0;
  let name = itemText;

  if (itemValue === "TAB_PAYMENT") {
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
    qty: itemValue === "TAB_PAYMENT" ? 1 : qty,
    price,
    lineTotal,
    isTabPayment: itemValue === "TAB_PAYMENT"
  });

  document.getElementById("cart").innerHTML += `<li>${name} = $${lineTotal.toLocaleString()}</li>`;
  document.getElementById("total").textContent = total.toLocaleString();

  document.getElementById("tabPaymentAmount").value = "";
}

/* ===============================
   SUBMIT ORDER
================================ */
async function submitOrder() {
  if (cart.length === 0) {
    alert("Cart is empty!");
    return;
  }

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

  const payload = {
    employee: document.getElementById("employee").value,
    buyer: document.getElementById("buyer").value,
    paymentType: document.getElementById("payment").value,
    tabName: tabNameFinal,
    cart: cart,
    total: total
  };

  try {
    // Use fetch in 'no-cors' mode for GitHub Pages / Netlify
    await fetch(WEBHOOK, {
      method: "POST",
      mode: "no-cors",
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" }
    });

    alert("Order submitted!");

    // Reset POS
    cart = [];
    total = 0;
    document.getElementById("cart").innerHTML = "";
    document.getElementById("total").textContent = "0";

  } catch (err) {
    console.error("Submit failed:", err);
    alert("Submit FAILED - check console (F12)");
  }
}
