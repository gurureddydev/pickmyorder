import { prisma } from "@/lib/prisma";

export interface PricingInput {
  pickupPin: string;
  destPin: string;
  packageType: string; // e.g. 'document', 'parcel', etc.
  transport: "DOMESTIC" | "INTERNATIONAL";
  weight: number;
  length: number;
  width: number;
  height: number;
  packing: boolean;
}

export interface CourierQuote {
  courierId: string;
  courierName: string;
  courierCode: string;
  logo: string | null;
  freight: number;
  fuelSurcharge: number;
  handlingCharge: number;
  remoteAreaCharge: number;
  packingCharge: number;
  tax: number;
  total: number;
  billedWeight: number;
  volWeight: number;
  etaDays: number;
}

export async function calculateQuotes(input: PricingInput): Promise<{
  quotes: CourierQuote[];
  isServiceable: boolean;
  message?: string;
}> {
  const {
    pickupPin,
    destPin,
    packageType,
    transport,
    weight,
    length,
    width,
    height,
    packing,
  } = input;

  // 1. Validate serviceability
  const originPin = await prisma.pincodeZone.findUnique({
    where: { pincode: pickupPin },
  });

  const targetPin = await prisma.pincodeZone.findUnique({
    where: { pincode: destPin },
  });

  if (originPin && !originPin.isServiceable) {
    return {
      quotes: [],
      isServiceable: false,
      message: `Pickup pincode ${pickupPin} is currently not serviceable.`,
    };
  }

  if (targetPin && !targetPin.isServiceable) {
    return {
      quotes: [],
      isServiceable: false,
      message: `Destination pincode ${destPin} is currently not serviceable.`,
    };
  }

  const resolvedOriginPin = originPin || {
    zoneName: "Zone A",
    isRemoteArea: false,
    estimatedDeliveryDays: 3,
  };

  const resolvedTargetPin = targetPin || {
    zoneName: "Zone A",
    isRemoteArea: false,
    estimatedDeliveryDays: 5,
  };

  // 2. Determine Zone
  // Matches Zone table record using resolvedTargetPin.zoneName (e.g. "Zone A")
  const targetZone = await prisma.zone.findFirst({
    where: { name: resolvedTargetPin.zoneName },
  });

  if (!targetZone) {
    return {
      quotes: [],
      isServiceable: false,
      message: `Service zone could not be resolved for destination pincode ${destPin}.`,
    };
  }

  // 3. Resolve Service Type
  const resolvedService = await prisma.serviceType.findUnique({
    where: { code: packageType.toLowerCase() },
  });

  if (!resolvedService || !resolvedService.isActive) {
    return {
      quotes: [],
      isServiceable: false,
      message: `Selected package type/service "${packageType}" is currently unavailable.`,
    };
  }

  // 4. Calculate volumetric weight
  // Default divisor to 5000 (domestic) and 4000 (international)
  const divisor = transport === "DOMESTIC" ? 5000 : 4000;
  const volWeight = (length * width * height) / divisor;
  const billedWeight = Math.max(weight, volWeight);

  // 5. Fetch active courier partners
  const activeCouriers = await prisma.courierPartner.findMany({
    where: { isActive: true },
    orderBy: { priority: "asc" },
  });

  // 6. Calculate packaging charges (if checked)
  let packingCharge = 0;
  if (packing) {
    const defaultBox = await prisma.packagingOption.findFirst({
      where: { code: "box", isActive: true },
    });
    packingCharge = defaultBox ? defaultBox.price : 100;
  }

  // 7. Get Tax Configuration
  const gstConfig = await prisma.taxConfig.findUnique({
    where: { name: "GST" },
  });
  const gstRate = gstConfig?.isActive ? gstConfig.rate : 18.0;

  const quotes: CourierQuote[] = [];

  // 8. Compute quotes for each active courier partner
  for (const courier of activeCouriers) {
    // Find matching pricing rule
    const rule = await prisma.pricingRule.findFirst({
      where: {
        courierPartnerId: courier.id,
        zoneId: targetZone.id,
        serviceTypeId: resolvedService.id,
        transport: transport,
        isActive: true,
      },
    });

    if (!rule) continue; // Skip courier if no pricing rule is configured for this combo

    // Calculate freight cost
    // Assumes basePrice covers up to 0.5kg
    const baseWeightLimit = 0.5;
    let freight = rule.basePrice;

    if (billedWeight > baseWeightLimit) {
      const extraWeight = billedWeight - baseWeightLimit;
      freight += Math.ceil(extraWeight) * rule.additionalKgPrice;
    }

    // Apply minimum charge enforcement
    if (freight < rule.minCharge) {
      freight = rule.minCharge;
    }

    // Courier specific fuel surcharge
    const fuelSurcharge = freight * (rule.fuelSurchargePercent / 100);

    // Courier specific handling / fragile charge
    const handlingCharge = rule.handlingCharge;

    // Remote area surcharge
    const remoteAreaCharge = resolvedTargetPin.isRemoteArea ? rule.remoteAreaCharge : 0;

    // Subtotal before tax
    const subtotal = freight + fuelSurcharge + handlingCharge + remoteAreaCharge + packingCharge;

    // Tax calculation
    const tax = subtotal * (gstRate / 100);

    // Grand total
    const total = subtotal + tax;

    quotes.push({
      courierId: courier.id,
      courierName: courier.name,
      courierCode: courier.code,
      logo: courier.logo,
      freight,
      fuelSurcharge,
      handlingCharge,
      remoteAreaCharge,
      packingCharge,
      tax,
      total,
      billedWeight,
      volWeight,
      etaDays: resolvedTargetPin.estimatedDeliveryDays,
    });
  }

  return {
    quotes: quotes.sort((a, b) => a.total - b.total),
    isServiceable: true,
  };
}
