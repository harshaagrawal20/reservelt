// Demo Products Data for Testing Enhanced Features
const demoProducts = [
  {
    title: "Professional DSLR Camera Kit",
    description: "High-end Canon EOS R5 with multiple lenses, perfect for professional photography and videography. Includes 24-70mm f/2.8, 70-200mm f/2.8 lenses, extra batteries, and accessories.",
    category: "Photography",
    brand: "Canon",
    tags: ["professional", "dslr", "video", "4k", "mirrorless"],
    targetAudience: "Professionals",
    pricePerDay: 89.99,
    pricePerWeek: 450.00,
    location: "San Francisco, CA",
    pickupLocation: "123 Photography Studio, San Francisco, CA 94102",
    dropLocation: "123 Photography Studio, San Francisco, CA 94102",
    images: [
      "https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=500",
      "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=500"
    ],
    availability: [
      { startDate: new Date('2024-08-15'), endDate: new Date('2024-12-31') }
    ]
  },
  {
    title: "Mountain Bike - Trek X-Caliber 8",
    description: "High-performance mountain bike perfect for trail riding and adventure cycling. Features 29-inch wheels, 12-speed Shimano drivetrain, and RockShox suspension.",
    category: "Cycling",
    brand: "Trek",
    tags: ["mountain", "trail", "adventure", "offroad", "29er"],
    targetAudience: "Adults",
    pricePerHour: 12.50,
    pricePerDay: 45.00,
    location: "Portland, OR",
    pickupLocation: "456 Bike Shop Ave, Portland, OR 97201",
    dropLocation: "456 Bike Shop Ave, Portland, OR 97201",
    images: [
      "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=500",
      "https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=500"
    ],
    availability: [
      { startDate: new Date('2024-08-10'), endDate: new Date('2024-12-31') }
    ]
  },
  {
    title: "Kids Football Set - Complete Kit",
    description: "Complete football training kit for children aged 6-12. Includes regulation-size footballs, cones, training markers, and goal posts. Perfect for backyard practice or team training.",
    category: "Football",
    brand: "Wilson",
    tags: ["kids", "training", "team", "practice", "youth"],
    targetAudience: "Kids",
    pricePerDay: 25.00,
    pricePerWeek: 120.00,
    location: "Austin, TX",
    pickupLocation: "789 Sports Center Dr, Austin, TX 78701",
    dropLocation: "789 Sports Center Dr, Austin, TX 78701",
    images: [
      "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=500",
      "https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=500"
    ],
    availability: [
      { startDate: new Date('2024-08-12'), endDate: new Date('2024-12-31') }
    ]
  },
  {
    title: "Professional Badminton Racket Set",
    description: "Premium Yonex Arcsaber 11 racket set with professional-grade strings and accessories. Includes 2 rackets, shuttlecocks, and carrying case. Ideal for competitive play.",
    category: "Badminton",
    brand: "Yonex",
    tags: ["professional", "competitive", "tournament", "premium", "carbon"],
    targetAudience: "Professionals",
    pricePerDay: 35.00,
    pricePerWeek: 200.00,
    location: "Seattle, WA",
    pickupLocation: "321 Racket Sports Club, Seattle, WA 98101",
    dropLocation: "321 Racket Sports Club, Seattle, WA 98101",
    images: [
      "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=500"
    ],
    availability: [
      { startDate: new Date('2024-08-20'), endDate: new Date('2024-12-31') }
    ]
  },
  {
    title: "Camping Gear Bundle - Family Size",
    description: "Complete camping setup for a family of 4-6 people. Includes 6-person tent, sleeping bags, camping chairs, portable stove, cooler, and essential camping accessories.",
    category: "Camping",
    brand: "Coleman",
    tags: ["family", "outdoor", "wilderness", "adventure", "complete"],
    targetAudience: "All Ages",
    pricePerDay: 65.00,
    pricePerWeek: 350.00,
    location: "Denver, CO",
    pickupLocation: "555 Outdoor Gear St, Denver, CO 80202",
    dropLocation: "555 Outdoor Gear St, Denver, CO 80202",
    images: [
      "https://images.unsplash.com/photo-1487730116645-74489c95b41b?w=500",
      "https://images.unsplash.com/photo-1504851149312-7a075b496cc7?w=500"
    ],
    availability: [
      { startDate: new Date('2024-08-18'), endDate: new Date('2024-12-31') }
    ]
  },
  {
    title: "Electric Guitar with Amplifier",
    description: "Fender Stratocaster electric guitar with Marshall amplifier. Perfect for beginners learning to play or professionals needing a backup instrument. Includes cables and picks.",
    category: "Music",
    brand: "Fender",
    tags: ["electric", "rock", "blues", "amplifier", "beginner"],
    targetAudience: "Beginners",
    pricePerDay: 40.00,
    pricePerWeek: 220.00,
    location: "Nashville, TN",
    pickupLocation: "777 Music Row, Nashville, TN 37203",
    dropLocation: "777 Music Row, Nashville, TN 37203",
    images: [
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500",
      "https://images.unsplash.com/photo-1564186763535-ebb21ef5277f?w=500"
    ],
    availability: [
      { startDate: new Date('2024-08-14'), endDate: new Date('2024-12-31') }
    ]
  },
  {
    title: "Power Tool Set - Professional Grade",
    description: "Complete DeWalt power tool collection including drill, circular saw, jigsaw, grinder, and more. All tools come with batteries, chargers, and carrying cases. Perfect for construction projects.",
    category: "Tools",
    brand: "DeWalt",
    tags: ["construction", "professional", "power", "battery", "complete"],
    targetAudience: "Professionals",
    pricePerDay: 75.00,
    pricePerWeek: 400.00,
    location: "Chicago, IL",
    pickupLocation: "888 Tool Warehouse, Chicago, IL 60601",
    dropLocation: "888 Tool Warehouse, Chicago, IL 60601",
    images: [
      "https://images.unsplash.com/photo-1581783898377-1fcbf5bddc8b?w=500",
      "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=500"
    ],
    availability: [
      { startDate: new Date('2024-08-16'), endDate: new Date('2024-12-31') }
    ]
  },
  {
    title: "Gaming Laptop - High Performance",
    description: "MSI Gaming laptop with RTX 4070, Intel i7 processor, 32GB RAM, and 1TB SSD. Perfect for gaming tournaments, content creation, or professional work requiring high performance.",
    category: "Electronics",
    brand: "MSI",
    tags: ["gaming", "laptop", "rtx", "performance", "streaming"],
    targetAudience: "Adults",
    pricePerDay: 95.00,
    pricePerWeek: 500.00,
    location: "Los Angeles, CA",
    pickupLocation: "999 Tech Center Blvd, Los Angeles, CA 90210",
    dropLocation: "999 Tech Center Blvd, Los Angeles, CA 90210",
    images: [
      "https://images.unsplash.com/photo-1593062096033-9a26b2e69353?w=500",
      "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500"
    ],
    availability: [
      { startDate: new Date('2024-08-22'), endDate: new Date('2024-12-31') }
    ]
  },
  {
    title: "Cricket Equipment Set - Youth League",
    description: "Complete cricket set designed for youth players. Includes bat, ball, pads, gloves, helmet, and stumps. Perfect for school teams or youth cricket leagues.",
    category: "Cricket",
    brand: "Kookaburra",
    tags: ["youth", "league", "school", "complete", "safety"],
    targetAudience: "Kids",
    pricePerDay: 30.00,
    pricePerWeek: 180.00,
    location: "Miami, FL",
    pickupLocation: "111 Cricket Club Rd, Miami, FL 33101",
    dropLocation: "111 Cricket Club Rd, Miami, FL 33101",
    images: [
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500"
    ],
    availability: [
      { startDate: new Date('2024-08-11'), endDate: new Date('2024-12-31') }
    ]
  },
  {
    title: "Pro Tennis Racket - Tournament Ready",
    description: "Wilson Pro Staff racket used by professional players. Perfectly balanced for advanced players with premium string setup. Includes racket case and extra strings.",
    category: "Sports",
    brand: "Wilson",
    tags: ["tournament", "professional", "advanced", "premium", "balanced"],
    targetAudience: "Professionals",
    pricePerDay: 28.00,
    pricePerWeek: 160.00,
    location: "New York, NY",
    pickupLocation: "222 Tennis Academy, New York, NY 10001",
    dropLocation: "222 Tennis Academy, New York, NY 10001",
    images: [
      "https://images.unsplash.com/photo-1551778056-b71cbe5ba2c4?w=500"
    ],
    availability: [
      { startDate: new Date('2024-08-13'), endDate: new Date('2024-12-31') }
    ]
  }
];

// Function to seed demo data (would be called from backend)
export const seedDemoProducts = async () => {
  try {
    console.log('Seeding demo products...');
    for (const product of demoProducts) {
      // This would typically be an API call to create products
      console.log(`Creating product: ${product.title}`);
    }
    console.log('Demo products seeded successfully!');
  } catch (error) {
    console.error('Error seeding demo products:', error);
  }
};

export default demoProducts;
