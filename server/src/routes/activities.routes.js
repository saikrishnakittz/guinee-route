const express = require("express");
const prisma = require("../prisma");

const router = express.Router();

// GET /api/v1/activities
router.get("/", async (req, res) => {
  try {
    const { region, type, limit = 20 } = req.query;
    const where = {};

    if (region && region !== "All Regions") where.region = region;
    if (type) where.type = type;

    const activities = await prisma.activityLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: Number(limit) || 20,
    });

    res.json({ success: true, data: activities });
  } catch (error) {
    console.error("Fetch activities error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch activities" });
  }
});

// POST /api/v1/activities
router.post("/", async (req, res) => {
  try {
    const { type, title, description, region = "Kindia" } = req.body;

    const activity = await prisma.activityLog.create({
      data: {
        type,
        title,
        description,
        region,
      },
    });

    res.status(201).json({ success: true, data: activity });
  } catch (error) {
    console.error("Create activity error:", error);
    res.status(500).json({ success: false, message: "Failed to create activity log" });
  }
});

module.exports = router;
