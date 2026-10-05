console.log("VU POS script loaded");

// =====================================================
// WEB APP ENDPOINT
// =====================================================
const WEBHOOK = "https://script.google.com/macros/s/AKfycbzFS_PjdXEalMw2dIPz4_F93J__cZU1xCodNxTQ6FfCADwOB5ZZjyaEOtcfk1g4vkrc/exec";

// =====================================================
// POS DATA CACHE
//
// Apps Script returns:
// {
//   "CATEGORY": [
//     {
//       name,
//       price,
//       category,
//       type,
//       ingredients,
//       ...
//     }
//   ]
// }
// =====================================================
let ITEM_DATA_CACHE = {};

// =====================================================
// JSONP HELPER
// =====================================================
function loadJsonp(action) {
  return new Promise((resolve, reject) => {
    const callbackName =
      `vuPOSCallback_${Date.now()}_${Math.random()
        .toString(36)
        .slice(2)}`;

    const script =
      document.createElement("script");

    let finished = false;

    const cleanup = () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }

      try {
        delete window[callbackName];
      } catch (err) {
        window[callbackName] = undefined;
      }
    };

    const timeout =
      setTimeout(() => {
        if (finished) return;

        finished = true;
        cleanup();

        reject(
          new Error(
            `JSONP request timed out: ${action}`
          )
        );
      }, 10000);

    window[callbackName] = data => {
      if (finished) return;

      finished = true;
      clearTimeout(timeout);

      cleanup();

      resolve(data);
    };

    script.onerror = () => {
      if (finished) return;

      finished = true;
      clearTimeout(timeout);

      cleanup();

      reject(
        new Error(
          `JSONP request failed: ${action}`
        )
      );
    };

    script.src =
      `${WEBHOOK}?action=${encodeURIComponent(action)}` +
      `&prefix=${encodeURIComponent(callbackName)}`;

    document.head.appendChild(script);
  });
}

// =====================================================
// CART STATE
// =====================================================
let cart = [];
let total = 0;

// =====================================================
// INIT
// =====================================================
document.addEventListener("DOMContentLoaded", () => {
  document
    .getElementById("category")
    ?.addEventListener("change", populateItems);

  document
    .getElementById("item")
    ?.addEventListener("change", () => {
      toggleTabPaymentItem();
      toggleTabNameField();
    });

  document
    .getElementById("payment")
    ?.addEventListener("change", toggleTabField);

  document
    .getElementById("addItemButton")
    ?.addEventListener("click", addItem);

  document
    .getElementById("calculateIngredientsButton")
    ?.addEventListener("click", calculateIngredients);

  document
    .getElementById("submitOrderButton")
    ?.addEventListener("click", submitOrder);

  fetchTabs();
  fetchStaff();
  fetchItems();
});

