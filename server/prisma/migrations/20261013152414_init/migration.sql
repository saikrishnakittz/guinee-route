-- CreateEnum
CREATE TYPE "AgentStatus" AS ENUM ('ON_DUTY', 'ON_MISSION', 'BREAK', 'OFFLINE');

-- CreateEnum
CREATE TYPE "MissionStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'CANCELLED');

-- CreateTable
CREATE TABLE "agents" (
    "id" SERIAL NOT NULL,
    "badge_number" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "AgentStatus" NOT NULL DEFAULT 'ON_DUTY',
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "missions" (
    "id" SERIAL NOT NULL,
    "mission_code" TEXT NOT NULL,
    "road_name" TEXT NOT NULL DEFAULT 'RN1',
    "total_km" DOUBLE PRECISION NOT NULL,
    "covered_km" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" "MissionStatus" NOT NULL DEFAULT 'ACTIVE',
    "agent_id" INTEGER,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "missions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicles" (
    "id" SERIAL NOT NULL,
    "license_plate" TEXT NOT NULL,
    "owner" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vehicles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "violations" (
    "id" SERIAL NOT NULL,
    "violation_code" TEXT NOT NULL,
    "violation_type" TEXT NOT NULL,
    "fine_amount_gnf" INTEGER NOT NULL,
    "paid" BOOLEAN NOT NULL DEFAULT false,
    "vehicle_id" INTEGER NOT NULL,
    "mission_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "violations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "agents_badge_number_key" ON "agents"("badge_number");

-- CreateIndex
CREATE UNIQUE INDEX "missions_mission_code_key" ON "missions"("mission_code");

-- CreateIndex
CREATE INDEX "missions_agent_id_idx" ON "missions"("agent_id");

-- CreateIndex
CREATE INDEX "missions_status_idx" ON "missions"("status");

-- CreateIndex
CREATE UNIQUE INDEX "vehicles_license_plate_key" ON "vehicles"("license_plate");

-- CreateIndex
CREATE UNIQUE INDEX "violations_violation_code_key" ON "violations"("violation_code");

-- CreateIndex
CREATE INDEX "violations_vehicle_id_idx" ON "violations"("vehicle_id");

-- CreateIndex
CREATE INDEX "violations_mission_id_idx" ON "violations"("mission_id");

-- AddForeignKey
ALTER TABLE "missions" ADD CONSTRAINT "missions_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "agents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "violations" ADD CONSTRAINT "violations_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "violations" ADD CONSTRAINT "violations_mission_id_fkey" FOREIGN KEY ("mission_id") REFERENCES "missions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
