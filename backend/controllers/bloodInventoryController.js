// controllers/bloodInventoryController.js
const BloodInventory = require("../models/BloodInventory");

exports.getHospitalInventory = async (req, res) => {
  try {
    const inv = await BloodInventory.findOne({ hospital: req.params.hospitalId })
      .populate("hospital", "hospitalName address.city");
    if (!inv) return res.status(404).json({ message: "Inventory not found" });

    res.json({
      inventory: inv,
      hospital: inv.hospital
        ? {
            id: inv.hospital._id,
            name: inv.hospital.hospitalName,
            city: inv.hospital.address?.city || "",
          }
        : null,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.updateHospitalInventory = async (req, res) => {
  try {
    const { units, capacity } = req.body;

    // Fill city from the Hospital record when creating new inventory row
    const Hospital = require("../models/Hospital");
    const hospital = await Hospital.findById(req.params.hospitalId);
    if (!hospital) return res.status(404).json({ message: "Hospital not found" });

    const inv = await BloodInventory.findOneAndUpdate(
      { hospital: req.params.hospitalId },
      {
        $set: {
          ...(units && { units }),
          ...(capacity && { capacity }),
          city: hospital.address.city,
          lastUpdated: new Date(),
        },
        $setOnInsert: { hospital: req.params.hospitalId },
      },
      { new: true, upsert: true, runValidators: true }
    );

    res.json({ message: "Inventory updated", inventory: inv });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};