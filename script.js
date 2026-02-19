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

  if (!categoryEl || !itemSelect) {
    console.warn("populateItems: missing elements");
    return;
  }

  const category = categoryEl.value;

  // always reset dropdown
  itemSelect.innerHTML = '<option value="">Select item</option>';

  if (!category || !ITEM_DB[category]()_
