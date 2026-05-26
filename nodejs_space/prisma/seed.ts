import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import fetch from 'node-fetch';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding superusers...');
  const testPassword = await bcrypt.hash('johndoe123', 10);
  await prisma.user.upsert({
    where: { email: 'john@doe.com' },
    update: {},
    create: {
      nickname: 'johndoe',
      fullName: 'John Doe',
      email: 'john@doe.com',
      password: testPassword,
      phone: '+10000000000',
      subscriptionLevel: 'platinum',
      isSuperuser: true,
      emailVerified: true,
    },
  });

  const adminPassword = await bcrypt.hash('Admin123!', 10);
  await prisma.user.upsert({
    where: { email: 'admin@dedikodu.app' },
    update: {},
    create: {
      nickname: 'admin',
      fullName: 'Admin',
      email: 'admin@dedikodu.app',
      password: adminPassword,
      phone: '+900000000000',
      subscriptionLevel: 'platinum',
      isSuperuser: true,
      emailVerified: true,
    },
  });

  console.log('Fetching locations data from external repository...');
  
  // Checking if provinces already seeded
  const provinceCount = await prisma.province.count();
  if (provinceCount > 0) {
    console.log(`Locations already seeded (${provinceCount} provinces found). Skipping location seed.`);
    return;
  }

  try {
    const response = await fetch('https://raw.githubusercontent.com/ubeydeozdmr/turkiye-il-ilce-mahalle-koy-api/main/data/data.json');
    if (!response.ok) {
      throw new Error(`Failed to fetch location data: ${response.statusText}`);
    }
    
    // Veri yapisi: [ { name: "Adana", districts: [ { name: "Aladağ", neighborhoods: [ { name: "Akpınar Mah." } ] } ] } ]
    const data: any = await response.json();
    console.log(`Successfully fetched ${data.length} provinces. Starting DB insertion (this may take a while)...`);

    for (const provinceData of data) {
      const createdProvince = await prisma.province.create({
        data: {
          name: provinceData.name,
        },
      });

      for (const districtData of provinceData.districts) {
        const createdDistrict = await prisma.district.create({
          data: {
            name: districtData.name,
            provinceId: createdProvince.id,
          },
        });

        const neighborhoodInserts = districtData.neighborhoods.map((n: any) => ({
          name: n.name,
          districtId: createdDistrict.id,
        }));

        // Batch insert neighborhoods to save time
        await prisma.neighborhood.createMany({
          data: neighborhoodInserts,
        });
      }
      console.log(`Seeded province: ${provinceData.name}`);
    }
    
    console.log('Locations seeded successfully!');
  } catch (error) {
    console.error('Error seeding locations:', error);
  }

  console.log('Seed process finished!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
