const bcrypt = require('bcryptjs');
const connectDB = require('./config/db');
const User = require('./models/User');
const Project = require('./models/Project');
const Task = require('./models/Task');

// Env based passwords (fallback for local)
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const USER_PASSWORD = process.env.USER_PASSWORD;

/**
 * Clear all collections (used only for destroy mode)
 */
const clearDatabase = async () => {
    await Promise.all([
        User.deleteMany(),
        Project.deleteMany(),
        Task.deleteMany()
    ]);
};

/**
 * Seed users with duplication restriction (UPSERT)
 */
const seedUsers = async () => {
    const salt = await bcrypt.genSalt(10);

    const adminPassword = await bcrypt.hash(ADMIN_PASSWORD, salt);
    const userPassword = await bcrypt.hash(USER_PASSWORD, salt);

    const users = [
        {
            name: 'Admin User',
            email: 'admin@example.com',
            password: adminPassword,
            role: 'admin'
        },
        {
            name: 'User One',
            email: 'user1@example.com',
            password: userPassword,
            role: 'user'
        },
        {
            name: 'User Two',
            email: 'user2@example.com',
            password: userPassword,
            role: 'user'
        },
        {
            name: 'User Three',
            email: 'user3@example.com',
            password: userPassword,
            role: 'user'
        }
    ];

    const bulkOps = users.map(user => ({
        updateOne: {
            filter: { email: user.email },     // duplicate restriction
            update: { $setOnInsert: user },    // insert only if not exists
            upsert: true
        }
    }));

    await User.bulkWrite(bulkOps);
};

/**
 * Import seed data
 */
const importData = async () => {
    try {
        await connectDB();
        console.log('Database connected');

        await seedUsers();
        console.log('Data imported successfully');
        process.exit(0);
    } catch (error) {
        console.error('Import error:', error);
        process.exit(1);
    }
};

/**
 * Destroy all data
 */
const destroyData = async () => {
    try {
        await connectDB();
        console.log('Database connected');

        await clearDatabase();
        console.log('All data destroyed');

        process.exit(0);
    } catch (error) {
        console.error('Destroy error:', error);
        process.exit(1);
    }
};

// CLI handling
if (process.argv[2] === '-d') {
    destroyData();
} else {
    importData();
}
