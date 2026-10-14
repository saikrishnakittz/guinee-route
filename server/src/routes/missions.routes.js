const express = require("express");
const prisma = require("../prisma");

const router = express.Router();

// GET /api/v1/missions
router.get("/", async (req, res) => {
  try {
    const { status, region, supervisor, search } = req.query;
    const where = {};

    if (status) {
      where.status = status;
    }
    if (region && region !== "All Regions") {
      where.region = region;
    }
    if (supervisor && supervisor !== "All Supervisors") {
      where.supervisor = supervisor;
    }
    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { missionCode: { contains: q, mode: "insensitive" } },
        { roadName: { contains: q, mode: "insensitive" } },
        { route: { contains: q, mode: "insensitive" } },
        { agent: { name: { contains: q, mode: "insensitive" } } },
      ];
    }

    const missions = await prisma.mission.findMany({
      where,
      orderBy: { id: "asc" },
      include: {
        agent: {
          select: {
            id: true,
            name: true,
            badgeNumber: true,
            role: true,
            status: true,
            supervisor: true,
            region: true,
            lat: true,
            lng: true,
          },
        },
        violations: true,
      },
    });

    res.json({ success: true, data: missions });
  } catch (error) {
    console.error("Fetch missions error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch missions" });
  }
});

// GET /api/v1/missions/:id
router.get("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const mission = await prisma.mission.findFirst({
      where: {
        OR: [
          { id: Number.isNaN(id) ? undefined : id },
          { missionCode: req.params.id },
        ],
      },
      include: {
        agent: true,
        violations: {
          include: {
            vehicle: true,
          },
        },
      },
    });

    if (!mission) {
      return res.status(404).json({ success: false, message: "Mission not found" });
    }

    res.json({ success: true, data: mission });
  } catch (error) {
    console.error("Fetch mission error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch mission details" });
  }
});

module.exports = router;
