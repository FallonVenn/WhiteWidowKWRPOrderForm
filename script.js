const WEBHOOK = "https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec";

let cart = [];
let total = 0;

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
   SUBMIT ORDER SPLIT
================================ */
async function submitOrder() {
  if (cart.length === 0) {
    alert("Cart is empty!");
    return;
  }

  let tabNameFinal = "";
  if (document.getElementById("payment").value === "Tab") {
    const tabChoice = document.getElementById("tabSelect").value;
    tabNameFinal = tabChoice === "NEW"
      ? document.getElementById("newTabName").value.trim()
      : tabChoice;

    if (!tabNameFinal) {
      alert("Enter new tab name.");
      return;
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
    const res = await fetch(WEBHOOK, {
      method: "POST",
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" }
    });

    const text = await res.text();

    if (text.startsWith("ERROR:")) {
      alert(text); // show tab negative alert
      return;
    }

    alert("Order submitted successfully!");
    cart = [];
    total = 0;
    document.getElementById("cart").innerHTML = "";
    document.getElementById("total").textContent = "0";

  } catch (err) {
    console.error(err);
    alert("Submit failed. Check console.");
  }
}
