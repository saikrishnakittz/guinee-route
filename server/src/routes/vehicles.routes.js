const express = require("express");
const prisma = require("../prisma");

const router = express.Router();

// GET /api/v1/vehicles/lookup?plate=GN-1234-AA
router.get("/lookup", async (req, res) => {
  const plate = String(req.query.plate || "").trim();

  if (!plate) {
    return res.status(400).json({
      success: false,
      message: "Vehicle plate is required",
    });
  }

  try {
    const vehicle = await prisma.vehicle.findUnique({
      where: {
        licensePlate: plate.toUpperCase(),
      },
      include: {
        violations: {
          orderBy: { createdAt: "desc" },
          include: {
            mission: {
              select: {
                missionCode: true,
                roadName: true,
                status: true,
              },
            },
          },
        },
      },
    });

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found",
      });
    }

    const unpaidFinesGnf = vehicle.violations
      .filter((violation) => !violation.paid)
      .reduce((total, violation) => total + violation.fineAmountGnf, 0);

    res.json({
      success: true,
      data: {
        ...vehicle,
        unpaidFinesGnf,
      },
    });
  } catch (error) {
    console.error("Vehicle lookup error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to look up vehicle",
    });
  }
});

module.exports = router;
