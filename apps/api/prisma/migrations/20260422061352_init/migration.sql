-- CreateTable
CREATE TABLE "tenants" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tenants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "role" TEXT NOT NULL,
    "password_hash" TEXT,
    "auth_provider" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant_scoring_weights" (
    "tenant_id" TEXT NOT NULL,
    "weight_land" DOUBLE PRECISION NOT NULL DEFAULT 0.25,
    "weight_utility" DOUBLE PRECISION NOT NULL DEFAULT 0.30,
    "weight_permits" DOUBLE PRECISION NOT NULL DEFAULT 0.20,
    "weight_environmental" DOUBLE PRECISION NOT NULL DEFAULT 0.10,
    "weight_schedule" DOUBLE PRECISION NOT NULL DEFAULT 0.10,
    "weight_strategic" DOUBLE PRECISION NOT NULL DEFAULT 0.05,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tenant_scoring_weights_pkey" PRIMARY KEY ("tenant_id")
);

-- CreateTable
CREATE TABLE "sites" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "site_code" TEXT,
    "name" TEXT NOT NULL,
    "country" TEXT,
    "region" TEXT,
    "metro" TEXT,
    "latitude" DECIMAL(65,30),
    "longitude" DECIMAL(65,30),
    "address" TEXT,
    "lifecycle_stage" TEXT NOT NULL DEFAULT 'prospect',
    "control_status" TEXT NOT NULL DEFAULT 'prospect',
    "zoning_status" TEXT,
    "strategic_priority" INTEGER,
    "target_mw" DECIMAL(65,30),
    "deliverable_mw" DECIMAL(65,30),
    "notes" TEXT,
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "sites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "parcels" (
    "id" TEXT NOT NULL,
    "site_id" TEXT NOT NULL,
    "apn" TEXT,
    "acreage" DECIMAL(65,30),
    "ownership_type" TEXT,
    "acquisition_date" TIMESTAMP(3),
    "sale_option_expiration" TIMESTAMP(3),
    "zoning_classification" TEXT,
    "environmental_status" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "parcels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "utilities" (
    "id" TEXT NOT NULL,
    "site_id" TEXT NOT NULL,
    "utility_type" TEXT NOT NULL,
    "provider_name" TEXT,
    "status" TEXT NOT NULL DEFAULT 'under_study',
    "available_capacity" DECIMAL(65,30),
    "committed_capacity" DECIMAL(65,30),
    "unit" TEXT,
    "estimated_delivery_date" TIMESTAMP(3),
    "actual_delivery_date" TIMESTAMP(3),
    "confidence_score" DECIMAL(65,30),
    "risk_level" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "utilities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "power_details" (
    "utility_id" TEXT NOT NULL,
    "voltage_level" TEXT,
    "substation_name" TEXT,
    "feeder_status" TEXT,
    "queue_position" TEXT,
    "interconnection_required" BOOLEAN,
    "energization_dependency" TEXT,

    CONSTRAINT "power_details_pkey" PRIMARY KEY ("utility_id")
);

