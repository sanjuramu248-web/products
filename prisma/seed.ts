import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import axios from 'axios';

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing data
  await prisma.favorite.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();

  console.log('✅ Cleared existing data');

  // Create users
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  const user1 = await prisma.user.create({
    data: {
      email: 'john@example.com',
      password: hashedPassword,
      name: 'John Doe',
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: 'jane@example.com',
      password: hashedPassword,
      name: 'Jane Smith',
    },
  });

  console.log('✅ Users created');

  // Fetch products from DummyJSON API
  console.log('📦 Fetching products from DummyJSON API...');
  
  try {
    const response = await axios.get('https://dummyjson.com/products?limit=30');
    const dummyProducts = response.data.products;

    console.log(`✅ Fetched ${dummyProducts.length} products from DummyJSON`);

    // Create products in database
    const productsToCreate = dummyProducts.map((product: any) => ({
      title: product.title,
      price: product.price,
      description: product.description,
      image: product.thumbnail || product.images[0],
    }));

    await prisma.product.createMany({
      data: productsToCreate,
    });

    console.log('✅ Products created in database');
  } catch (error) {
    console.error('❌ Error fetching from DummyJSON:', error);
    console.log('📦 Using fallback products...');

    // Fallback products if API fails
    const fallbackProducts = [
      {
        title: 'Wireless Headphones',
        price: 79.99,
        description: 'High-quality wireless headphones with noise cancellation',
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
      },
      {
        title: 'Smart Watch',
        price: 199.99,
        description: 'Feature-rich smartwatch with fitness tracking',
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500',
      },
      {
        title: 'Laptop Stand',
        price: 49.99,
        description: 'Ergonomic aluminum laptop stand',
        image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500',
      },
      {
        title: 'Mechanical Keyboard',
        price: 129.99,
        description: 'RGB mechanical keyboard with blue switches',
        image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500',
      },
      {
        title: 'Wireless Mouse',
        price: 39.99,
        description: 'Ergonomic wireless mouse with precision tracking',
        image: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=500',
      },
      {
        title: 'USB-C Hub',
        price: 59.99,
        description: '7-in-1 USB-C hub with HDMI and card reader',
        image: 'https://images.unsplash.com/photo-1625948515291-69613efd103f?w=500',
      },
      {
        title: 'Portable SSD',
        price: 149.99,
        description: '1TB portable SSD with fast transfer speeds',
        image: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=500',
      },
      {
        title: 'Webcam HD',
        price: 89.99,
        description: '1080p HD webcam with auto-focus',
        image: 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=500',
      },
      {
        title: 'Desk Lamp',
        price: 34.99,
        description: 'LED desk lamp with adjustable brightness',
        image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500',
      },
      {
        title: 'Phone Stand',
        price: 19.99,
        description: 'Adjustable phone stand for desk',
        image: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=500',
      },
    ];

    await prisma.product.createMany({
      data: fallbackProducts,
    });

    console.log('✅ Fallback products created');
  }

  console.log('\n📧 Test Credentials:');
  console.log('Email: john@example.com');
  console.log('Password: password123');
  console.log('\nEmail: jane@example.com');
  console.log('Password: password123');
  console.log('\n✨ Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
