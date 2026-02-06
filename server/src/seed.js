import supabase from "./supabase.js";
import crypto from "crypto";
import "dotenv/config";

// Password hashing functions
const hashPassword = (password) => {
    const salt = crypto.randomBytes(16).toString("hex");
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
    return { salt, hash };
};

// Seed admin user
const seedAdmin = async () => {
    console.log("🚀 Starting admin seeder...");

    const adminData = {
        username: "hoanganhdo181@gmail.com",
        displayName: "Admin Root",
        password: "Hanh2004@"
    };

    try {
        // Check if admin already exists
        const { data: existingUser, error: fetchError } = await supabase
            .from('users')
            .select('id')
            .eq('username', adminData.username)
            .single();

        if (existingUser) {
            console.log("⚠️  Admin user already exists:", adminData.username);
        } else {
            // Hash password
            const { salt, hash } = hashPassword(adminData.password);

            // Create new admin user
            const { data: newUser, error: insertError } = await supabase
                .from('users')
                .insert({
                    username: adminData.username,
                    display_name: adminData.displayName,
                    password: hash,
                    salt: salt
                })
                .select()
                .single();

            if (insertError) {
                throw insertError;
            }

            console.log("✅ Admin user created successfully!");
            console.log("   Username:", adminData.username);
            console.log("   Password:", adminData.password);
        }
    } catch (error) {
        console.error("❌ Error creating admin:", error.message);
    }

    process.exit(0);
};

seedAdmin();
