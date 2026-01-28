// server/routes.js
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { v4 as uuidv4 } from "uuid";
import pool from "./db.js";

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* -------------------- Serve Static Pages -------------------- */
["/", "page2.html", "page3.html", "page4.html", "page5.html"].forEach((p, i) => {
  router.get(i === 0 ? "/" : `/${p}`, (_req, res) =>
    res.sendFile(path.join(process.cwd(), "public", i === 0 ? "index.html" : p))
  );
});

/* -------------------- LOGIN -------------------- */
router.post("/api/login", (req, res) => {
  const { name, surname, email, accepted } = req.body || {};
  if (!name || !surname || !email || !accepted)
    return res.status(400).json({ error: "Missing required fields" });

  const userId = uuidv4();
  console.log(`🟢 User logged in: ${name} ${surname} (${email}) — ID: ${userId}`);
  return res.json({ userId });
});

/* -------------------- INDUSTRIES -------------------- */
router.get("/api/industries", async (_req, res) => {
  try {
    const [rows] = await pool.query("SELECT Industry FROM Industry ORDER BY Industry");
    res.json(rows);
  } catch (err) {
    console.error("DB error /api/industries:", err);
    res.status(500).json({ error: "Failed to load industries" });
  }
});

/* -------------------- FUELS -------------------- */
router.get("/api/fuels", async (_req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM Fuels ORDER BY Fuel");
    res.json(rows);
  } catch (err) {
    console.error("DB error /api/fuels:", err);
    res.status(500).json({ error: "Failed to load fuels" });
  }
});

/* -------------------- RENEWABLES -------------------- */
router.get("/api/renewables", async (_req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT Renewable, kWh, MWh, GWh FROM Renewables ORDER BY Renewable"
    );
    res.json(rows);
  } catch (err) {
    console.error("DB error /api/renewables:", err);
    res.status(500).json({ error: "Failed to load renewables" });
  }
});

/* -------------------- CLIENT INFO -------------------- */
router.post("/api/client-info", (req, res) => {
  const { userId, companyName, industry, activities, intent } = req.body || {};
  if (!userId || !industry || !activities || !intent)
    return res.status(400).json({ error: "Missing required fields" });

  console.log(`ℹ️ Client info received for user ${userId}:`, {
    companyName,
    industry,
    activities,
    intent,
  });

  res.json({ success: true, message: "Client info recorded" });
});

/* -------------------- FINAL RESULTS SAVE -------------------- */
router.post("/api/save-results", async (req, res) => {
  try {
    const { dataString } = req.body;
    if (!dataString) {
      console.error("❌ No dataString received.");
      return res.status(400).json({ error: "Missing dataString" });
    }

    // Split data string into individual values
    const parts = dataString.split("|").map(v => (v === "" ? null : v));

    console.log("==================================================");
    console.log("📦 FINAL COMBINED DATA STRING RECEIVED:");
    console.log(dataString);
    console.log("--------------------------------------------------");
    console.log(`Total segments in string: ${parts.length}`);
    console.log("==================================================");

    // Expected count for your table
    if (parts.length !== 53) {
      console.warn(`⚠️ Expected 53 columns, got ${parts.length}. Please check the order.`);
    }

    // Build the insert dynamically
    const sql = `
      INSERT INTO \`User Data\` (
        ID, Name, Surname, Email, Company, Industry, Activities, Intent,
        Electricity, \`Elec tCO2\`,
        Fuel1, \`Fuel1 Con\`, \`Fuel1 Meas\`, \`Fuel1 tCO2\`, \`Fuel1 tCH4\`, \`Fuel1 tN2O\`,
        Fuel2, \`Fuel2 Con\`, \`Fuel2 Meas\`, \`Fuel2 tCO2\`, \`Fuel2 tCH4\`, \`Fuel2 tN2O\`,
        Fuel3, \`Fuel3 Con\`, \`Fuel3 Meas\`, \`Fuel3 tCO2\`, \`Fuel3 tCH4\`, \`Fuel3 tN2O\`,
        Fuel4, \`Fuel4 Con\`, \`Fuel4 Meas\`, \`Fuel4 tCO2\`, \`Fuel4 tCH4\`, \`Fuel4 tN2O\`,
        Ren1, \`Ren1 Con\`, \`Ren1 Meas\`, \`Ren1 tCO2_of\`,
        Ren2, \`Ren2 Con\`, \`Ren2 Meas\`, \`Ren2 tCO2_of\`,
        Ren3, \`Ren3 Con\`, \`Ren3 Meas\`, \`Ren3 tCO2_of\`,
        \`CO2 credit\`,
        \`Tot tCO2\`, \`Tot tCH4\`, \`Tot tN2O\`, \`Tot tCO2_Eq\`, \`Tot tCO2_Of\`, \`Net tCO2_eq\`
      )
      VALUES (${parts.map(() => "?").join(", ")})
    `;

    const [result] = await pool.query(sql, parts);
    console.log(`✅ Data inserted successfully. Row ID: ${result.insertId}`);

    res.json({ success: true, insertedId: result.insertId });
  } catch (err) {
    console.error("❌ DB error saving results:", err);
    res.status(500).json({ error: "Database insert failed", detail: err.message });
  }
});

export default router;
