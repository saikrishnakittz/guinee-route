
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  console.log("Starting GuinéeRoute database seed...");

  // 1. Create agents
  const agentData = [
    {
      badgeNumber: "AGT-1048",
      name: "Mamadou Diallo",
      status: "ON_MISSION",
      lat: 9.705,
      lng: -13.385,
    },
    {
      badgeNumber: "AGT-1049",
      name: "Fatou Camara",
      status: "ON_DUTY",
      lat: 9.706,
      lng: -13.37,
    },
    {
      badgeNumber: "AGT-1050",
      name: "Ibrahima Bah",
      status: "BREAK",
      lat: 9.715,
      lng: -13.36,
    },
    {
      badgeNumber: "AGT-1051",
      name: "Aissatou Barry",
      status: "OFFLINE",
      lat: 9.72,
      lng: -13.35,
    },
    {
      badgeNumber: "AGT-1052",
      name: "Alpha Camara",
      status: "ON_MISSION",
      lat: 9.725,
      lng: -13.34,
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

  console.log(`Agents seeded: ${agentData.length}`);

  // 2. Create missions
  const missionData = [
    {
      missionCode: "GR-MSN-2026-00984",
      roadName: "RN1",
      totalKm: 18.6,
      coveredKm: 7.4,
      status: "ACTIVE",
      agentId: agents["AGT-1048"].id,
    },
    {
      missionCode: "GR-MSN-2026-00985",
      roadName: "RN1",
      totalKm: 12.0,
      coveredKm: 3.2,
      status: "ACTIVE",
      agentId: agents["AGT-1052"].id,
    },
    {
      missionCode: "GR-MSN-2026-00986",
      roadName: "RN1",
      totalKm: 15.0,
      coveredKm: 15.0,
      status: "COMPLETED",
      agentId: agents["AGT-1049"].id,
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

  console.log(`Missions seeded: ${missionData.length}`);

  // 3. Create vehicles
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
  ];

  const vehicles = {};

  for (const data of vehicleData) {
    vehicles[data.licensePlate] = await prisma.vehicle.upsert({
      where: { licensePlate: data.licensePlate },
      update: data,
      create: data,
    });
  }

  console.log(`Vehicles seeded: ${vehicleData.length}`);

  // 4. Create violations
  const violationData = [
    {
      violationCode: "GR-VIO-001",
      violationType: "Speeding",
      fineAmountGnf: 500000,
      paid: false,
      vehicleId: vehicles["GN-1234-AA"].id,
      missionId: missions["GR-MSN-2026-00984"].id,
    },
    {
      violationCode: "GR-VIO-002",
      violationType: "Expired Registration",
      fineAmountGnf: 300000,
      paid: false,
      vehicleId: vehicles["GN-1234-AA"].id,
      missionId: missions["GR-MSN-2026-00984"].id,
    },
    {
      violationCode: "GR-VIO-003",
      violationType: "Unsafe Overtaking",
      fineAmountGnf: 200000,
      paid: true,
      vehicleId: vehicles["GN-5678-BB"].id,
      missionId: missions["GR-MSN-2026-00985"].id,
    },
  ];

  for (const data of violationData) {
    await prisma.violation.upsert({
      where: { violationCode: data.violationCode },
      update: data,
      create: data,
    });
  }

  console.log(`Violations seeded: ${violationData.length}`);
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
