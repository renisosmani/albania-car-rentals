import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const pickupDate = searchParams.get("pickupDate");
  const returnDate = searchParams.get("returnDate");

  if (!pickupDate || !returnDate) {
    return NextResponse.json(
      { error: "pickupDate and returnDate are required" },
      { status: 400 }
    );
  }

  const requestStart = new Date(pickupDate);
  const requestEnd = new Date(returnDate);

  if (isNaN(requestStart.getTime()) || isNaN(requestEnd.getTime())) {
    return NextResponse.json({ error: "Invalid date format" }, { status: 400 });
  }

  if (requestEnd <= requestStart) {
    return NextResponse.json(
      { error: "returnDate must be after pickupDate" },
      { status: 400 }
    );
  }

  // Find cars that have NO overlapping availability blocks
  // Overlap condition: blockStart < requestEnd AND requestStart < blockEnd
  const bookedCarIds = await prisma.availabilityBlock.findMany({
    where: {
      startDate: { lt: requestEnd },
      endDate: { gt: requestStart },
    },
    select: { carId: true },
  });

  const bookedIds = bookedCarIds.map((b) => b.carId);

  const availableCars = await prisma.car.findMany({
    where: {
      id: { notIn: bookedIds },
    },
    include: {
      dealer: true,
      defaultPickupPoint: true,
    },
  });

  // Group available cars by pickup point
  const pickupPointMap = new Map<
    string,
    {
      pickupPoint: {
        id: string;
        name: string;
        lat: number;
        lng: number;
        type: string;
        instructions: string | null;
        fee: number | null;
        dealerId: string;
      };
      dealerName: string;
      cars: typeof availableCars;
    }
  >();

  for (const car of availableCars) {
    const pp = car.defaultPickupPoint;
    if (!pickupPointMap.has(pp.id)) {
      pickupPointMap.set(pp.id, {
        pickupPoint: pp,
        dealerName: car.dealer.name,
        cars: [],
      });
    }
    pickupPointMap.get(pp.id)!.cars.push(car);
  }

  const results = Array.from(pickupPointMap.values()).map((entry) => ({
    pickupPoint: entry.pickupPoint,
    dealerName: entry.dealerName,
    availableCarCount: entry.cars.length,
    cars: entry.cars.map((c) => ({
      id: c.id,
      make: c.make,
      model: c.model,
      year: c.year,
      category: c.category,
      pricePerDay: c.pricePerDay,
      imageUrl: c.imageUrl,
    })),
  }));

  return NextResponse.json({ results, requestStart, requestEnd });
}
