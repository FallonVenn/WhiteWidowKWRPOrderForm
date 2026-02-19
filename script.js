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
  const paymentType = document.getElementById("payment").value;

  if (paymentType === "Tab") {
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

  // Split cart into regular items and tab payments
  const itemSales = cart.filter(item => !item.isTabPayment);
  const tabPayments = cart.filter(item => item.isTabPayment);

  try {
    // Send regular items to Sales Log
    if (itemSales.length > 0) {
      await fetch(WEBHOOK, {
        method: "POST",
        mode: "no-cors",
        body: JSON.stringify({
          employee: document.getElementById("employee").value,
          buyer: document.getElementById("buyer").value,
          paymentType: paymentType,
          tabName: "", // regular sales have no tab
          cart: itemSales,
          total: itemSales.reduce((sum, i) => sum + i.lineTotal, 0)
        }),
        headers: { "Content-Type": "application/json" }
      });
    }

    // Send tab payments separately
    if (tabPayments.length > 0) {
      await fetch(WEBHOOK, {
        method: "POST",
        mode: "no-cors",
        body: JSON.stringify({
          employee: document.getElementById("employee").value,
          buyer: document.getElementById("buyer").value,
          paymentType: "Tab",
          tabName: tabNameFinal,
          cart: tabPayments,
          total: tabPayments.reduce((sum, i) => sum + i.lineTotal, 0)
        }),
        headers: { "Content-Type": "application/json" }
      });
    }

    alert("Order submitted!");
    cart = [];
    total = 0;
    document.getElementById("cart").innerHTML = "";
    document.getElementById("total").textContent = "0";

  } catch (err) {
    console.error("Submit failed:", err);
    alert("Submit FAILED - check console (F12)");
  }
}
