import jwt from "jsonwebtoken";
import "dotenv/config";
import Registration from "../models/user.js";
import Admin from "../models/admin.js";

export const userMiddleware = async (req, res, next) => {
  try {
    const header = req.headers["authorization"];
    if (!header) {
      return res.status(401).json({ message: "No token provided" });
    }
    const token = header.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Invalid token format" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Verify the user actually still exists in database
    const user = await Registration.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: "User no longer exists" });
    }

    req.user = decoded; // { id, role, email }
    next();
  } catch (error) {
    console.log("[ERROR userMiddleware]", error);
    return res.status(401).json({ message: "Token is invalid or expired" });
  }
};

export const adminMiddleware = async (req, res, next) => {
  try {
    const header = req.headers["authorization"];
    if (!header) {
      return res.status(401).json({ message: "No token provided" });
    }
    const token = header.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Invalid token format" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "admin" && decoded.role !== "superadmin") {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }

    // Verify the admin actually still exists in database
    const admin = await Admin.findById(decoded.id);
    if (!admin) {
      return res
        .status(401)
        .json({ message: "Admin account no longer exists" });
    }

    req.user = decoded;
    next();
  } catch (error) {
    console.log("[ERROR adminMiddleware]", error);
    return res.status(401).json({ message: "Token is invalid or expired" });
  }
};
