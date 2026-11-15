// controllers/bloodStatsController.js
const Donor = require("../models/Donor");
const Donation = require("../models/Donation");
const BloodInventory = require("../models/BloodInventory");
const BloodRequest = require("../models/BloodRequest");
const Hospital = require("../models/Hospital");

const GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

/* ------------------------------------------------------------------ */
/*  GET /api/blood-stats/summary                                       */
/* ------------------------------------------------------------------ */
exports.getSummary = async (req, res) => {
  try {
    const [registeredDonors, totalDonations, hospitals, lives] = await Promise.all([
      Donor.countDocuments(),
      Donation.countDocuments(),
      Hospital.countDocuments({ isActive: true, verificationStatus: "Verified" }),
      Donation.aggregate([
        { $group: { _id: null, units: { $sum: "$units" } } },
      ]),
    ]);

    const totalUnits = lives[0]?.units || 0;
    const livesImpacted = totalUnits * 3;

    res.json({
      livesImpacted,
      registeredDonors,
      unitsCollected: totalUnits,
      partnerBloodBanks: hospitals,
      totalDonations,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

/* ------------------------------------------------------------------ */
/*  GET /api/blood-stats/groups                                        */
/* ------------------------------------------------------------------ */
exports.getGroupAvailability = async (req, res) => {
  try {
    const agg = await BloodInventory.aggregate([
      {
        $group: {
          _id: null,
          units: { $push: "$units" },
          capacity: { $push: "$capacity" },
        },
      },
    ]);

    const totals = { units: {}, capacity: {} };
    for (const g of GROUPS) {
      totals.units[g] = 0;
      totals.capacity[g] = 0;
    }
    if (agg[0]) {
      for (const doc of agg[0].units) for (const g of GROUPS) totals.units[g] += doc[g] || 0;
      for (const doc of agg[0].capacity) for (const g of GROUPS) totals.capacity[g] += doc[g] || 0;
    }

    const statusFor = (pct) => {
      if (pct >= 60) return "healthy";
      if (pct >= 40) return "stable";
      if (pct >= 20) return "low";
      return "critical";
    };

    const groups = GROUPS.map((g) => {
      const u = totals.units[g];
      const c = totals.capacity[g] || 1;
      const pct = Math.round((u / c) * 100);
      return { group: g, units: u, capacity: c, pct, status: statusFor(pct) };
    });

    res.json({ groups });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

/* ------------------------------------------------------------------ */
/*  GET /api/blood-stats/urgent                                        */
/* ------------------------------------------------------------------ */
exports.getUrgent = async (req, res) => {
  try {
    const requests = await BloodRequest.find({
      status: "open",
      urgency: { $in: ["urgent", "critical"] },
      neededBy: { $gte: new Date() },
    })
      .sort({ urgency: -1, neededBy: 1 })
      .limit(5);

    const results = requests.map((r) => ({
      id: r._id,
      group: r.bloodGroup,
      city: r.hospital.city,
      need: `${r.unitsNeeded} unit${r.unitsNeeded > 1 ? "s" : ""}`,
      eta: r.neededBy,
      urgency: r.urgency,
    }));

    res.json({ results });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

/* ------------------------------------------------------------------ */
/*  GET /api/blood-stats/compatibility/:group                          */
/* ------------------------------------------------------------------ */
const COMPATIBILITY = {
  "O-":  { canDonateTo: ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"], canReceiveFrom: ["O-"] },
  "O+":  { canDonateTo: ["O+", "A+", "B+", "AB+"],                          canReceiveFrom: ["O-", "O+"] },
  "A-":  { canDonateTo: ["A-", "A+", "AB-", "AB+"],                         canReceiveFrom: ["O-", "A-"] },
  "A+":  { canDonateTo: ["A+", "AB+"],                                       canReceiveFrom: ["O-", "O+", "A-", "A+"] },
  "B-":  { canDonateTo: ["B-", "B+", "AB-", "AB+"],                         canReceiveFrom: ["O-", "B-"] },
  "B+":  { canDonateTo: ["B+", "AB+"],                                       canReceiveFrom: ["O-", "O+", "B-", "B+"] },
  "AB-": { canDonateTo: ["AB-", "AB+"],                                      canReceiveFrom: ["O-", "A-", "B-", "AB-"] },
  "AB+": { canDonateTo: ["AB+"],                                             canReceiveFrom: ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"] },
};

exports.getCompatibility = (req, res) => {
  const { group } = req.params;
  const data = COMPATIBILITY[group];
  if (!data) return res.status(400).json({ message: "Invalid blood group" });
  res.json({ group, ...data });
};