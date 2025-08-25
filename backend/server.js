const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const User = require("./models/user");
const DailyWord = require("./models/daily-word");
const GameSession = require("./models/game-session");

const authRoutes = require("./routes/user-routes");
const dailyWordRoutes = require("./routes/admin-routes");
const wordRoutes=require("./routes/word-route")

const cors = require("cors"); //study

app.use(
	cors({
		origin: "http://localhost:5173",
		credentials:true,
	})
)




app.use(express.json());
// routes
app.use("/api/auth", authRoutes);



//wordRoutes
app.use("/api/categories", wordRoutes);


//admin routes
app.use("/api/admin", dailyWordRoutes);

mongoose.connect(process.env.DBURL).then(()=>{
    console.log("Database connected successfully");
    app.listen(process.env.PORT || 8000 , (err)=>{
        if(err) console.log(err);

        console.log("running succesfully at", process.env.PORT)
    });
})

app.get("/", (req,res)=>{
    res.send("api running");
})