import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import encrypt from 'mongoose-encryption'
const app = express();
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
mongoose.connect("mongodb://localhost:27017/secrets")
.then(() => console.log("MongoDB connected"))
.catch((err) => console.error("MongoDB connection error:", err));
const userSchema = new mongoose.Schema({
    email: String,
    password: String
});
const secret ="thisislittlesecret.";
userSchema.plugin(encrypt,{secret:secret,encryptedFields:["password"]});
const User = mongoose.model("User", userSchema);
app.get("/", (req, res) => {
    res.render("home");
});
app.get("/register", (req, res) => {
    res.render("register");
});
app.post("/register", async (req, res) => {
    try {
        const newUser = new User({
            email: req.body.email,
            password: req.body.password
        });

        await newUser.save(); 
        res.render("secrets"); 
    } catch (err) {
        console.error("Registration error:", err);
        res.status(500).send("An error occurred during registration");
    }
});
app.post("/login", async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    try {
        const foundUser = await User.findOne({ email: username });
        if (foundUser) {
            if (foundUser.password === password) {
                res.render("secrets"); 
            } 
        } 
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).send("An error occurred during login");
    }
});

app.get("/login", (req, res) => {
    res.render("login");
});

app.listen(8000, () => {
    console.log("Server started");
});
