import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding COE-Nexus database...')

  // Create demo tenant
  const tenant = await prisma.tenant.upsert({
    where: { id: 'tenant-demo-0000-0000-000000000001' },
    update: {},
    create: {
      id: 'tenant-demo-0000-0000-000000000001',
      name: 'Acme Datacenter Co.',
    },
  })

  // Create admin user
  const passwordHash = await bcrypt.hash('Password123!', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@acme-dc.com' },
    update: {},
    create: {
      tenantId: tenant.id,
      email: 'admin@acme-dc.com',
      name: 'Admin User',
      role: 'admin',
      passwordHash,
      authProvider: 'local',
    },
  })

  // Create demo sites
  const sites = await Promise.all([
    prisma.site.upsert({
      where: { siteCode: 'AMS-01' },
      update: {},
      create: {
        tenantId: tenant.id,
        siteCode: 'AMS-01',
        name: 'Amsterdam North',
        country: 'Netherlands',
        region: 'EMEA',
        metro: 'Amsterdam',
        latitude: 52.378,
        longitude: 4.9,
        lifecycleStage: 'development',
        controlStatus: 'leased',
        strategicPriority: 1,
        targetMw: 100,
        deliverableMw: 80,
        createdById: admin.id,
      },
    }),
    prisma.site.upsert({
      where: { siteCode: 'DAL-03' },
      update: {},
      create: {
        tenantId: tenant.id,
        siteCode: 'DAL-03',
        name: 'Dallas Campus 3',
        country: 'USA',
        region: 'Americas',
        metro: 'Dallas',
        latitude: 32.776,
        longitude: -96.796,
        lifecycleStage: 'entitlement',
        controlStatus: 'optioned',
        strategicPriority: 2,
        targetMw: 200,
        deliverableMw: 150,
        createdById: admin.id,
      },
    }),
    prisma.site.upsert({
      where: { siteCode: 'SIN-02' },
      update: {},
      create: {
        tenantId: tenant.id,
        siteCode: 'SIN-02',
        name: 'Singapore East',
        country: 'Singapore',
        region: 'APAC',
        metro: 'Singapore',
        latitude: 1.352,
        longitude: 103.819,
        lifecycleStage: 'feasibility',
        controlStatus: 'prospect',
        strategicPriority: 3,
        targetMw: 60,
        createdById: admin.id,
      },
    }),
  ])

  // Add utilities to AMS-01
  const amsUtil = await prisma.utility.create({
    data: {
      siteId: sites[0].id,
      utilityType: 'power',
      providerName: 'TenneT',
      status: 'committed',
      availableCapacity: 100,
      committedCapacity: 80,
      unit: 'MW',
      estimatedDeliveryDate: new Date('2025-09-01'),
      confidenceScore: 0.85,
      riskLevel: 'low',
      powerDetails: {
        create: {
          voltageLevel: '150kV',
          substationName: 'AMS-North-Sub-01',
          interconnectionRequired: true,
          feederStatus: 'approved',
        },
      },
    },
  })

  await prisma.utility.create({
    data: {
      siteId: sites[0].id,
      utilityType: 'fiber',
      providerName: 'AMS-IX',
      status: 'active',
      availableCapacity: 400,
      committedCapacity: 200,
      unit: 'Gbps',
    },
  })

  // Add permits to DAL-03
  await prisma.permit.createMany({
    data: [
      {
        siteId: sites[1].id,
        permitType: 'Zoning Variance',
        agencyName: 'City of Dallas Planning',
        status: 'in_progress',
        required: true,
        blocking: true,
        riskLevel: 'medium',
        expectedApprovalDate: new Date('2025-06-30'),
      },
      {
        siteId: sites[1].id,
        permitType: 'Electrical Interconnection',
        agencyName: 'ERCOT',
        status: 'submitted',
        required: true,
        blocking: true,
        riskLevel: 'high',
        expectedApprovalDate: new Date('2025-12-01'),
      },
      {
        siteId: sites[1].id,
        permitType: 'Environmental Impact Study',
        agencyName: 'Texas TCEQ',
        status: 'approved',
        required: true,
        blocking: false,
        actualApprovalDate: new Date('2025-01-15'),
      },
    ],
  })

  // Add tasks to AMS-01
  const task1 = await prisma.task.create({
    data: {
      siteId: sites[0].id,
      name: 'Substation interconnection agreement',
      taskType: 'utility',
      status: 'completed',
      critical: true,
      plannedStartDate: new Date('2025-01-01'),
      plannedEndDate: new Date('2025-03-31'),
      actualStartDate: new Date('2025-01-08'),
      actualEndDate: new Date('2025-03-25'),
      percentComplete: 100,
      durationDays: 89,
    },
  })

  const task2 = await prisma.task.create({
    data: {
      siteId: sites[0].id,
      name: 'Foundation and civil works',
      taskType: 'construction',
      status: 'in_progress',
      critical: true,
      plannedStartDate: new Date('2025-04-01'),
      plannedEndDate: new Date('2025-08-31'),
      percentComplete: 35,
      durationDays: 153,
    },
  })

  await prisma.task.create({
    data: {
      siteId: sites[0].id,
      name: 'MEP installation',
      taskType: 'construction',
      status: 'not_started',
      critical: true,
      plannedStartDate: new Date('2025-09-01'),
      plannedEndDate: new Date('2026-01-31'),
      durationDays: 153,
    },
  })

  await prisma.taskDependency.create({
    data: {
      predecessorTaskId: task1.id,
      successorTaskId: task2.id,
      dependencyType: 'FS',
      lagDays: 0,
    },
  })

  // Readiness snapshot for AMS-01
  await prisma.readinessSnapshot.create({
    data: {
      siteId: sites[0].id,
      score: 74,
      landScore: 80,
      utilityScore: 85,
      permittingScore: 80,
      environmentalScore: 90,
      scheduleScore: 55,
      strategicScore: 100,
      scoringVersion: '1.0',
      explanation: {
        totalScore: 74,
        components: {
          land: { score: 80, reason: 'Site is under lease' },
          utility: { score: 85, reason: 'Power: committed, Fiber: active' },
          permits: { score: 80, reason: 'No blocking permits open' },
          environmental: { score: 90, reason: 'No blocking environmental constraints' },
          schedule: { score: 55, reason: '1/3 tasks completed, 0 blocked' },
          strategic: { score: 100, reason: 'Strategic priority: 1' },
        },
      },
    },
  })

  console.log('Seed complete.')
  console.log(`Tenant: ${tenant.name} (${tenant.id})`)
  console.log(`Admin: admin@acme-dc.com / Password123!`)
  console.log(`Sites seeded: ${sites.map((s) => s.siteCode).join(', ')}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
