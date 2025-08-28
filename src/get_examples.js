import { blRequest } from "./bl_client.js";

async function run() {
  // 1) Item details (SET 10276-1 Colosseum)
  const item = await blRequest("GET", "/items/SET/10276-1");
  console.log("\n=== Item details ===\n", JSON.stringify(item, null, 2));

  // 2) Price guide for a minifig
  const price = await blRequest("GET", "/items/MINIFIG/sw0087/price", { query: { guide_type: "sold" } });
  console.log("\n=== Price guide ===\n", JSON.stringify(price, null, 2));

  // 3) Inventories (seller-only)
  try {
    const inv = await blRequest("GET", "/inventories");
    console.log("\n=== Inventories ===\n", JSON.stringify(inv, null, 2));
  } catch (e) {
    console.warn("\n[Inventories] Skipped or failed:", e.message);
  }

  // 4) Pending orders (seller-only)
  try {
    const orders = await blRequest("GET", "/orders", { query: { status: "PENDING" } });
    console.log("\n=== Pending orders ===\n", JSON.stringify(orders, null, 2));
  } catch (e) {
    console.warn("\n[Orders] Skipped or failed:", e.message);
  }
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
