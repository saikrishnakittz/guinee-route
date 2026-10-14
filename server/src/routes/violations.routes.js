const express = require("express");
const prisma = require("../prisma");

const router = express.Router();

// GET /api/v1/violations
router.get("/", async (req, res) => {
  try {
    const { region, severity, paid, search } = req.query;
    const where = {};

    if (region && region !== "All Regions") where.region = region;
    if (severity) where.severity = severity;
    if (paid !== undefined) where.paid = paid === "true";
    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { violationCode: { contains: q, mode: "insensitive" } },
        { violationType: { contains: q, mode: "insensitive" } },
        { roadName: { contains: q, mode: "insensitive" } },
        { agentName: { contains: q, mode: "insensitive" } },
        { vehicle: { licensePlate: { contains: q, mode: "insensitive" } } },
      ];
    }

    const violations = await prisma.violation.findMany({
      where,
      orderBy: { id: "desc" },
      include: {
        vehicle: true,
        mission: {
          select: {
            missionCode: true,
            roadName: true,
          },
        },
      },
    });

    res.json({ success: true, data: violations });
  } catch (error) {
    console.error("Fetch violations error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch violations" });
  }
});

// PATCH /api/v1/violations/:id/payment
router.patch("/:id/payment", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { paid, paymentStatus, paymentMethod } = req.body;

    const updated = await prisma.violation.update({
      where: { id },
      data: {
        paid: paid !== undefined ? Boolean(paid) : true,
        paymentStatus: paymentStatus || "Paid Cash",
        paymentMethod: paymentMethod || "Cash",
      },
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    console.error("Update violation payment error:", error);
    res.status(500).json({ success: false, message: "Failed to update violation payment" });
  }
});

module.exports = router;