// =====================================================
// FETCH EXISTING TABS
// =====================================================
async function fetchTabs() {
  try {
    console.log("Fetching tabs...");

    const resp = await fetch(WEBHOOK + "?action=getTabs");

    if (!resp.ok) {
      throw new Error(`Tab request failed: ${resp.status}`);
    }

    const data = await resp.json();

    console.log("Tabs received:", data);

    if (!Array.isArray(data)) return;

    populatePaymentTabs(data);

    const existingTabSelect =
      document.getElementById("existingTabSelect");

    if (existingTabSelect) {
      existingTabSelect.innerHTML =
        '<option value="">Select Tab</option>';

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
// FETCH STAFF ROSTER
// =====================================================
async function fetchStaff() {
  try {
    console.log("Fetching staff...");

    const resp = await fetch(WEBHOOK + "?action=getStaff");

    if (!resp.ok) {
      throw new Error(`Staff request failed: ${resp.status}`);
    }

    const data = await resp.json();

    console.log("Staff received:", data);

    if (!Array.isArray(data)) return;

    const employeeSelect =
      document.getElementById("employee");

    if (!employeeSelect) return;

    employeeSelect.innerHTML =
      '<option value="">Select Employee</option>';

    data.forEach(name => {
      const opt = document.createElement("option");

      opt.value = name;
      opt.textContent = name;

      employeeSelect.appendChild(opt);
    });

  } catch (err) {
    console.error("Failed to fetch staff:", err);
  }
}

// =====================================================
// FETCH ITEMS / RECIPES
// =====================================================
async function fetchItems() {
  try {
    console.log("Fetching POS items and recipes...");

    const resp = await fetch(WEBHOOK + "?action=getItems");

    if (!resp.ok) {
      throw new Error(`Item request failed: ${resp.status}`);
    }

    const data = await resp.json();

    console.log("POS items received:", data);

    if (
      !data ||
      typeof data !== "object" ||
      Array.isArray(data)
    ) {
      throw new Error(
        "POS items response was not an object."
      );
    }

    ITEM_DATA_CACHE = data;

    populateCategories();

  } catch (err) {
    console.error(
      "Failed to fetch POS items:",
      err
    );
  }
}

// =====================================================
// CATEGORY HELPERS
// =====================================================
function formatCategoryLabel(category) {
  if (!category) return "";

  return category
    .toString()
    .trim()
    .toLowerCase()
    .split("-")
    .map(
      part =>
        part.charAt(0).toUpperCase() +
        part.slice(1)
    )
    .join("-")
    .replace(
      /\bMixed Drink\b/g,
      "Mixed Drinks"
    )
    .replace(
      /\bBeer\b/g,
      "Beer"
    )
    .replace(
      /\bEntree\b/g,
      "Entree"
    )
    .replace(
      /\bStarter\b/g,
      "Starter"
    );
}

function populateCategories() {
  const categorySelect =
    document.getElementById("category");

  if (!categorySelect) return;

  const categories =
    Object.keys(ITEM_DATA_CACHE).filter(
      category => {
        const entries =
          ITEM_DATA_CACHE[category];

        return (
          Array.isArray(entries) &&
          entries.length > 0
        );
      }
    );

  categorySelect.innerHTML =
    '<option value="">Select Category</option>';

  categories.forEach(category => {
    const opt =
      document.createElement("option");

    opt.value = category;
    opt.textContent =
      formatCategoryLabel(category);

    categorySelect.appendChild(opt);
  });

  console.log(
    "POS categories loaded:",
    categories
  );
}

// =====================================================
// POPULATE ITEMS
// =====================================================
function populateItems() {
  const categorySelect =
    document.getElementById("category");

  const itemSelect =
    document.getElementById("item");

  if (!categorySelect || !itemSelect) {
    return;
  }

  const category =
    categorySelect.value;

  const entries =
    ITEM_DATA_CACHE[category] || [];

  itemSelect.innerHTML =
    '<option value="">Select item</option>';

  entries.forEach((entry, index) => {
    const opt =
      document.createElement("option");

    opt.value = entry.name;

    opt.dataset.index =
      String(index);

    opt.dataset.price =
      String(Number(entry.price) || 0);

    opt.dataset.type =
      entry.type || "PRODUCT";

    opt.textContent =
      `${entry.name} - $${Number(entry.price) || 0}`;

    itemSelect.appendChild(opt);
  });

  toggleTabPaymentItem();
  toggleTabNameField();
}

// =====================================================
// GET SELECTED ITEM DATA
// =====================================================
function getSelectedItemData() {
  const category =
    document.getElementById("category")?.value || "";

  const itemSelect =
    document.getElementById("item");

  const selected =
    itemSelect?.selectedOptions?.[0];

  if (
    !category ||
    !selected ||
    !selected.value
  ) {
    return null;
  }

  const index =
    Number(selected.dataset.index);

  const entries =
    ITEM_DATA_CACHE[category] || [];

  if (
    !Number.isInteger(index) ||
    !entries[index]
  ) {
    return null;
  }

  return entries[index];
}

// =====================================================
// TAB PAYMENT INPUT
// =====================================================
function toggleTabPaymentItem() {
  const itemData =
    getSelectedItemData();

  const isTabAction =
    itemData &&
    (
      itemData.type === "TAB_CREATE" ||
      itemData.type === "TAB_ADD"
    );

  const qtyField =
    document.getElementById("qty");

  const qtyLabel =
    document.getElementById("qtyLabel");

  const tabAmountField =
    document.getElementById("tabPaymentAmount");

  const tabAmountLabel =
    document.getElementById("tabAmountLabel");

  if (
    !qtyField ||
    !qtyLabel ||
    !tabAmountField ||
    !tabAmountLabel
  ) {
    return;
  }

  if (isTabAction) {
    qtyField.style.display = "none";
    qtyLabel.style.display = "none";

    qtyField.value = 1;

    tabAmountField.style.display =
      "inline-block";

    tabAmountLabel.style.display =
      "inline-block";

    tabAmountField.required = true;

  } else {
    qtyField.style.display =
      "inline-block";

    qtyLabel.style.display =
      "inline-block";

    tabAmountField.style.display =
      "none";

    tabAmountLabel.style.display =
      "none";

    tabAmountField.required = false;
    tabAmountField.value = "";
  }
}

// =====================================================
// TAB NAME INPUT / DROPDOWN
// =====================================================
function toggleTabNameField() {
  const itemData =
    getSelectedItemData();

  const newTabBlock =
    document.getElementById("newTabBlock");

  const existingTabBlock =
    document.getElementById("existingTabBlock");

  if (
    !newTabBlock ||
    !existingTabBlock
  ) {
    return;
  }

  if (
    itemData?.type === "TAB_CREATE"
  ) {
    newTabBlock.style.display =
      "block";

    existingTabBlock.style.display =
      "none";

  } else if (
    itemData?.type === "TAB_ADD"
  ) {
    newTabBlock.style.display =
      "none";

    existingTabBlock.style.display =
      "block";

  } else {
    newTabBlock.style.display =
      "none";

    existingTabBlock.style.display =
      "none";
  }
}

// =====================================================
// PAYMENT TAB FIELD
// =====================================================
function toggleTabField() {
  const payment =
    document.getElementById("payment")?.value || "";

  const tabBlock =
    document.getElementById("tabBlock");

  if (tabBlock) {
    tabBlock.style.display =
      payment === "Tab"
        ? "block"
        : "none";
  }
}

// =====================================================
// ADD ITEM TO CART
// =====================================================
function addItem() {
  const itemData =
    getSelectedItemData();

  const qtyField =
    document.getElementById("qty");

  const tabAmountField =
    document.getElementById(
      "tabPaymentAmount"
    );

  const newTabName =
    document
      .getElementById("newTabName")
      ?.value
      .trim() || "";

  const existingTab =
    document
      .getElementById(
        "existingTabSelect"
      )
      ?.value || "";

  if (!itemData) {
    alert("Select an item first.");
    return;
  }

  let qty =
    Number(qtyField?.value || 1);

  let lineTotal = 0;
  let tabAction = "";

  // ===================================================
  // TAB CREATE
  // ===================================================
  if (
    itemData.type === "TAB_CREATE"
  ) {
    const amount =
      Number(
        tabAmountField?.value
      );

    if (!newTabName) {
      alert("Enter new tab name.");
      return;
    }

    if (
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      alert(
        "Enter a valid deposit amount."
      );
      return;
    }

    qty = 1;
    lineTotal = amount;
    tabAction = "CREATE";

    cart.push({
      name: newTabName,
      qty,
      lineTotal,
      tabAction,
      type: "TAB_CREATE",
      category: itemData.category,
      ingredients: []
    });

  // ===================================================
  // TAB ADD
  // ===================================================
  } else if (
    itemData.type === "TAB_ADD"
  ) {
    const amount =
      Number(
        tabAmountField?.value
      );

    if (!existingTab) {
      alert(
        "Select an existing tab."
      );
      return;
    }

    if (
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      alert(
        "Enter a valid amount."
      );
      return;
    }

    qty = 1;
    lineTotal = amount;
    tabAction = "ADD";

    cart.push({
      name: existingTab,
      qty,
      lineTotal,
      tabAction,
      type: "TAB_ADD",
      category: itemData.category,
      ingredients: []
    });

  // ===================================================
  // NORMAL ITEM
  // ===================================================
  } else {
    if (
      !Number.isFinite(qty) ||
      qty <= 0
    ) {
      alert(
        "Enter a valid quantity."
      );
      return;
    }

    qty = Math.floor(qty);

    lineTotal =
      (Number(itemData.price) || 0) *
      qty;

    cart.push({
      name: itemData.name,
      qty,
      lineTotal,
      tabAction: "",
      type:
        itemData.type || "PRODUCT",
      category:
        itemData.category,
      ingredients:
        Array.isArray(
          itemData.ingredients
        )
          ? [...itemData.ingredients]
          : [],
      room:
        itemData.room || "",
      time:
        itemData.time || ""
    });
  }

  total += lineTotal;

  renderCart();
  resetOrderEntryPartial();
}

// =====================================================
// REMOVE ITEM FROM CART
// =====================================================
function removeCartItem(index) {
  if (
    !Number.isInteger(index) ||
    index < 0 ||
    index >= cart.length
  ) {
    return;
  }

  total -=
    Number(
      cart[index].lineTotal || 0
    );

  cart.splice(index, 1);

  if (total < 0) {
    total = 0;
  }

  renderCart();
}

// =====================================================
// RENDER CART
// =====================================================
function renderCart() {
  const cartEl =
    document.getElementById("cart");

  const totalEl =
    document.getElementById("total");

  if (!cartEl) return;

  cartEl.innerHTML = "";

  cart.forEach((item, index) => {
    const li =
      document.createElement("li");

    const line =
      document.createElement("span");

    line.className =
      "cart-line";

    const title =
      document.createElement("span");

    title.textContent =
      `${item.name} x${item.qty}`;

    const price =
      document.createElement("span");

    price.className =
      "cart-price";

    price.textContent =
      `$${item.lineTotal}`;

    line.appendChild(title);
    line.appendChild(price);

    const removeButton =
      document.createElement(
        "button"
      );

    removeButton.type = "button";
    removeButton.className =
      "remove-btn";

    removeButton.textContent = "✕";

    removeButton.addEventListener(
      "click",
      () => removeCartItem(index)
    );

    li.appendChild(line);
    li.appendChild(removeButton);

    cartEl.appendChild(li);
  });

  if (totalEl) {
    totalEl.textContent =
      total
        .toFixed(2)
        .replace(/\.00$/, "");
  }

  const requirements =
    document.getElementById(
      "ingredientRequirements"
    );

  if (requirements) {
    requirements.innerHTML =
      "<p>Order changed. Calculate ingredients when ready.</p>";
  }
}

// =====================================================
// INGREDIENT CALCULATOR
// =====================================================
function calculateIngredients() {
  const requirements = {};
  const roomItems = [];
  const skippedTabActions = [];

  cart.forEach(item => {
    // -----------------------------------------------
    // TAB ACTIONS
    // -----------------------------------------------
    if (
      item.type === "TAB_CREATE" ||
      item.type === "TAB_ADD"
    ) {
      skippedTabActions.push(
        item.name
      );

      return;
    }

    // -----------------------------------------------
    // PRIVATE ROOMS
    // -----------------------------------------------
    if (
      item.type === "PRIVATE_ROOM"
    ) {
      roomItems.push(
        `${item.name} x${item.qty}`
      );

      return;
    }

    // -----------------------------------------------
    // PRODUCTS
    // -----------------------------------------------
    if (
      !Array.isArray(item.ingredients) ||
      item.ingredients.length === 0
    ) {
      return;
    }

    item.ingredients.forEach(
      ingredient => {
        const name =
          ingredient
            .toString()
            .trim();

        if (!name) return;

        requirements[name] =
          (
            requirements[name] || 0
          ) +
          Number(item.qty || 0);
      }
    );
  });

  const requirementsEl =
    document.getElementById(
      "ingredientRequirements"
    );

  if (!requirementsEl) {
    return;
  }

  requirementsEl.innerHTML = "";

  if (cart.length === 0) {
    requirementsEl.innerHTML =
      "<p>Cart is empty.</p>";

    return;
  }

  // ===================================================
  // INGREDIENT LIST
  // ===================================================
  const requirementEntries =
    Object.entries(requirements)
      .sort(
        (a, b) =>
          a[0].localeCompare(b[0])
      );

  if (
    requirementEntries.length > 0
  ) {
    const list =
      document.createElement("ul");

    requirementEntries.forEach(
      ([ingredient, amount]) => {
        const li =
          document.createElement(
            "li"
          );

        li.textContent =
          `${ingredient}: ${amount}`;

        list.appendChild(li);
      }
    );

    requirementsEl.appendChild(list);

  } else {
    const p =
      document.createElement("p");

    p.textContent =
      "No recipe ingredients are required for the current cart.";

    requirementsEl.appendChild(p);
  }

  // ===================================================
  // PRIVATE ROOM INFO
  // ===================================================
  if (roomItems.length > 0) {
    const roomTitle =
      document.createElement("p");

    roomTitle.innerHTML =
      "<strong>Private Room:</strong>";

    requirementsEl.appendChild(
      roomTitle
    );

    const roomList =
      document.createElement("ul");

    roomItems.forEach(room => {
      const li =
        document.createElement(
          "li"
        );

      li.textContent = room;

      roomList.appendChild(li);
    });

    requirementsEl.appendChild(
      roomList
    );
  }

  // ===================================================
  // TAB INFO
  // ===================================================
  if (
    skippedTabActions.length > 0
  ) {
    const p =
      document.createElement("p");

    p.textContent =
      "Tab actions do not consume recipe ingredients.";

    requirementsEl.appendChild(p);
  }
}

// =====================================================
// PAYMENT TABS
// =====================================================
function populatePaymentTabs(
  tabNames
) {
  const paymentSelect =
    document.getElementById(
      "tabSelect"
    );

  if (!paymentSelect) {
    return;
  }

  paymentSelect.innerHTML =
    '<option value="">Select Tab</option>';

  tabNames.forEach(name => {
    const opt =
      document.createElement(
        "option"
      );

    opt.value = name;
    opt.textContent = name;

    paymentSelect.appendChild(opt);
  });
}

// =====================================================
// SUBMIT ORDER
//
// NOTE:
// This still sends the order to the
// existing POST endpoint.
//
// Ingredient deduction will be moved
// server-side when sellOrder is implemented.
// =====================================================
function submitOrder() {
  if (cart.length === 0) {
    alert("Cart is empty.");
    return;
  }

  const employee =
    document
      .getElementById("employee")
      ?.value
      .trim() || "";

  const buyer =
    document
      .getElementById("buyer")
      ?.value
      .trim() || "";

  const paymentType =
    document
      .getElementById("payment")
      ?.value || "";

  const tabName =
    document
      .getElementById("tabSelect")
      ?.value || "";

  // ===================================================
  // VALIDATION
  // ===================================================
  if (!employee) {
    alert(
      "Select an employee."
    );
    return;
  }

  if (!buyer) {
    alert(
      "Enter the buyer name."
    );
    return;
  }

  if (!paymentType) {
    alert(
      "Select a payment method."
    );
    return;
  }

  if (
    paymentType === "Tab" &&
    !tabName
  ) {
    alert(
      "Select a tab."
    );
    return;
  }

  const timestamp =
    new Date().toISOString();

  const readableSummary =
    cart
      .map(
        item =>
          `${item.name} x${item.qty} - $${item.lineTotal}`
      )
      .join(" | ");

  const orderJSON =
    JSON.stringify(cart);

  const formData =
    new URLSearchParams();

  formData.append(
    "timestamp",
    timestamp
  );

  formData.append(
    "employee",
    employee
  );

  formData.append(
    "buyer",
    buyer
  );

  formData.append(
    "paymentType",
    paymentType
  );

  formData.append(
    "tabName",
    tabName
  );

  formData.append(
    "orderSummary",
    readableSummary
  );

  formData.append(
    "orderJSON",
    orderJSON
  );

  formData.append(
    "total",
    total.toFixed(2)
  );

  fetch(
    WEBHOOK,
    {
      method: "POST",
      body: formData
    }
  )
    .then(async res => {
      const text =
        await res.text();

      if (!res.ok) {
        throw new Error(
          `Submit failed: ${res.status} ${text}`
        );
      }

      return text;
    })

    .then(data => {
      console.log(
        "Webhook response:",
        data
      );

      alert(
        "Order submitted."
      );

      cart = [];
      total = 0;

      renderCart();
      resetOrderEntryFull();
    })

    .catch(err => {
      console.error(
        "Submit failed:",
        err
      );

      alert(
        err.message ||
        "Submit failed. Check console."
      );
    });
}

// =====================================================
// RESET ORDER ENTRY
// =====================================================
function resetOrderEntryPartial() {
  const category =
    document.getElementById(
      "category"
    );

  if (category) {
    category.value = "";
  }

  const item =
    document.getElementById(
      "item"
    );

  if (item) {
    item.innerHTML =
      '<option value="">Select item</option>';
  }

  const qty =
    document.getElementById(
      "qty"
    );

  if (qty) {
    qty.value = 1;
  }

  const tabAmount =
    document.getElementById(
      "tabPaymentAmount"
    );

  if (tabAmount) {
    tabAmount.value = "";
  }

  const newTabName =
    document.getElementById(
      "newTabName"
    );

  if (newTabName) {
    newTabName.value = "";
  }

  const existingTab =
    document.getElementById(
      "existingTabSelect"
    );

  if (existingTab) {
    existingTab.value = "";
  }

  toggleTabPaymentItem();
  toggleTabNameField();
}

function resetOrderEntryFull() {
  resetOrderEntryPartial();

  const employee =
    document.getElementById(
      "employee"
    );

  if (employee) {
    employee.value = "";
  }

  const buyer =
    document.getElementById(
      "buyer"
    );

  if (buyer) {
    buyer.value = "";
  }

  const payment =
    document.getElementById(
      "payment"
    );

  if (payment) {
    payment.selectedIndex = 0;
  }

  const tabSelect =
    document.getElementById(
      "tabSelect"
    );

  if (tabSelect) {
    tabSelect.value = "";
  }

  toggleTabField();
}

// =====================================================
// LEGACY INLINE-HANDLER SUPPORT
// =====================================================
window.addItem = addItem;
window.submitOrder = submitOrder;
window.populateItems = populateItems;
window.toggleTabField = toggleTabField;
window.toggleTabNameField =
  toggleTabNameField;
window.toggleTabPaymentItem =
  toggleTabPaymentItem;
window.removeCartItem =
  removeCartItem;
window.calculateIngredients =
  calculateIngredients;
