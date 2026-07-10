const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding started...");

  // 1. Clean existing database records
  await prisma.auditLog.deleteMany({});
  await prisma.supportTicket.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.siteSetting.deleteMany({});
  await prisma.trackingEvent.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.quote.deleteMany({});
  await prisma.taxConfig.deleteMany({});
  await prisma.packagingOption.deleteMany({});
  await prisma.weightSlab.deleteMany({});
  await prisma.pricingRule.deleteMany({});
  await prisma.pincodeZone.deleteMany({});
  await prisma.zone.deleteMany({});
  await prisma.serviceType.deleteMany({});
  await prisma.courierPartner.deleteMany({});
  await prisma.user.deleteMany({});

  // 2. Create Default Admin User
  const adminPasswordHash = await bcrypt.hash("admin123", 10);
  const admin = await prisma.user.create({
    data: {
      name: "Super Admin",
      email: "admin@pickmyorder.com",
      passwordHash: adminPasswordHash,
      phone: "9491720603",
      role: "ADMIN",
    },
  });
  console.log(`Created admin user: ${admin.email}`);

  // 3. Create Service Types
  const serviceTypes = [
    await prisma.serviceType.create({ data: { name: "Document", code: "document", description: "Envelopes and documents up to 500g" } }),
    await prisma.serviceType.create({ data: { name: "Parcel", code: "parcel", description: "Standard parcels and packages" } }),
    await prisma.serviceType.create({ data: { name: "Fragile Item", code: "fragile", description: "Glassware, ceramics, electronics needing extra care" } }),
    await prisma.serviceType.create({ data: { name: "Heavy Cargo", code: "heavy", description: "Shipments exceeding 10kg" } }),
    await prisma.serviceType.create({ data: { name: "Liquid / Gel", code: "liquid", description: "Perfumes, oils, non-hazardous liquid items" } }),
    await prisma.serviceType.create({ data: { name: "Electronics", code: "electronics", description: "Phones, laptops, accessories" } }),
    await prisma.serviceType.create({ data: { name: "Medicine", code: "medicine", description: "Prescription drugs and pharmaceutical cargo" } }),
    await prisma.serviceType.create({ data: { name: "Food / Perishable", code: "food", description: "Sweets, dry items, vacuum packed foods" } }),
  ];
  console.log(`Created ${serviceTypes.length} service types.`);

  // 4. Create Zones
  const zoneA = await prisma.zone.create({ data: { name: "Zone A", description: "Within same city limits" } });
  const zoneB = await prisma.zone.create({ data: { name: "Zone B", description: "Intra-state (same state, different city)" } });
  const zoneC = await prisma.zone.create({ data: { name: "Zone C", description: "Metro to Metro (major cities across India)" } });
  const zoneD = await prisma.zone.create({ data: { name: "Zone D", description: "Rest of India (remote areas & north east)" } });
  console.log("Created Zones A, B, C, D.");

  // 5. Create Courier Partners
  const couriers = [
    { name: "Blue Dart", code: "BLUEDART", priority: 1, logo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop" },
    { name: "Delhivery", code: "DELHIVERY", priority: 2, logo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop" },
    { name: "DTDC", code: "DTDC", priority: 3, logo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop" },
    { name: "XpressBees", code: "XPRESSBEES", priority: 4, logo: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop" },
    { name: "Ecom Express", code: "ECOMEXPRESS", priority: 5, logo: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100&h=100&fit=crop" },
    { name: "India Post", code: "INDIAPOST", priority: 6, logo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop" },
  ];

  const dbCouriers = [];
  for (const c of couriers) {
    const courier = await prisma.courierPartner.create({
      data: {
        name: c.name,
        code: c.code,
        priority: c.priority,
        logo: c.logo,
        isActive: true,
      },
    });
    dbCouriers.push(courier);
  }
  console.log(`Created ${dbCouriers.length} courier partners.`);

  // 6. Create Pricing Rules (Dynamic Rates)
  for (const courier of dbCouriers) {
    for (const zone of [zoneA, zoneB, zoneC, zoneD]) {
      for (const service of serviceTypes) {
        let baseMultiplier = 1.0;
        if (courier.code === "BLUEDART") baseMultiplier = 1.4;
        if (courier.code === "DELHIVERY") baseMultiplier = 1.1;
        if (courier.code === "INDIAPOST") baseMultiplier = 0.7;

        let zoneMultiplier = 1.0;
        if (zone.name === "Zone B") zoneMultiplier = 1.5;
        if (zone.name === "Zone C") zoneMultiplier = 2.0;
        if (zone.name === "Zone D") zoneMultiplier = 2.8;

        let serviceMultiplier = 1.0;
        if (service.code === "fragile") serviceMultiplier = 1.3;
        if (service.code === "liquid") serviceMultiplier = 1.25;
        if (service.code === "document") serviceMultiplier = 0.8;

        await prisma.pricingRule.create({
          data: {
            courierPartnerId: courier.id,
            zoneId: zone.id,
            serviceTypeId: service.id,
            transport: "DOMESTIC",
            basePrice: Math.round(40 * baseMultiplier * zoneMultiplier * serviceMultiplier),
            pricePerKg: Math.round(25 * baseMultiplier * zoneMultiplier * serviceMultiplier),
            additionalKgPrice: Math.round(20 * baseMultiplier * zoneMultiplier * serviceMultiplier),
            minCharge: Math.round(30 * baseMultiplier),
            maxWeight: 100.0,
            fuelSurchargePercent: 12.0,
            handlingCharge: service.code === "fragile" ? 50.0 : 0.0,
            codCharge: 40.0,
            remoteAreaCharge: zone.name === "Zone D" ? 150.0 : 0.0,
            insurancePercent: 1.5,
          },
        });
      }
    }
  }
  console.log("Successfully created pricing rules.");

  // 7. Create Sample Pincode Zones
  const pincodeData = [
    { pincode: "560027", zoneName: "Zone A", isServiceable: true, isRemoteArea: false },
    { pincode: "560001", zoneName: "Zone A", isServiceable: true, isRemoteArea: false },
    { pincode: "570001", zoneName: "Zone B", isServiceable: true, isRemoteArea: false },
    { pincode: "400001", zoneName: "Zone C", isServiceable: true, isRemoteArea: false },
    { pincode: "110001", zoneName: "Zone C", isServiceable: true, isRemoteArea: false },
    { pincode: "600001", zoneName: "Zone C", isServiceable: true, isRemoteArea: false },
    { pincode: "700001", zoneName: "Zone C", isServiceable: true, isRemoteArea: false },
    { pincode: "799001", zoneName: "Zone D", isServiceable: true, isRemoteArea: true },
    { pincode: "190001", zoneName: "Zone D", isServiceable: true, isRemoteArea: true },
    { pincode: "999999", zoneName: "Zone D", isServiceable: false, isRemoteArea: false },
  ];

  for (const pin of pincodeData) {
    await prisma.pincodeZone.create({
      data: pin,
    });
  }
  console.log(`Created ${pincodeData.length} sample pincode zones.`);

  // 8. Create Packaging Options
  const packOptions = [
    { name: "Envelope (Document Carrier)", code: "envelope", price: 15.0 },
    { name: "Standard Corrugated Box", code: "box", price: 50.0 },
    { name: "Premium Fragile Box (Double walled)", code: "premium", price: 120.0 },
    { name: "Bubble Wrap Lining Surcharge", code: "bubblewrap", price: 30.0 },
    { name: "Wooden Box Crate (Heavy / Industrial)", code: "wooden", price: 350.0 },
  ];

  for (const option of packOptions) {
    await prisma.packagingOption.create({
      data: option,
    });
  }
  console.log("Created packaging options.");

  // 9. Create Tax Configuration
  const taxes = [
    { name: "GST", rate: 18.0 },
    { name: "TCS", rate: 1.0 },
  ];

  for (const tax of taxes) {
    await prisma.taxConfig.create({
      data: tax,
    });
  }
  console.log("Created tax configurations.");

  // 10. Create Initial Site Settings
  const initialSettings = [
    { key: "heroTitle", value: "Ship Anything, Anywhere." },
    { key: "heroSubtitle", value: "India's most reliable courier management platform. Book pickups, track shipments, and manage returns — all from one dashboard." },
    { key: "supportPhone", value: "9491720603" },
    { key: "supportEmail", value: "support@pickmyorder.com" },
    { key: "officeAddress", value: "Shop No 003, Basement Floor, AA Arcade, 12th Cross, Wilson Garden, Bengaluru – 560027" },
    { key: "workingHours", value: "Mon – Sat: 9:00 am – 7:00 pm, Sunday: 10:00 am – 4:00 pm" },
  ];

  for (const setting of initialSettings) {
    await prisma.siteSetting.create({
      data: setting,
    });
  }
  console.log("Created site settings.");

  // 11. Create Dummy Order for Tracking Validation
  const dummyQuote = await prisma.quote.create({
    data: {
      pickupPincode: "560027",
      destPincode: "400001",
      packageType: "parcel",
      transport: "DOMESTIC",
      weight: 1.5,
      length: 20,
      width: 15,
      height: 10,
      packing: false,
      pricingDetails: "{}",
      userId: admin.id,
    }
  });

  const dummyOrder = await prisma.order.create({
    data: {
      orderNumber: "PMO12345678",
      awbNumber: "AWB12345678",
      quoteId: dummyQuote.id,
      userId: admin.id,
      courierPartnerId: dbCouriers[0].id,
      status: "IN_TRANSIT",
      pickupName: "Sender Name",
      pickupPhone: "9876543210",
      pickupAddress: "123 Sender St, Wilson Garden",
      pickupCity: "Bengaluru",
      pickupState: "Karnataka",
      pickupPin: "560027",
      destName: "Receiver Name",
      destPhone: "0123456789",
      destAddress: "456 Receiver St, Fort",
      destCity: "Mumbai",
      destState: "Maharashtra",
      destPin: "400001",
      totalAmount: 150.0,
      paymentStatus: "PAID",
    }
  });

  await prisma.trackingEvent.createMany({
    data: [
      {
        orderId: dummyOrder.id,
        status: "PICKUP_SCHEDULED",
        location: "Bengaluru",
        description: "Pickup scheduled with courier partner",
        timestamp: new Date(Date.now() - 86400000 * 2),
      },
      {
        orderId: dummyOrder.id,
        status: "PICKED_UP",
        location: "Bengaluru Pickup Hub",
        description: "Shipment picked up from sender location",
        timestamp: new Date(Date.now() - 86400000 * 1.5),
      },
      {
        orderId: dummyOrder.id,
        status: "IN_TRANSIT",
        location: "Mumbai Hub",
        description: "Shipment arrived at destination hub, out for delivery",
        timestamp: new Date(Date.now() - 86400000 * 0.5),
      }
    ]
  });
  console.log("✓ Created dummy order PMO12345678 (AWB: AWB12345678) for tracking tests.");

  console.log("Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("Seeding failed: ", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
