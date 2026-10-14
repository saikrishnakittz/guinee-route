const express = require("express");
const prisma = require("../prisma");

const router = express.Router();

// GET /api/v1/damage-reports
router.get("/", async (req, res) => {
  try {
    const { region, severity, status, search } = req.query;
    const where = {};

    if (region && region !== "All Regions") where.region = region;
    if (severity) where.severity = severity;
    if (status) where.status = status;
    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { reportCode: { contains: q, mode: "insensitive" } },
        { road: { contains: q, mode: "insensitive" } },
        { category: { contains: q, mode: "insensitive" } },
        { agentName: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
      ];
    }

    const reports = await prisma.damageReport.findMany({
      where,
      orderBy: { id: "desc" },
      include: {
        agent: {
          select: {
            id: true,
            name: true,
            badgeNumber: true,
          },
        },
      },
    });

    res.json({ success: true, data: reports });
  } catch (error) {
    console.error("Fetch damage reports error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch damage reports" });
  }
});

// POST /api/v1/damage-reports
router.post("/", async (req, res) => {
  try {
    const {
      reportCode,
      road,
      category,
      severity = "Moderate",
      status = "Reported",
      region = "Kindia",
      description,
      agentName,
      agentId,
    } = req.body;

    const code = reportCode || `26-04-${Math.floor(100 + Math.random() * 900)}`;

    const report = await prisma.damageReport.create({
      data: {
        reportCode: code,
        road,
        category,
        severity,
        status,
        region,
        description,
        agentName,
        agentId: agentId ? Number(agentId) : undefined,
      },
    });

    res.status(201).json({ success: true, data: report });
  } catch (error) {
    console.error("Create damage report error:", error);
    res.status(500).json({ success: false, message: "Failed to create damage report" });
  }
});

// PATCH /api/v1/damage-reports/:id/status
router.patch("/:id/status", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { status } = req.body;

    const updated = await prisma.damageReport.update({
      where: { id },
      data: { status },
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    console.error("Update damage report status error:", error);
    res.status(500).json({ success: false, message: "Failed to update damage report status" });
  }
});

module.exports = router;
