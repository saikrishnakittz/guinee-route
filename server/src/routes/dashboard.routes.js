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
      paidFines,
      allFines,
      cashTodaySum,
      damageStats,
      criticalDamages,
      missionsKm,
      pendingSyncAgents,
    ] = await Promise.all([
      prisma.agent.count(),
      prisma.agent.count({
        where: {
          status: { in: ["ON_DUTY", "ON_MISSION", "INSPECTING"] },
        },
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
      prisma.violation.aggregate({
        where: { paid: true },
        _sum: { fineAmountGnf: true },
      }),
      prisma.violation.aggregate({
        _sum: { fineAmountGnf: true },
      }),
      prisma.agent.aggregate({
        _sum: { cashTodayGnf: true },
      }),
      prisma.damageReport ? prisma.damageReport.count().catch(() => 0) : Promise.resolve(0),
      prisma.damageReport
        ? prisma.damageReport.count({
            where: { severity: "Critical" },
          }).catch(() => 0)
        : Promise.resolve(0),
      prisma.mission.aggregate({
        where: { status: "ACTIVE" },
        _sum: { coveredKm: true, totalKm: true },
      }),
      prisma.agent.aggregate({
        _sum: { pendingRecords: true },
      }),
    ]);

    const coveredKm = missionsKm._sum.coveredKm || 0;
    const totalKm = missionsKm._sum.totalKm || 1;
    const coveragePercent = Math.min(100, Math.round((coveredKm / totalKm) * 100));

    res.json({
      success: true,
      data: {
        totalAgents,
        agentsOnDuty,
        activeMissions,
        offlineAgents,
        totalViolations,
        unpaidFinesGnf: unpaidFines._sum.fineAmountGnf || 0,
        paidFinesGnf: paidFines._sum.fineAmountGnf || 0,
        totalFinesGnf: allFines._sum.fineAmountGnf || 0,
        totalCashTodayGnf: cashTodaySum._sum.cashTodayGnf || 0,
        totalDamageReports: damageStats,
        criticalHazardsCount: criticalDamages,
        coveredKm: Number(coveredKm.toFixed(1)),
        totalKm: Number(totalKm.toFixed(1)),
        coveragePercent,
        unsyncedRecordsCount: pendingSyncAgents._sum.pendingRecords || 0,
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

// GET /api/v1/dashboard/overview
// Returns consolidated live data matching newly added UI sections with query filters
router.get("/overview", async (req, res) => {
  try {
    const {
      search = "",
      region = "All Regions",
      supervisor = "All Supervisors",
      status = "Agent Status",
      scope = "All Guinea",
    } = req.query;

    // Build agent filters
    const agentWhere = {};
    if (region && region !== "All Regions") {
      agentWhere.region = region;
    }
    if (supervisor && supervisor !== "All Supervisors") {
      agentWhere.supervisor = supervisor;
    }
    if (scope && scope !== "All Guinea") {
      agentWhere.scope = scope;
    }
    if (status && status !== "Agent Status" && status !== "ALL") {
      agentWhere.status = status;
    }
    if (search.trim()) {
      const q = search.trim();
      agentWhere.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { badgeNumber: { contains: q, mode: "insensitive" } },
        { role: { contains: q, mode: "insensitive" } },
        { location: { contains: q, mode: "insensitive" } },
      ];
    }

    // Build mission filters
    const missionWhere = { status: "ACTIVE" };
    if (region && region !== "All Regions") {
      missionWhere.region = region;
    }
    if (supervisor && supervisor !== "All Supervisors") {
      missionWhere.supervisor = supervisor;
    }
    if (search.trim()) {
      const q = search.trim();
      missionWhere.OR = [
        { missionCode: { contains: q, mode: "insensitive" } },
        { roadName: { contains: q, mode: "insensitive" } },
        { route: { contains: q, mode: "insensitive" } },
        { agent: { name: { contains: q, mode: "insensitive" } } },
      ];
    }

    // Build damage report filters
    const damageWhere = {};
    if (region && region !== "All Regions") {
      damageWhere.region = region;
    }
    if (search.trim()) {
      const q = search.trim();
      damageWhere.OR = [
        { reportCode: { contains: q, mode: "insensitive" } },
        { road: { contains: q, mode: "insensitive" } },
        { category: { contains: q, mode: "insensitive" } },
        { agentName: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
      ];
    }

    // Build violation filters
    const violationWhere = {};
    if (region && region !== "All Regions") {
      violationWhere.region = region;
    }
    if (search.trim()) {
      const q = search.trim();
      violationWhere.OR = [
        { violationCode: { contains: q, mode: "insensitive" } },
        { violationType: { contains: q, mode: "insensitive" } },
        { roadName: { contains: q, mode: "insensitive" } },
        { agentName: { contains: q, mode: "insensitive" } },
        { vehicle: { licensePlate: { contains: q, mode: "insensitive" } } },
      ];
    }

    // Build activity filters
    const activityWhere = {};
    if (region && region !== "All Regions") {
      activityWhere.region = region;
    }
    if (search.trim()) {
      const q = search.trim();
      activityWhere.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
      ];
    }

    // Parallel fetch from PostgreSQL via Prisma
    const [
      agents,
      missions,
      damageReports,
      violations,
      activityLogs,
      syncHealthAgents,
    ] = await Promise.all([
      prisma.agent.findMany({
        where: agentWhere,
        orderBy: { id: "asc" },
        include: {
          missions: {
            where: { status: "ACTIVE" },
            include: { violations: true },
          },
        },
      }),
      prisma.mission.findMany({
        where: missionWhere,
        orderBy: { id: "asc" },
        include: {
          agent: true,
          violations: true,
        },
      }),
      prisma.damageReport
        ? prisma.damageReport.findMany({
            where: damageWhere,
            orderBy: { id: "desc" },
            include: { agent: true },
          }).catch(() => [])
        : Promise.resolve([]),
      prisma.violation.findMany({
        where: violationWhere,
        orderBy: { id: "desc" },
        include: {
          vehicle: true,
          mission: true,
        },
      }),
      prisma.activityLog
        ? prisma.activityLog.findMany({
            where: activityWhere,
            orderBy: { createdAt: "desc" },
            take: 10,
          }).catch(() => [])
        : Promise.resolve([]),
      prisma.agent.findMany({
        where: {
          OR: [
            { status: "OFFLINE" },
            { pendingRecords: { gt: 0 } },
            { connectionStatus: "Offline" },
          ],
        },
        orderBy: { pendingRecords: "desc" },
        include: {
          missions: {
            where: { status: "ACTIVE" },
            select: { missionCode: true },
          },
        },
      }),
    ]);

    // Format missions list for frontend UI
    const formattedMissions = missions.map((m) => {
      const progress = m.totalKm > 0 ? Math.round((m.coveredKm / m.totalKm) * 100) : 0;
      return {
        id: m.missionCode.replace("GR-MSN-2026-", ""),
        code: m.missionCode,
        agentName: m.agent ? m.agent.name : "Unassigned",
        agentId: m.agentId,
        road: m.roadName,
        route: m.route || `${m.roadName} Corridor`,
        region: m.region,
        supervisor: m.supervisor || (m.agent ? m.agent.supervisor : "National Command"),
        progress,
        coveredKm: m.coveredKm,
        totalKm: m.totalKm,
        status: m.status === "ACTIVE" ? "In Progress" : m.status,
        startedAt: m.startedAt,
        violationsCount: m.violations.length,
      };
    });

    // Format damage reports for UI
    const formattedDamages = (damageReports || []).map((d) => ({
      id: d.reportCode,
      road: d.road,
      agent: d.agentName || (d.agent ? d.agent.name : "Patrol"),
      category: d.category,
      severity: d.severity,
      sevClass:
        d.severity === "Critical"
          ? "sev-critical"
          : d.severity === "Severe"
          ? "sev-severe"
          : "sev-moderate",
      time: new Date(d.createdAt).toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      status: d.status,
      statusClass:
        d.status === "Validated"
          ? "status-validated"
          : d.status === "Reported"
          ? "status-reported"
          : "status-awaiting",
      region: d.region,
      description: d.description,
    }));

    // Format violations for UI
    const formattedViolations = violations.map((v) => ({
      id: v.violationCode,
      agent: v.agentName || "Officer",
      vehicle: v.vehicle ? v.vehicle.licensePlate : "Unknown",
      road: v.roadName || (v.mission ? v.mission.roadName : "RN1"),
      type: v.violationType,
      severity: v.severity,
      sevClass:
        v.severity === "Very Severe" || v.severity === "Critical"
          ? "sev-critical"
          : v.severity === "Severe"
          ? "sev-severe"
          : "sev-moderate",
      fine: `GNF ${v.fineAmountGnf.toLocaleString()}`,
      fineAmountGnf: v.fineAmountGnf,
      payment: v.paymentStatus,
      paid: v.paid,
      paymentClass:
        v.paymentStatus === "Paid Cash" || v.paid
          ? "status-available"
          : v.paymentStatus === "Partially Paid"
          ? "status-on-mission"
          : "status-awaiting",
      region: v.region,
    }));

    // Format sync health list for UI
    const formattedSyncHealth = syncHealthAgents.map((ag) => {
      const activeMsn = ag.missions[0] ? ag.missions[0].missionCode.replace("GR-MSN-2026-", "…") : "—";
      return {
        agent: ag.name,
        badge: ag.badgeNumber,
        mission: activeMsn,
        lastSync: ag.connectionStatus === "Offline" ? "18 min ago" : "9 min ago",
        pending: `${ag.pendingRecords} records`,
        pendingRecords: ag.pendingRecords,
        status: ag.connectionStatus === "Offline" ? "Offline" : "Pending Sync",
        statusClass: ag.connectionStatus === "Offline" ? "sync-offline" : "sync-pending",
        region: ag.region,
      };
    });

    // Format activity logs for UI
    const formattedActivities = activityLogs.map((a) => {
      let iconClass = "act-mission";
      if (a.type === "damage") iconClass = "act-damage";
      else if (a.type === "violation") iconClass = "act-violation";
      else if (a.type === "cash") iconClass = "act-cash";
      else if (a.type === "road" || a.type === "emergency") iconClass = "act-emergency";
      else if (a.type === "offline") iconClass = "act-offline";

      return {
        id: a.activityKey || `act-${a.id}`,
        time: new Date(a.createdAt).toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        type: a.type,
        iconClass,
        title: a.title,
        desc: a.description,
        region: a.region,
      };
    });

    res.json({
      success: true,
      data: {
        agents,
        missions: formattedMissions,
        damageReports: formattedDamages,
        violations: formattedViolations,
        syncHealth: formattedSyncHealth,
        recentActivities: formattedActivities,
      },
    });
  } catch (error) {
    console.error("Dashboard overview error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard overview data",
    });
  }
});

module.exports = router;

