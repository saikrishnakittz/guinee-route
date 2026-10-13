const express = require("express");
const prisma = require("../prisma");

const router = express.Router();

// GET /api/v1/dashboard/stats
router.get("/stats", async (req, res) => {
  try {
    const [
      totalAgents,
      agentsOnDuty,
      activeMissions,
      offlineAgents,
      totalViolations,
      unpaidFines,
    ] = await Promise.all([
      prisma.agent.count(),
      prisma.agent.count({
        where: { status: "ON_DUTY" },
      }),
      prisma.mission.count({
        where: { status: "ACTIVE" },
      }),
      prisma.agent.count({
        where: { status: "OFFLINE" },
      }),
      prisma.violation.count(),
      prisma.violation.aggregate({
        where: { paid: false },
        _sum: { fineAmountGnf: true },
      }),
    ]);

    res.json({
      success: true,
      data: {
        totalAgents,
        agentsOnDuty,
        activeMissions,
        offlineAgents,
        totalViolations,
        unpaidFinesGnf: unpaidFines._sum.fineAmountGnf || 0,
      },
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard statistics",
    });
  }
});

module.exports = router;
