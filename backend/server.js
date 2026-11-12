require("dotenv").config();
const express = require("express");
const cors = require("cors");
const sql = require("mssql");

const app = express();
app.use(cors());
app.use(express.json());
const path = require("path");
app.use(express.static(path.join(__dirname, "..", "Html test")));

const config = {
  server: process.env.DB_SERVER,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};

// Kết nối một lần, dùng lại cho mọi request
const poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then((pool) => {
    console.log("Đã kết nối SQL Server");
    return pool;
  })
  .catch((err) => console.error("Lỗi kết nối SQL Server:", err.message));

// API lấy danh sách món ăn
app.get("/api/products", async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
  SELECT
    MaMon     AS id,
    TenMon    AS name,
    NhomMon   AS category,
    Gia       AS price,
    DonVi     AS unit,
    MoTa      AS description,
    HuongVi   AS flavor,
    XuatXu    AS origin,
    CachDung  AS usage,
    BaoQuan   AS storage,
    HanDung   AS shelfLife,
    LuuYDiUng AS allergy,
    HopLamQua AS isGift,
    TonKho    AS stock
  FROM MonAn
`);
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Lỗi truy vấn dữ liệu" });
  }
});

app.listen(3000, "0.0.0.0", () => console.log("Web + API chạy tại http://localhost:3000"));