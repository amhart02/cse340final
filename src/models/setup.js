import db from './db.js';

const createCategoriesTable = `
    CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        slug VARCHAR(100) NOT NULL UNIQUE,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
`;

const createVehiclesTable = `
    CREATE TABLE IF NOT EXISTS vehicles (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        image VARCHAR(500) NOT NULL,
        category_id INTEGER REFERENCES categories(id),
        year INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
`;

const createRolesTable = `
    CREATE TABLE IF NOT EXISTS roles (
        id SERIAL PRIMARY KEY,
        role_name VARCHAR(50) NOT NULL UNIQUE
    );
`;

const insertDefaultRoles = `
    INSERT INTO roles (id, role_name) VALUES 
        (0, 'user'),
        (1, 'employee'), 
        (2, 'management')
    ON CONFLICT (id) DO NOTHING;
`;

const createUsersTable = `
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role_id INTEGER DEFAULT 0 REFERENCES roles(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

const createReviewsTable = `
CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    vehicle_id INTEGER NOT NULL REFERENCES vehicles(id),
    review_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)`;

const createContactMessagesTable = `
CREATE TABLE IF NOT EXISTS contact_messages (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)`;

const initialCategories = [
    {
        name: "Sports Cars",
        slug: "sports-cars",
        description: "High-performance sports vehicles",
    },
    {
        name: "As Seen on TV", 
        slug: "as-seen-on-tv",
        description: "You've seen it on TV first",
    },
    {
        name: "Average Cars",
        slug: "average-cars", 
        description: "These cars are kind of lame",
    },
    {
        name: "Goofy Cars",
        slug: "goofy-cars",
        description: "Why have a lame car when it can be goofy",
    }
];

const getCategoryIdMap = async () => {
    const result = await db.query(`SELECT id, slug FROM categories`);
    const map = {};
    for (const row of result.rows) {
        map[row.slug] = row.id;
    }
    return map;
};

const getInitialVehicles = (categoryIdMap) => [
    {
        name: "Lamborghini Aventador",
        description: "A sleek Italian supercar with a V12 engine and bold design.",
        price: 393695.00,
        image: "../public/images/vehicles/adventador.jpg",
        category_id: categoryIdMap["sports-cars"],
        year: 2022, 
    },
    {
        name: "Aerocar",
        description: "A unique flying car prototype combining aviation and automotive engineering.",
        price: 1500000.00,
        image: "../public/images/vehicles/aerocar.jpg",
        category_id: categoryIdMap["goofy-cars"],
        year: 2020, 
    },
    {
        name: "Chevrolet Camaro",
        description: "A classic American muscle car known for its power and style.",
        price: 32000.00,
        image: "../public/images/vehicles/camaro.jpg",
        category_id: categoryIdMap["sports-cars"],
        year: 2021,
    },
    {
        name: "Ford Crown Victoria",
        description: "A durable sedan famously used by police and taxis.",
        price: 8500.00,
        image: "../public/images/vehicles/crown-victoria.jpg",
        category_id: categoryIdMap["average-cars"],
        year: 2008,
    },
    {
        name: "DeLorean DMC-12",
        description: "A stainless-steel car made famous by Back to the Future.",
        price: 65000.00,
        image: "../public/images/vehicles/delorean.jpg",
        category_id: categoryIdMap["as-seen-on-tv"],
        year: 1981,
    },
    {
        name: "Dog Car",
        description: "A novelty car with floppy ears and a tongue bumper. From *Dumb and Dumber*.",
        price: 2500.00,
        image: "../public/images/vehicles/dog-car.jpg",
        category_id: categoryIdMap["as-seen-on-tv"],
        year: 1994,
    },
    {
        name: "Cadillac Escalade",
        description: "A full-size luxury SUV with bold presence and tech.",
        price: 95000.00,
        image: "../public/images/vehicles/escalade.jpg",
        category_id: categoryIdMap["average-cars"],
        year: 2023, 
    },
    {
        name: "Fire Truck",
        description: "An emergency response vehicle equipped with hoses, ladders, and water pumps.",
        price: 550000.00,
        image: "../public/images/vehicles/fire-truck.jpg",
        category_id: categoryIdMap["goofy-cars"],
        year: 2020,
    },
    {
        name: "Hummer H1",
        description: "Military-grade off-road vehicle turned civilian beast.",
        price: 145000.00,
        image: "../public/images/vehicles/hummer.jpg",
        category_id: categoryIdMap["average-cars"],
        year: 2006,
    },
    {
        name: "Mechanic's Special",
        description: "An old rusty vehicle perfect for restoration projects.",
        price: 600.00,
        image: "../public/images/vehicles/mechanic.jpg",
        category_id: categoryIdMap["goofy-cars"],
        year: 1950,
    },
    {
        name: "Ford Model T",
        description: "The first mass-produced car, introduced by Henry Ford.",
        price: 20000.00,
        image: "../public/images/vehicles/model-t.jpg",
        category_id: categoryIdMap["goofy-cars"],
        year: 1925,
    },
    {
        name: "Monster Truck",
        description: "A massive vehicle with oversized wheels built for stunts.",
        price: 175000.00,
        image: "../public/images/vehicles/monster-truck.jpg",
        category_id: categoryIdMap["goofy-cars"],
        year: 2021,
    },
    {
        name: "Mystery Machine",
        description: "The iconic van from Scooby-Doo’s mystery-solving gang.",
        price: 30000.00,
        image: "../public/images/vehicles/mystery-machine.jpg",
        category_id: categoryIdMap["as-seen-on-tv"],
        year: 1970,
    },
    {
        name: "Surveillance Van",
        description: "An undercover van packed with surveillance gear and dark tinted windows.",
        price: 48000.00,
        image: "../public/images/vehicles/surveillance-van.jpg",
        category_id: categoryIdMap["goofy-cars"],
        year: 2019,
    },
    {
        name: "Jeep Wrangler",
        description: "A rugged off-roader ready for adventure.",
        price: 45000.00,
        image: "../public/images/vehicles/wrangler.jpg",
        category_id: categoryIdMap["average-cars"],
        year: 2022,
    },
];

const insertCategory = async (category, verbose = true) => {
    const query = `
        INSERT INTO categories (name, slug, description)
        VALUES ($1, $2, $3)
        ON CONFLICT (slug) DO NOTHING
        RETURNING id, name, slug;
    `;

    const values = [category.name, category.slug, category.description];
    const result = await db.query(query, values);

    if (result.rows.length > 0 && verbose) {
        console.log(`Created category: ${result.rows[0].name}`);
    } else if (verbose) {
        console.log(`Category already exists, skipping: ${category.name}`);
    }
};

const insertVehicle = async (vehicle, verbose = true) => {
    const query = `
        INSERT INTO vehicles (name, description, price, image, category_id, year)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (name) DO NOTHING
        RETURNING id, name;
    `;
    const values = [
        vehicle.name,
        vehicle.description,
        vehicle.price,
        vehicle.image,
        vehicle.category_id,
        vehicle.year
    ];
    const result = await db.query(query, values);

    if (result.rows.length > 0 && verbose) {
        console.log(`Created vehicle: ${result.rows[0].name}`);
    } else if (verbose) {
        console.log(`Vehicle already exists, skipping: ${vehicle.name}`);
    }
};


const setupDatabase = async () => {
    const verbose = process.env.DISABLE_SQL_LOGGING !== 'true';
 
    try {
        if (verbose) console.log('Setting up database...');
 
        await db.query(createCategoriesTable);
        if (verbose) console.log('Categories table ready');
        
        await db.query(createVehiclesTable);
        if (verbose) console.log('Vehicles table ready');
 
        await db.query(createRolesTable);
        if (verbose) console.log('Roles table ready');

        await db.query(insertDefaultRoles);
        if (verbose) console.log('Default roles inserted');
        
        await db.query(createUsersTable);
        if (verbose) console.log('Users table ready');

        await db.query(createReviewsTable);
        if (verbose) console.log('Reviews table ready');

        await db.query(createContactMessagesTable);
        if (verbose) console.log('Contact Messages table ready');

        
        
        //make categories
        for (const category of initialCategories) {
            await insertCategory(category, verbose);
        }

        //make vehicles
        const categoryIdMap = await getCategoryIdMap();
        const vehicles = getInitialVehicles(categoryIdMap);

        for (const vehicle of vehicles) {
            await insertVehicle(vehicle, verbose);
        }
 
        if (verbose) console.log('Database setup complete');
        return true;
        } catch (error) {
            console.error('Error setting up database:', error.message);
            throw error;
        }
};

const testConnection = async () => {
    try {
        const result = await db.query('SELECT NOW() as current_time');
        console.log('Database connection successful:', result.rows[0].current_time);
        return true;
    } catch (error) {
        console.error('Database connection failed:', error.message);
        throw error;
    }
};

export { setupDatabase, testConnection };