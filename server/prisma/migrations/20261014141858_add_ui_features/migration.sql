-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "AgentStatus" ADD VALUE 'INSPECTING';
ALTER TYPE "AgentStatus" ADD VALUE 'AVAILABLE';
ALTER TYPE "AgentStatus" ADD VALUE 'EMERGENCY';

-- AlterTable
ALTER TABLE "agents" ADD COLUMN     "avatar_bg" TEXT,
ADD COLUMN     "cash_today_gnf" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "connection_status" TEXT NOT NULL DEFAULT 'Online',
ADD COLUMN     "duty_start" TEXT,
ADD COLUMN     "gps_active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "last_sync_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "location" TEXT,
ADD COLUMN     "pending_records" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "region" TEXT NOT NULL DEFAULT 'Kindia',
ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'Field Inspector',
ADD COLUMN     "scope" TEXT NOT NULL DEFAULT 'All Guinea',
ADD COLUMN     "supervisor" TEXT NOT NULL DEFAULT 'Ibrahima Camara (National)';

-- AlterTable
ALTER TABLE "missions" ADD COLUMN     "region" TEXT NOT NULL DEFAULT 'Kindia',
ADD COLUMN     "route" TEXT,
ADD COLUMN     "supervisor" TEXT;

-- AlterTable
ALTER TABLE "violations" ADD COLUMN     "agent_name" TEXT,
ADD COLUMN     "payment_method" TEXT,
ADD COLUMN     "payment_status" TEXT NOT NULL DEFAULT 'Issued',
ADD COLUMN     "region" TEXT NOT NULL DEFAULT 'Kindia',
ADD COLUMN     "road_name" TEXT,
ADD COLUMN     "severity" TEXT NOT NULL DEFAULT 'Moderate';

-- CreateTable
CREATE TABLE "damage_reports" (
    "id" SERIAL NOT NULL,
    "report_code" TEXT NOT NULL,
    "road" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'Moderate',
    "status" TEXT NOT NULL DEFAULT 'Reported',
    "region" TEXT NOT NULL DEFAULT 'Kindia',
    "description" TEXT,
    "agent_name" TEXT,
    "agent_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "damage_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity_logs" (
    "id" SERIAL NOT NULL,
    "activity_key" TEXT,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "region" TEXT NOT NULL DEFAULT 'Kindia',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activity_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "damage_reports_report_code_key" ON "damage_reports"("report_code");

-- CreateIndex
CREATE INDEX "damage_reports_agent_id_idx" ON "damage_reports"("agent_id");

-- CreateIndex
CREATE INDEX "damage_reports_region_idx" ON "damage_reports"("region");

-- CreateIndex
CREATE INDEX "damage_reports_severity_idx" ON "damage_reports"("severity");

-- CreateIndex
CREATE INDEX "activity_logs_region_idx" ON "activity_logs"("region");

-- CreateIndex
CREATE INDEX "activity_logs_type_idx" ON "activity_logs"("type");

-- CreateIndex
CREATE INDEX "missions_region_idx" ON "missions"("region");

-- CreateIndex
CREATE INDEX "violations_region_idx" ON "violations"("region");

-- AddForeignKey
ALTER TABLE "damage_reports" ADD CONSTRAINT "damage_reports_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "agents"("id") ON DELETE SET NULL ON UPDATE CASCADE;
