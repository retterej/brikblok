import { blRequest } from "./bl_client.js";

// Create a minimal inventory entry.
// Adjust fields as needed. Requires seller API permissions.
// Docs typically include: item { no, type }, color_id, quantity, new_or_used, completeness, unit_price, description, remarks, retain, stock_room_id, etc.
// Here we create a NEW, COMPLETE listing for a basic brick (3001) in color 5 (Red) at quantity 10.
async function run() {
  const body = {
    item: { no: "3001", type: "PART" },   // 2x4 Brick
    color_id: 5,                           // Red
    quantity: 10,
    unit_price: 0.15,
    new_or_used: "N",                      // N = new, U = used
    completeness: "C",                     // C = complete, B = incomplete, S = sealed
    description: "Auto-listed via API example",
    remarks: "Example listing",
    bulk: 1,
    is_retain: false,
    is_stock_room: false
  };

  try {
    const created = await blRequest("POST", "/inventories", { body });
    console.log("\n=== Created inventory ===\n", JSON.stringify(created, null, 2));
  } catch (e) {
    console.error("\n[POST /inventories] Failed:", e.message);
    console.error("Make sure your account has seller API access and the payload fields are allowed.");
  }
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
