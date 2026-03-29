import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import path from "path";

// The DB file is at the project root (DATABASE_URL=file:./dev.db)
const dbPath = path.resolve(__dirname, "..", "dev.db");
const adapter = new PrismaLibSql({ url: `file:${dbPath}` });
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const prisma = new PrismaClient({ adapter } as any);

async function main() {
  console.log("🌱 Seeding database...");

  // Clean existing data
  await prisma.availabilityBlock.deleteMany();
  await prisma.car.deleteMany();
  await prisma.pickupPoint.deleteMany();
  await prisma.dealer.deleteMany();

  // === DEALER 1: TIA Express Rentals ===
  const dealer1 = await prisma.dealer.create({
    data: {
      name: "TIA Express Rentals",
      phone: "+355 69 111 2233",
      email: "info@tiaexpress.al",
    },
  });

  const pp1 = await prisma.pickupPoint.create({
    data: {
      dealerId: dealer1.id,
      name: "TIA Terminal 1 – Self Pickup",
      lat: 41.41477,
      lng: 19.72063,
      type: "SELF_PICKUP",
      instructions:
        "Head to Parking Level P1. Look for the orange TIA Express sign next to pillar C12. Keys are in a lockbox—code sent by SMS after booking confirmation.",
      fee: 0,
    },
  });

  const pp2 = await prisma.pickupPoint.create({
    data: {
      dealerId: dealer1.id,
      name: "TIA Terminal 1 – Meet & Greet",
      lat: 41.4153,
      lng: 19.7211,
      type: "MEET_GREET",
      instructions:
        "Our representative will meet you in the Arrivals hall holding a sign with your name. No extra walk needed.",
      fee: 10,
    },
  });

  // === DEALER 2: Adriatic Auto ===
  const dealer2 = await prisma.dealer.create({
    data: {
      name: "Adriatic Auto",
      phone: "+355 69 444 5566",
      email: "hello@adriaticauto.al",
    },
  });

  const pp3 = await prisma.pickupPoint.create({
    data: {
      dealerId: dealer2.id,
      name: "TIA Airport Road – Key Delivery",
      lat: 41.4135,
      lng: 19.7198,
      type: "KEY_DELIVERY",
      instructions:
        "A driver will deliver the keys to the Arrivals exit (Gate B) within 15 minutes of your landing. The car is parked in the short-stay lot, row 4.",
      fee: 5,
    },
  });

  // === CARS ===
  const car1 = await prisma.car.create({
    data: {
      dealerId: dealer1.id,
      defaultPickupPointId: pp1.id,
      make: "Volkswagen",
      model: "Polo",
      year: 2022,
      category: "ECONOMY",
      pricePerDay: 28,
      imageUrl: "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=400",
    },
  });

  const car2 = await prisma.car.create({
    data: {
      dealerId: dealer1.id,
      defaultPickupPointId: pp2.id,
      make: "Toyota",
      model: "Corolla",
      year: 2023,
      category: "COMPACT",
      pricePerDay: 38,
      imageUrl: "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=400",
    },
  });

  const car3 = await prisma.car.create({
    data: {
      dealerId: dealer1.id,
      defaultPickupPointId: pp1.id,
      make: "BMW",
      model: "X3",
      year: 2023,
      category: "SUV",
      pricePerDay: 75,
      imageUrl: "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=400",
    },
  });

  const car4 = await prisma.car.create({
    data: {
      dealerId: dealer2.id,
      defaultPickupPointId: pp3.id,
      make: "Hyundai",
      model: "i20",
      year: 2022,
      category: "ECONOMY",
      pricePerDay: 25,
      imageUrl: "https://images.unsplash.com/photo-1580414057403-c5f451f30e1c?w=400",
    },
  });

  const car5 = await prisma.car.create({
    data: {
      dealerId: dealer2.id,
      defaultPickupPointId: pp3.id,
      make: "Mercedes",
      model: "GLC",
      year: 2024,
      category: "LUXURY",
      pricePerDay: 110,
      imageUrl: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=400",
    },
  });

  // === AVAILABILITY BLOCKS (booked = unavailable periods) ===
  const now = new Date();
  const d = (offsetDays: number) => {
    const date = new Date(now);
    date.setDate(date.getDate() + offsetDays);
    date.setHours(0, 0, 0, 0);
    return date;
  };

  // car1 (VW Polo): booked T+7 to T+12
  await prisma.availabilityBlock.create({
    data: { carId: car1.id, startDate: d(7), endDate: d(12) },
  });

  // car2 (Toyota Corolla): two booking windows
  await prisma.availabilityBlock.create({
    data: { carId: car2.id, startDate: d(5), endDate: d(10) },
  });
  await prisma.availabilityBlock.create({
    data: { carId: car2.id, startDate: d(17), endDate: d(22) },
  });

  // car3 (BMW X3): booked T+14 to T+16
  await prisma.availabilityBlock.create({
    data: { carId: car3.id, startDate: d(14), endDate: d(16) },
  });

  // car5 (Mercedes GLC): booked T+2 to T+4
  await prisma.availabilityBlock.create({
    data: { carId: car5.id, startDate: d(2), endDate: d(4) },
  });

  void car4; // suppress unused warning

  console.log("✅ Seed complete!");
  console.log(`   Dealers: 2 (${dealer1.name}, ${dealer2.name})`);
  console.log(`   Pickup Points: 3 (${pp1.name} | ${pp2.name} | ${pp3.name})`);
  console.log(`   Cars: 5`);
  console.log(`   Availability Blocks: 5`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
