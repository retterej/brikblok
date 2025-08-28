import express from "express";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(express.json({ type: ["application/json", "application/*+json"] }));
const PORT = process.env.PORT || 3000;

// BrickLink will POST events (order_created, message_received, feedback_left, etc.) to your callback URL.
// Set your callback URL in your BrickLink API settings to: https://<public-url>/bricklink/push
app.post("/bricklink/push", (req, res) => {
  console.log("\n=== BrickLink Push ===");
  console.log("Headers:", req.headers);
  console.log("Body:", JSON.stringify(req.body, null, 2));

  // TODO: Optional – verify source IP or implement a shared secret scheme if supported.
  //       BrickLink push docs don't provide an HMAC signature header; treat this endpoint as public.

  // Acknowledge receipt
  res.status(200).json({ ok: true });
});

app.get("/", (_req, res) => res.send("BrickLink webhook server is running."));

app.listen(PORT, () => {
  console.log(`Webhook listening on http://localhost:${PORT}`);
});
