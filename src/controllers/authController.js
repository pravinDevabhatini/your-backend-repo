const jwt = require("jsonwebtoken");
const User = require("../models/User"); // MongoDB model
const { IST } = require("../utils/helpers");

exports.login = async (req, res) => {
  try {

    const { username, password } = req.body;

    const user = await User.findOne({ username });

    if (!user || user.password !== password) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { role: user.role, name: user.name, userId: user._id },
      process.env.JWT_SECRET || "carcart_secret",
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      token,
      role: user.role,
      name: user.name,
      userId: user._id,
      loginAt: IST()
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
