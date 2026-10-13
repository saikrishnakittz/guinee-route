const express = require("express");
const prisma = require("../prisma");

const router = express.Router();

const allowedStatuses = ["ON_DUTY", "ON_MISSION", "BREAK", "OFFLINE"];

// GET /api/v1/agents/live
router.get("/live", async (req, res) => {
  try {
    const agents = await prisma.agent.findMany({
      orderBy: { id: "asc" },
      include: {
        missions: {
          where: { status: "ACTIVE" },
          select: {
            id: true,
            missionCode: true,
            roadName: true,
            totalKm: true,
            coveredKm: true,
            status: true,
          },
        },
      },
    });

    res.json({ success: true, data: agents });
  } catch (error) {
    console.error("Fetch agents error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch agents",
    });
  }
});

// PATCH /api/v1/agents/:id/status
router.patch("/:id/status", async (req, res) => {
  const id = Number(req?.params?.id);
  const { status } = req.body;

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid agent ID",
    });
  }

  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: "Invalid status",
      allowedStatuses,
    });
  }

  try {
    const agent = await prisma.agent.update({
      where: { id },
      data: { status },
    });

    res.json({
      success: true,
      message: "Agent status updated",
      data: agent,
    });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({
        success: false,
        message: "Agent not found",
      });
    }

    console.error("Update agent status error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update agent status",
    });
  }
});

module.exports = router;