-- CreateTable
CREATE TABLE "permits" (
    "id" TEXT NOT NULL,
    "site_id" TEXT NOT NULL,
    "permit_type" TEXT NOT NULL,
    "agency_name" TEXT,
    "status" TEXT NOT NULL DEFAULT 'not_started',
    "required" BOOLEAN NOT NULL DEFAULT true,
    "blocking" BOOLEAN NOT NULL DEFAULT false,
    "owner_user_id" TEXT,
    "due_date" TIMESTAMP(3),
    "expected_approval_date" TIMESTAMP(3),
    "actual_approval_date" TIMESTAMP(3),
    "risk_level" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "permits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "environmental_constraints" (
    "id" TEXT NOT NULL,
    "site_id" TEXT NOT NULL,
    "constraint_type" TEXT NOT NULL,
    "status" TEXT,
    "severity" TEXT,
    "blocking" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "environmental_constraints_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tasks" (
    "id" TEXT NOT NULL,
    "site_id" TEXT NOT NULL,
    "parent_task_id" TEXT,
    "task_type" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "owner_user_id" TEXT,
    "status" TEXT NOT NULL DEFAULT 'not_started',
    "planned_start_date" TIMESTAMP(3),
    "planned_end_date" TIMESTAMP(3),
    "actual_start_date" TIMESTAMP(3),
    "actual_end_date" TIMESTAMP(3),
    "duration_days" INTEGER,
    "percent_complete" DECIMAL(65,30),
    "critical" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "task_dependencies" (
    "id" TEXT NOT NULL,
    "predecessor_task_id" TEXT NOT NULL,
    "successor_task_id" TEXT NOT NULL,
    "dependency_type" TEXT NOT NULL DEFAULT 'FS',
    "lag_days" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "task_dependencies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "readiness_snapshots" (
    "id" TEXT NOT NULL,
    "site_id" TEXT NOT NULL,
    "score" DECIMAL(65,30) NOT NULL,
    "land_score" DECIMAL(65,30),
    "utility_score" DECIMAL(65,30),
    "permitting_score" DECIMAL(65,30),
    "environmental_score" DECIMAL(65,30),
    "schedule_score" DECIMAL(65,30),
    "strategic_score" DECIMAL(65,30),
    "computed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "scoring_version" TEXT NOT NULL,
    "explanation" JSONB,

    CONSTRAINT "readiness_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "capacity_forecasts" (
    "id" TEXT NOT NULL,
    "site_id" TEXT NOT NULL,
    "scenario_id" TEXT,
    "forecast_date" TIMESTAMP(3) NOT NULL,
    "expected_online_mw" DECIMAL(65,30) NOT NULL,
    "confidence_low" DECIMAL(65,30),
    "confidence_high" DECIMAL(65,30),
    "assumption_set" JSONB,
    "computed_at" TIMESTAMP(3),

    CONSTRAINT "capacity_forecasts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scenarios" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "base_type" TEXT NOT NULL,
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "scenarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documents" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "file_name" TEXT,
    "storage_key" TEXT,
    "mime_type" TEXT,
    "file_size" BIGINT,
    "document_type" TEXT,
    "uploaded_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_links" (
    "id" TEXT NOT NULL,
    "document_id" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "document_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_events" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "actor_user_id" TEXT,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "before_state" JSONB,
    "after_state" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "sites_site_code_key" ON "sites"("site_code");

-- CreateIndex
CREATE INDEX "sites_tenant_id_idx" ON "sites"("tenant_id");

-- CreateIndex
CREATE INDEX "sites_region_idx" ON "sites"("region");

-- CreateIndex
CREATE INDEX "sites_lifecycle_stage_idx" ON "sites"("lifecycle_stage");

-- CreateIndex
CREATE INDEX "parcels_site_id_idx" ON "parcels"("site_id");

-- CreateIndex
CREATE INDEX "utilities_site_id_idx" ON "utilities"("site_id");

-- CreateIndex
CREATE INDEX "utilities_utility_type_idx" ON "utilities"("utility_type");

-- CreateIndex
CREATE INDEX "permits_site_id_idx" ON "permits"("site_id");

-- CreateIndex
CREATE INDEX "permits_status_idx" ON "permits"("status");

-- CreateIndex
CREATE INDEX "environmental_constraints_site_id_idx" ON "environmental_constraints"("site_id");

-- CreateIndex
CREATE INDEX "tasks_site_id_idx" ON "tasks"("site_id");

-- CreateIndex
CREATE INDEX "tasks_status_idx" ON "tasks"("status");

-- CreateIndex
CREATE UNIQUE INDEX "task_dependencies_predecessor_task_id_successor_task_id_key" ON "task_dependencies"("predecessor_task_id", "successor_task_id");

-- CreateIndex
CREATE INDEX "readiness_snapshots_site_id_computed_at_idx" ON "readiness_snapshots"("site_id", "computed_at");

-- CreateIndex
CREATE INDEX "capacity_forecasts_site_id_idx" ON "capacity_forecasts"("site_id");

-- CreateIndex
CREATE INDEX "capacity_forecasts_forecast_date_idx" ON "capacity_forecasts"("forecast_date");

-- CreateIndex
CREATE INDEX "scenarios_tenant_id_idx" ON "scenarios"("tenant_id");

-- CreateIndex
CREATE INDEX "documents_tenant_id_idx" ON "documents"("tenant_id");

-- CreateIndex
CREATE INDEX "document_links_entity_type_entity_id_idx" ON "document_links"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "audit_events_tenant_id_created_at_idx" ON "audit_events"("tenant_id", "created_at");

-- CreateIndex
CREATE INDEX "audit_events_entity_type_entity_id_idx" ON "audit_events"("entity_type", "entity_id");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant_scoring_weights" ADD CONSTRAINT "tenant_scoring_weights_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sites" ADD CONSTRAINT "sites_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sites" ADD CONSTRAINT "sites_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parcels" ADD CONSTRAINT "parcels_site_id_fkey" FOREIGN KEY ("site_id") REFERENCES "sites"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "utilities" ADD CONSTRAINT "utilities_site_id_fkey" FOREIGN KEY ("site_id") REFERENCES "sites"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "power_details" ADD CONSTRAINT "power_details_utility_id_fkey" FOREIGN KEY ("utility_id") REFERENCES "utilities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "permits" ADD CONSTRAINT "permits_site_id_fkey" FOREIGN KEY ("site_id") REFERENCES "sites"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "permits" ADD CONSTRAINT "permits_owner_user_id_fkey" FOREIGN KEY ("owner_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "environmental_constraints" ADD CONSTRAINT "environmental_constraints_site_id_fkey" FOREIGN KEY ("site_id") REFERENCES "sites"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_site_id_fkey" FOREIGN KEY ("site_id") REFERENCES "sites"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_parent_task_id_fkey" FOREIGN KEY ("parent_task_id") REFERENCES "tasks"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_owner_user_id_fkey" FOREIGN KEY ("owner_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_dependencies" ADD CONSTRAINT "task_dependencies_predecessor_task_id_fkey" FOREIGN KEY ("predecessor_task_id") REFERENCES "tasks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_dependencies" ADD CONSTRAINT "task_dependencies_successor_task_id_fkey" FOREIGN KEY ("successor_task_id") REFERENCES "tasks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "readiness_snapshots" ADD CONSTRAINT "readiness_snapshots_site_id_fkey" FOREIGN KEY ("site_id") REFERENCES "sites"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "capacity_forecasts" ADD CONSTRAINT "capacity_forecasts_site_id_fkey" FOREIGN KEY ("site_id") REFERENCES "sites"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "capacity_forecasts" ADD CONSTRAINT "capacity_forecasts_scenario_id_fkey" FOREIGN KEY ("scenario_id") REFERENCES "scenarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scenarios" ADD CONSTRAINT "scenarios_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scenarios" ADD CONSTRAINT "scenarios_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_links" ADD CONSTRAINT "document_links_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "documents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_events" ADD CONSTRAINT "audit_events_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_events" ADD CONSTRAINT "audit_events_actor_user_id_fkey" FOREIGN KEY ("actor_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
