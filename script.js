let cart = [];
let total = 0;

// Replace with your Apps Script Webhook
const WEBHOOK = "https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec";

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
   EXISTING TAB LOGIC
================================ */
function toggleTabField() {
  const payment = docu

