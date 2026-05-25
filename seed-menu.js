const mongoose = require("mongoose");
require("dotenv").config();
const MenuItem = require("./models/MenuItem");

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 30000,
  })
  .then(async () => {
    console.log("✅ MongoDB connected for seeding");

    // Sample menu items for ESC Cafe
    const menuItems = [
      // Espresso
      {
        name: "Classic Americano",
        price: 85,
        category: "Espresso",
        description: "Rich and bold espresso shots with hot water",
        available: true,
      },
      {
        name: "Cappuccino",
        price: 120,
        category: "Espresso",
        description: "Smooth espresso with velvety steamed milk and foam",
        available: true,
      },
      {
        name: "Latte",
        price: 130,
        category: "Espresso",
        description: "Creamy espresso and steamed milk with light foam",
        available: true,
      },
      {
        name: "Macchiato",
        price: 110,
        category: "Espresso",
        description: "Espresso marked with a small amount of milk foam",
        available: true,
      },
      {
        name: "Flat White",
        price: 140,
        category: "Espresso",
        description: "Double shot espresso with velvety microfoam",
        available: true,
      },

      // Signature Blends
      {
        name: "Classic",
        price: 85,
        category: "Signature",
        description: "Our signature blend - smooth and balanced",
        available: true,
      },
      {
        name: "Sea Salt Americano",
        price: 105,
        category: "Signature",
        description: "Americano with a touch of sea salt for subtle sweetness",
        available: true,
      },
      {
        name: "Sweet ESCape",
        price: 115,
        category: "Signature",
        description: "Smooth latte with caramel and vanilla notes",
        available: true,
      },
      {
        name: "Chocolate Dream",
        price: 125,
        category: "Signature",
        description: "Rich chocolate with espresso and steamed milk",
        available: true,
      },

      // Blended (Frappe)
      {
        name: "Caramel Frappe",
        price: 150,
        category: "Blended (Frappe)",
        description: "Blended espresso with caramel and whipped cream",
        available: true,
      },
      {
        name: "Vanilla Frappe",
        price: 145,
        category: "Blended (Frappe)",
        description: "Smooth vanilla blended coffee",
        available: true,
      },
      {
        name: "Mocha Frappe",
        price: 155,
        category: "Blended (Frappe)",
        description: "Chocolate and coffee blended with ice and cream",
        available: true,
      },
      {
        name: "Cookies & Cream Frappe",
        price: 160,
        category: "Blended (Frappe)",
        description: "Blended coffee with cookie pieces and whipped cream",
        available: true,
      },

      // Non-Coffee
      {
        name: "Hot Chocolate",
        price: 95,
        category: "Non-Coffee",
        description: "Rich and creamy hot chocolate",
        available: true,
      },
      {
        name: "Iced Chocolate",
        price: 110,
        category: "Non-Coffee",
        description: "Cold and refreshing chocolate drink",
        available: true,
      },
      {
        name: "Strawberry Milkshake",
        price: 140,
        category: "Non-Coffee",
        description: "Fresh strawberry blended with creamy milk",
        available: true,
      },
      {
        name: "Mango Smoothie",
        price: 130,
        category: "Non-Coffee",
        description: "Tropical mango blend with yogurt",
        available: true,
      },

      // Refreshers
      {
        name: "Iced Lemon Tea",
        price: 80,
        category: "Refreshers",
        description: "Refreshing iced tea with fresh lemon",
        available: true,
      },
      {
        name: "Peach Iced Tea",
        price: 85,
        category: "Refreshers",
        description: "Smooth peach flavored iced tea",
        available: true,
      },
      {
        name: "Mango Juice",
        price: 90,
        category: "Refreshers",
        description: "Fresh mango juice",
        available: true,
      },
      {
        name: "Calamansi Juice",
        price: 75,
        category: "Refreshers",
        description: "Traditional calamansi juice",
        available: true,
      },

      // Add-ons
      {
        name: "Extra Shot of Espresso",
        price: 25,
        category: "Add ons",
        description: "Add an extra espresso shot to any drink",
        available: true,
      },
      {
        name: "Hazelnut Syrup",
        price: 20,
        category: "Add ons",
        description: "Add hazelnut flavoring",
        available: true,
      },
      {
        name: "Vanilla Syrup",
        price: 20,
        category: "Add ons",
        description: "Add vanilla flavoring",
        available: true,
      },
      {
        name: "Caramel Syrup",
        price: 20,
        category: "Add ons",
        description: "Add caramel flavoring",
        available: true,
      },
      {
        name: "Whipped Cream",
        price: 30,
        category: "Add ons",
        description: "Top with fresh whipped cream",
        available: true,
      },
    ];

    try {
      // Clear existing items
      await MenuItem.deleteMany({});
      console.log("🗑️  Cleared existing menu items");

      // Insert new items
      const result = await MenuItem.insertMany(menuItems);
      console.log(`✅ Successfully inserted ${result.length} menu items!`);

      // Display summary
      const categories = await MenuItem.aggregate([
        {
          $group: {
            _id: "$category",
            count: { $sum: 1 },
          },
        },
        {
          $sort: { _id: 1 },
        },
      ]);

      console.log("\n📊 Menu Items by Category:");
      categories.forEach((cat) => {
        console.log(`  • ${cat._id}: ${cat.count} items`);
      });

      console.log(`\n✨ Total menu items: ${result.length}`);
      console.log("\n📋 Sample items:");
      result.slice(0, 5).forEach((item) => {
        console.log(`  • ${item.name} (₱${item.price}) - ${item.category}`);
      });

      process.exit(0);
    } catch (error) {
      console.error("❌ Error inserting menu items:", error.message);
      process.exit(1);
    }
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });
