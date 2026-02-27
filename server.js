const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");
const cors = require("cors");
const bcrypt = require("bcrypt");

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
// Serve static files from public directory
app.use(express.static("public"));
// Root route for health check or homepage
app.get("/", (req, res) => {
    res.send("API is running!");
});


// MongoDB Connection
const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017";
const client = new MongoClient(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
let db;

client.connect()
    .then(() => {
        db = client.db(process.env.DB_NAME || "sports_academy");
        console.log("Connected to MongoDB");
    })
    .catch(err => {
        console.error("MongoDB connection error:", err);
    });

// ================= SIGNUP =================
app.post("/signup", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ error: "All fields required" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = { name, email, password: hashedPassword };
        await db.collection("users").insertOne(user);
        res.json({ message: "User registered successfully" });
    } catch (error) {
        console.error("Signup error:", error);
        res.status(500).json({ error: "Email already exists or server error" });
    }
});

// ================= LOGIN =================
app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await db.collection("users").findOne({ email });
        if (!user) {
            return res.status(401).json({ error: "User not found" });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: "Invalid password" });
        }
        delete user.password;
        res.json(user);
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ error: "Server error" });
    }
});

// ================= SAVE BOOKING =================
app.post("/book-slot", async (req, res) => {
    try {
        const {
            user_id,
            sport_name,
            booking_date,
            start_time,
            end_time,
            total_amount,
            paid_amount,
            mobile,
            transaction_id,
            status
        } = req.body;

        const booking = {
            user_id,
            sport_name,
            booking_date,
            start_time,
            end_time,
            total_amount,
            paid_amount,
            mobile,
            transaction_id,
            status
        };
        await db.collection("bookings").insertOne(booking);

        res.json({ message: "Booking saved successfully" });
    } catch (error) {
        console.error("Booking error:", error);
        res.status(500).json({ error: "Booking failed" });
    }
});

// ================= GET USER BOOKINGS =================
app.get("/user-bookings/:userId", async (req, res) => {
    try {
        const userId = req.params.userId;
        const bookings = await db.collection("bookings").find({ user_id: userId }).toArray();
        res.json(bookings);
    } catch (error) {
        console.error("Error fetching bookings:", error);
        res.status(500).json({ error: "DB error" });
    }
});

// ================= SPORTS ENDPOINTS =================
app.post("/add-sport", async (req, res) => {
    try {
        const { name, image_url, description } = req.body;
        const sport = { name, image_url, description };
        await db.collection("sports").insertOne(sport);
        res.json({ message: "Sport added successfully" });
    } catch (error) {
        console.error("Error adding sport:", error);
        res.status(500).json({ error: "Failed to add sport" });
    }
});

app.get("/sports", async (req, res) => {
    try {
        const sports = await db.collection("sports").find({}).toArray();
        res.json(sports);
    } catch (error) {
        console.error("Error fetching sports:", error);
        res.status(500).json({ error: "DB error" });
    }
});

app.put("/update-sport/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, image_url } = req.body;
        await db.collection("sports").updateOne(
            { _id: new ObjectId(id) },
            { $set: { name, description, image_url } }
        );
        res.json({ message: "Sport updated successfully" });
    } catch (error) {
        console.error("Error updating sport:", error);
        res.status(500).json({ error: "Failed to update sport" });
    }
});

app.delete("/delete-sport/:id", async (req, res) => {
    try {
        const { id } = req.params;
        await db.collection("sports").deleteOne({ _id: new ObjectId(id) });
        res.json({ message: "Sport deleted successfully" });
    } catch (error) {
        console.error("Error deleting sport:", error);
        res.status(500).json({ error: "Failed to delete sport" });
    }
});

// ================= TOURNAMENT ENDPOINTS =================
app.post("/add-tournament", async (req, res) => {
    try {
        const {
            name,
            sport_name,
            start_date,
            end_date,
            location,
            registration_deadline,
            image_url,
            description
        } = req.body;

        // Validate required fields
        if (!name || !sport_name || !start_date || !end_date) {
            return res.status(400).json({ error: "Missing required fields: name, sport_name, start_date, end_date" });
        }

        const tournament = {
            name,
            sport_name,
            start_date,
            end_date,
            location: location || '',
            registration_deadline: registration_deadline || '',
            image_url: image_url || '',
            description: description || ''
        };
        const result = await db.collection("tournaments").insertOne(tournament);
        res.json({ message: "Tournament added successfully", id: result.insertedId });
    } catch (error) {
        console.error("Error adding tournament:", error);
        res.status(500).json({ error: "Failed to add tournament: " + error.message });
    }
});

app.get("/tournaments", async (req, res) => {
    try {
        const tournaments = await db.collection("tournaments").find({}).sort({ _id: -1 }).toArray();
        res.json(tournaments);
    } catch (error) {
        console.error("Error fetching tournaments:", error);
        res.status(500).json({ error: "DB error" });
    }
});

app.put("/update-tournament/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { name, sport_name, start_date, end_date, location, registration_deadline, description, image_url } = req.body;
        await db.collection("tournaments").updateOne(
            { _id: new ObjectId(id) },
            { $set: { name, sport_name, start_date, end_date, location, registration_deadline, description, image_url } }
        );
        res.json({ message: "Tournament updated successfully" });
    } catch (error) {
        console.error("Error updating tournament:", error);
        res.status(500).json({ error: "Failed to update tournament" });
    }
});

app.delete("/delete-tournament/:id", async (req, res) => {
    try {
        const { id } = req.params;
        await db.collection("tournaments").deleteOne({ _id: new ObjectId(id) });
        res.json({ message: "Tournament deleted successfully" });
    } catch (error) {
        console.error("Error deleting tournament:", error);
        res.status(500).json({ error: "Failed to delete tournament" });
    }
});

// ================= TOURNAMENT REGISTRATIONS =================
// ================= SLOT ENDPOINT =================
// ================= GET SLOTS ENDPOINT =================
app.get("/slots", async (req, res) => {
    try {
        const sport_id = req.query.sport_id;
        let sql = "SELECT * FROM slots";
        let params = [];
        if (sport_id) {
            sql += " WHERE sport_id = ?";
            params.push(sport_id);
        }
        const [result] = await db.query(sql, params);
        res.json(result);
    } catch (error) {
        console.error("Error fetching slots:", error);
        res.status(500).json({ error: "Failed to fetch slots" });
    }
});
app.post("/add-slot", async (req, res) => {
    try {
        const { sport_id, start_time, end_time, price } = req.body;
        if (!sport_id || !start_time || !end_time || !price) {
            return res.status(400).json({ error: "All fields required" });
        }
        const sql = "INSERT INTO slots (sport_id, start_time, end_time, price) VALUES (?, ?, ?, ?)";
        await db.query(sql, [sport_id, start_time, end_time, price]);
        res.json({ message: "Slot added successfully" });
    } catch (error) {
        console.error("Error adding slot:", error);
        res.status(500).json({ error: "Failed to add slot" });
    }
});
app.post("/register-tournament", async (req, res) => {
    try {
        const { tournament_id, team_name, players, contact } = req.body;

        if (!tournament_id || !team_name || !contact) {
            return res.status(400).json({ error: "Tournament ID, team name, and contact required" });
        }

        const sql = `
            INSERT INTO tournament_registrations 
            (tournament_id, team_name, players, contact, status)
            VALUES (?, ?, ?, ?, 'Registered')
        `;

        const [result] = await db.query(sql, [tournament_id, team_name, players || '', contact]);

        res.json({ message: "Registration successful", id: result.insertId });
    } catch (error) {
        console.error("Error registering for tournament:", error);
        res.status(500).json({ error: "Failed to register: " + error.message });
    }
});

app.get("/tournament-registrations/:tournamentId", async (req, res) => {
    try {
        const { tournamentId } = req.params;
        const [result] = await db.query(
            "SELECT * FROM tournament_registrations WHERE tournament_id = ? ORDER BY id DESC",
            [tournamentId]
        );
        res.json(result);
    } catch (error) {
        console.error("Error fetching registrations:", error);
        res.status(500).json({ error: "DB error" });
    }
});

// ================= START SERVER =================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
});
