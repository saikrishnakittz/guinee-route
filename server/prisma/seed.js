
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  console.log("Starting GuinéeRoute database seed...");

  const agentData = [
    {
      badgeNumber: "AGT-1048",
      name: "Mamadou Diallo",
      status: "ON_MISSION",
      role: "Field Inspector",
      supervisor: "Ibrahima Camara (National)",
      region: "Kindia",
      scope: "National Corridors (RN1, RN3)",
      location: "RN1 Coyah",
      dutyStart: "08:02",
      cashTodayGnf: 350000,
      gpsActive: true,
      connectionStatus: "Online",
      pendingRecords: 0,
      avatarBg: "#2563eb",
      lat: 9.705,
      lng: -13.385,
    },
    {
      badgeNumber: "AGT-1049",
      name: "Fatou Camara",
      status: "ON_DUTY",
      role: "Patrol Officer",
      supervisor: "Fatoumata Barry (Kindia)",
      region: "Kindia",
      scope: "Maritime Guinea",
      location: "Kindia Center",
      dutyStart: "08:15",
      cashTodayGnf: 120000,
      gpsActive: true,
      connectionStatus: "Online",
      pendingRecords: 0,
      avatarBg: "#10b981",
      lat: 9.706,
      lng: -13.37,
    },
    {
      badgeNumber: "AGT-1050",
      name: "Ibrahima Bah",
      status: "BREAK",
      role: "Field Inspector",
      supervisor: "Amadou Diallo (Northern)",
      region: "Boké",
      scope: "All Guinea",
      location: "Boké Corridor",
      dutyStart: "07:30",
      cashTodayGnf: 210000,
      gpsActive: true,
      connectionStatus: "Online",
      pendingRecords: 0,
      avatarBg: "#f59e0b",
      lat: 9.715,
      lng: -13.36,
    },
    {
      badgeNumber: "AGT-1051",
      name: "Aissatou Barry",
      status: "OFFLINE",
      role: "Field Inspector",
      supervisor: "Ibrahima Camara (National)",
      region: "Kindia",
      scope: "National Corridors (RN1, RN3)",
      location: "Coyah Depot",
      dutyStart: "06:45",
      cashTodayGnf: 0,
      gpsActive: false,
      connectionStatus: "Offline",
      pendingRecords: 1,
      avatarBg: "#64748b",
      lat: 9.72,
      lng: -13.35,
    },
    {
      badgeNumber: "AGT-1052",
      name: "Aissatou Bah",
      status: "INSPECTING",
      role: "Field Inspector",
      supervisor: "Kadiatou Touré (Conakry Urban)",
      region: "Conakry",
      scope: "Conakry Metro Zone",
      location: "R. Le Prince",
      dutyStart: "08:44",
      cashTodayGnf: 180000,
      gpsActive: true,
      connectionStatus: "Online",
      pendingRecords: 0,
      avatarBg: "#0284c7",
      lat: 9.612,
      lng: -13.62,
    },
    {
      badgeNumber: "AGT-1061",
      name: "Alpha Condé",
      status: "OFFLINE",
      role: "Field Inspector",
      supervisor: "Fodé Soumah (Maritime)",
      region: "Kindia",
      scope: "National Corridors (RN1, RN3)",
      location: "Dubréka",
      dutyStart: "07:11",
      cashTodayGnf: 420000,
      gpsActive: false,
      connectionStatus: "Offline",
      pendingRecords: 3,
      avatarBg: "#475569",
      lat: 9.79,
      lng: -13.52,
    },
    {
      badgeNumber: "AGT-1067",
      name: "Mariama Camara",
      status: "AVAILABLE",
      role: "Patrol Officer",
      supervisor: "Kadiatou Touré (Conakry Urban)",
      region: "Conakry",
      scope: "Conakry Metro Zone",
      location: "Conakry",
      dutyStart: "08:31",
      cashTodayGnf: 0,
      gpsActive: true,
      connectionStatus: "Online",
      pendingRecords: 2,
      avatarBg: "#16a34a",
      lat: 9.537,
      lng: -13.678,
    },
    {
      badgeNumber: "AGT-1065",
      name: "Oumar Kouyaté",
      status: "ON_MISSION",
      role: "Field Inspector",
      supervisor: "Fatoumata Barry (Kindia)",
      region: "Kindia",
      scope: "National Corridors (RN1, RN3)",
      location: "RN3 Kindia",
      dutyStart: "07:50",
      cashTodayGnf: 280000,
      gpsActive: true,
      connectionStatus: "Online",
      pendingRecords: 0,
      avatarBg: "#9333ea",
      lat: 9.85,
      lng: -13.1,
    },
    {
      badgeNumber: "AGT-1070",
      name: "Sékou Touré",
      status: "ON_MISSION",
      role: "Patrol Officer",
      supervisor: "Kadiatou Touré (Conakry Urban)",
      region: "Conakry",
      scope: "Conakry Metro Zone",
      location: "R. Industrielle",
      dutyStart: "08:10",
      cashTodayGnf: 390000,
      gpsActive: true,
      connectionStatus: "Online",
      pendingRecords: 0,
      avatarBg: "#d97706",
      lat: 9.56,
      lng: -13.64,
    },
  ];

  const agents = {};

  for (const data of agentData) {
    agents[data.badgeNumber] = await prisma.agent.upsert({
      where: { badgeNumber: data.badgeNumber },
      update: data,
      create: data,
    });
  }

  console.log(`Agents seeded/updated: ${agentData.length}`);

  // 2. Create or update missions
  const missionData = [
    {
      missionCode: "GR-MSN-2026-00984",
      roadName: "RN1",
      route: "Coyah Junction → Dubréka",
      region: "Kindia",
      supervisor: "Ibrahima Camara (National)",
      totalKm: 18.6,
      coveredKm: 7.4,
      status: "ACTIVE",
      agentId: agents["AGT-1048"].id,
    },
    {
      missionCode: "GR-MSN-2026-00985",
      roadName: "RN1",
      route: "Coyah → Tanéné",
      region: "Kindia",
      supervisor: "Fodé Soumah (Maritime)",
      totalKm: 12.0,
      coveredKm: 3.2,
      status: "ACTIVE",
      agentId: agents["AGT-1061"] ? agents["AGT-1061"].id : agents["AGT-1048"].id,
    },
    {
      missionCode: "GR-MSN-2026-00986",
      roadName: "RN1",
      route: "Conakry → Coyah",
      region: "Conakry",
      supervisor: "Fatoumata Barry (Kindia)",
      totalKm: 15.0,
      coveredKm: 15.0,
      status: "COMPLETED",
      agentId: agents["AGT-1049"].id,
    },
    {
      missionCode: "GR-MSN-2026-00991",
      roadName: "R. Le Prince",
      route: "Hamdallaye → Sonfonia",
      region: "Conakry",
      supervisor: "Kadiatou Touré (Conakry Urban)",
      totalKm: 15.0,
      coveredKm: 10.2,
      status: "ACTIVE",
      agentId: agents["AGT-1052"].id,
    },
    {
      missionCode: "GR-MSN-2026-00988",
      roadName: "RN3",
      route: "Kindia → Mamou",
      region: "Kindia",
      supervisor: "Fatoumata Barry (Kindia)",
      totalKm: 20.0,
      coveredKm: 11.0,
      status: "ACTIVE",
      agentId: agents["AGT-1065"].id,
    },
    {
      missionCode: "GR-MSN-2026-00990",
      roadName: "R. Industrielle",
      route: "Zone Ind. → Port",
      region: "Conakry",
      supervisor: "Kadiatou Touré (Conakry Urban)",
      totalKm: 10.0,
      coveredKm: 8.0,
      status: "ACTIVE",
      agentId: agents["AGT-1070"].id,
    },
    {
      missionCode: "GR-MSN-2026-00987",
      roadName: "RN1",
      route: "Dubréka → Tanéné",
      region: "Kindia",
      supervisor: "Fodé Soumah (Maritime)",
      totalKm: 22.0,
      coveredKm: 12.1,
      status: "ACTIVE",
      agentId: agents["AGT-1061"].id,
    },
  ];

  const missions = {};

  for (const data of missionData) {
    missions[data.missionCode] = await prisma.mission.upsert({
      where: { missionCode: data.missionCode },
      update: data,
      create: data,
    });
  }

  console.log(`Missions seeded/updated: ${missionData.length}`);

  // 3. Create or update vehicles
  const vehicleData = [
    {
      licensePlate: "GN-1234-AA",
      owner: "Amadou Diallo",
    },
    {
      licensePlate: "GN-5678-BB",
      owner: "Mariama Camara",
    },
    {
      licensePlate: "GN-9012-CC",
      owner: "Moussa Bah",
    },
    {
      licensePlate: "RC-8245-AB",
      owner: "Transport Express Guinée",
    },
    {
      licensePlate: "RC-1920-CC",
      owner: "Société Minière Boké",
    },
    {
      licensePlate: "RC-4102-DD",
      owner: "Conakry Logistique",
    },
    {
      licensePlate: "TransGuinée SA",
      owner: "TransGuinée SA Fleet",
    },
  ];

  const vehicles = {};

  for (const data of vehicleData) {
    vehicles[data.licensePlate] = await prisma.vehicle.upsert({
      where: { licensePlate: data.licensePlate },
      update: data,
      create: data,
    });
  }

  console.log(`Vehicles seeded/updated: ${vehicleData.length}`);

  // 4. Create or update violations
  const violationData = [
    {
      violationCode: "GR-VIO-001",
      violationType: "Speeding",
      fineAmountGnf: 500000,
      paid: false,
      severity: "Moderate",
      paymentMethod: "Mobile Money",
      paymentStatus: "Issued",
      roadName: "RN1",
      region: "Kindia",
      agentName: "M. Diallo",
      vehicleId: vehicles["GN-1234-AA"].id,
      missionId: missions["GR-MSN-2026-00984"].id,
    },
    {
      violationCode: "GR-VIO-002",
      violationType: "Expired Registration",
      fineAmountGnf: 300000,
      paid: false,
      severity: "Moderate",
      paymentMethod: "Cash",
      paymentStatus: "Issued",
      roadName: "RN1",
      region: "Kindia",
      agentName: "M. Diallo",
      vehicleId: vehicles["GN-1234-AA"].id,
      missionId: missions["GR-MSN-2026-00984"].id,
    },
    {
      violationCode: "GR-VIO-003",
      violationType: "Unsafe Overtaking",
      fineAmountGnf: 200000,
      paid: true,
      severity: "Moderate",
      paymentMethod: "Cash",
      paymentStatus: "Paid Cash",
      roadName: "RN1",
      region: "Kindia",
      agentName: "A. Camara",
      vehicleId: vehicles["GN-5678-BB"].id,
      missionId: missions["GR-MSN-2026-00985"].id,
    },
    {
      violationCode: "26-01844",
      violationType: "Unauthorized Heavy Vehicle",
      fineAmountGnf: 750000,
      paid: true,
      severity: "Severe",
      paymentMethod: "Cash",
      paymentStatus: "Paid Cash",
      roadName: "RN1",
      region: "Kindia",
      agentName: "M. Diallo",
      vehicleId: vehicles["RC-8245-AB"].id,
      missionId: missions["GR-MSN-2026-00984"].id,
    },
    {
      violationCode: "26-01843",
      violationType: "Road Occupation",
      fineAmountGnf: 300000,
      paid: false,
      severity: "Moderate",
      paymentMethod: "Mobile Money",
      paymentStatus: "Issued",
      roadName: "R. Le Prince",
      region: "Conakry",
      agentName: "A. Bah",
      vehicleId: vehicles["TransGuinée SA"].id,
      missionId: missions["GR-MSN-2026-00991"].id,
    },
    {
      violationCode: "26-01841",
      violationType: "Overloaded Vehicle",
      fineAmountGnf: 1200000,
      paid: false,
      severity: "Very Severe",
      paymentMethod: "Cash",
      paymentStatus: "Partially Paid",
      roadName: "RN3",
      region: "Kindia",
      agentName: "O. Kouyaté",
      vehicleId: vehicles["RC-1920-CC"].id,
      missionId: missions["GR-MSN-2026-00988"].id,
    },
    {
      violationCode: "26-01839",
      violationType: "Unsecured Cargo",
      fineAmountGnf: 450000,
      paid: false,
      severity: "Moderate",
      paymentMethod: "Bank",
      paymentStatus: "Issued",
      roadName: "R. Industrielle",
      region: "Conakry",
      agentName: "S. Touré",
      vehicleId: vehicles["RC-4102-DD"].id,
      missionId: missions["GR-MSN-2026-00990"].id,
    },
  ];

  for (const data of violationData) {
    await prisma.violation.upsert({
      where: { violationCode: data.violationCode },
      update: data,
      create: data,
    });
  }

  console.log(`Violations seeded/updated: ${violationData.length}`);

  // 5. Create or update damage reports
  const damageData = [
    {
      reportCode: "26-04-128",
      road: "RN1",
      category: "Road Surface",
      severity: "Severe",
      status: "Reported",
      region: "Kindia",
      description: "Deep pothole cluster km 7.4 near Coyah junction",
      agentName: "M. Diallo",
      agentId: agents["AGT-1048"].id,
    },
    {
      reportCode: "26-04-127",
      road: "R. Le Prince",
      category: "Drainage",
      severity: "Moderate",
      status: "Validated",
      region: "Conakry",
      description: "Culvert obstruction causing street flooding",
      agentName: "A. Bah",
      agentId: agents["AGT-1052"].id,
    },
    {
      reportCode: "26-04-125",
      road: "RN3",
      category: "Bridge / Structure",
      severity: "Critical",
      status: "Awaiting Validation",
      region: "Kindia",
      description: "Structural bridge joint shift at km 14",
      agentName: "A. Sylla",
      agentId: agents["AGT-1065"].id,
    },
    {
      reportCode: "26-04-121",
      road: "R. Industrielle",
      category: "Pavement Erosion",
      severity: "Moderate",
      status: "Validated",
      region: "Conakry",
      description: "Heavy axle asphalt rutting along industrial lane",
      agentName: "S. Touré",
      agentId: agents["AGT-1070"].id,
    },
  ];

  for (const data of damageData) {
    await prisma.damageReport.upsert({
      where: { reportCode: data.reportCode },
      update: data,
      create: data,
    });
  }

  console.log(`Damage reports seeded: ${damageData.length}`);

  // 6. Create or update activity logs
  const activityData = [
    {
      activityKey: "act-1",
      type: "damage",
      title: "Damage report submitted",
      description: "Mamadou Diallo · DMG-2026-04128 · RN1",
      region: "Kindia",
    },
    {
      activityKey: "act-2",
      type: "mission",
      title: "Mission completed",
      description: "Aissatou Bah · GR-MSN-2026-00976",
      region: "Conakry",
    },
    {
      activityKey: "act-3",
      type: "violation",
      title: "Violation recorded · Unauthorized heavy vehicle",
      description: "RC-8245-AB · VIO-2026-01844 · RN1",
      region: "Kindia",
    },
    {
      activityKey: "act-4",
      type: "cash",
      title: "Cash reconciled",
      description: "Finance · GNF 850,000 · AGT-1041",
      region: "Kindia",
    },
    {
      activityKey: "act-5",
      type: "road",
      title: "Critical road blockage reported",
      description: "Coyah · RN1 · km 7.4",
      region: "Kindia",
    },
    {
      activityKey: "act-6",
      type: "offline",
      title: "Agent went offline during active mission",
      description: "Alpha Condé · AGT-1061 · GR-MSN-2026-00987",
      region: "Kindia",
    },
  ];

  for (const data of activityData) {
    const existing = await prisma.activityLog.findFirst({
      where: { activityKey: data.activityKey },
    });
    if (existing) {
      await prisma.activityLog.update({
        where: { id: existing.id },
        data,
      });
    } else {
      await prisma.activityLog.create({
        data,
      });
    }
  }

  console.log(`Activity logs seeded: ${activityData.length}`);
  console.log("GuinéeRoute database seed completed successfully!");
}

main()
  .catch((error) => {
    console.error("Database seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

