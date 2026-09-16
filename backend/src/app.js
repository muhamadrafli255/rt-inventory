require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');

const app = express();

const authRoutes = require("./routes/auth.routes");
const permissionTestRoutes = require("./routes/permission-test.routes");
const categoryRoutes = require("./routes/category.routes");
const itemRoutes = require("./routes/item.routes");
const loanRoutes = require("./routes/loan.routes");
const dashboardRoutes = require("./routes/dashboard.routes");

app.use(
    cors({
        origin: process.env.FRONTEND_URL,
        credentials: true,
    })
);

app.use(helmet());

app.use(
    express.json({
        limit: "1mb",
    })
);

app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
});

app.use('/api', apiLimiter);

app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: "RT Inventory Is Running",
    });
});

app.use("/api/auth", authRoutes);
app.use("/api/test-permissions", permissionTestRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/loans", loanRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Endpoint Not Found",
    });
});

app.use((err, req, res, next) => {
    console.error(err);
    
    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || "There is an error in server",
    });
});

module.exports = app;