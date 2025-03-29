// backend
const express = require("express");
const cors = require("cors");
const unicorns = require("./data");

const app = express();


// Middleware
app.use(cors());

// Serve static files from the Frontend directory
app.use(express.static('../Frontend'));

// GET /unicorns - Get all unicorns with optional query parameters
app.get("/unicorns", (req, res) => {
  try {
    let results = [...unicorns];

    // Handle name search
    if (req.query.name) {
      const namePattern = new RegExp(req.query.name, "i");
      results = results.filter(unicorn => namePattern.test(unicorn.name));
    }

    // Handle loves search
    if (req.query.loves) {
      results = results.filter(unicorn =>
        unicorn.loves && unicorn.loves.includes(req.query.loves)
      );
    }

    // Handle weight search
    if (req.query.weightGreaterThan) {
      const weight = parseFloat(req.query.weightGreaterThan);
      results = results.filter(unicorn => unicorn.weight > weight);
    }

    // Handle vampires search
    if (req.query.vampiresGreaterThan) {
      const vampires = parseInt(req.query.vampiresGreaterThan);
      results = results.filter(unicorn =>
        unicorn.vampires && unicorn.vampires > vampires
      );
    }

    // Handle vaccinated search (binary)
    if (req.query.vaccinated !== undefined) {
      const isVaccinated = req.query.vaccinated === "true";
      results = results.filter(unicorn => unicorn.vaccinated === isVaccinated);
    }

    // Handle vampires exists search (binary)
    if (req.query.vampiresExists !== undefined) {
      const hasVampires = req.query.vampiresExists === "true";
      results = results.filter(unicorn =>
        (unicorn.vampires !== undefined) === hasVampires
      );
    }

    // Handle gender search (m/f)
    if (req.query.gender) {
      results = results.filter(unicorn => unicorn.gender === req.query.gender);
    }

    res.json(results);
  } catch (error) {
    console.error("Error fetching unicorns:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
