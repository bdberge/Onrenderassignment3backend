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
      const nameQuery = req.query.name.toLowerCase();
      results = results.filter(unicorn =>
        unicorn.name.toLowerCase().includes(nameQuery)
      );
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

// GET a single unicorn by name
app.get("/unicorns/:name", (req, res) => {
  try {
    const unicorn = unicorns.find(u => u.name === req.params.name);
    if (!unicorn) {
      return res.status(404).json({ error: "Unicorn not found" });
    }
    res.json(unicorn);
  } catch (error) {
    console.error("Error fetching unicorn:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

// POST create a new unicorn
app.post("/unicorns", (req, res) => {
  try {
    const { name, dob, loves, weight, vampires, gender } = req.body;

    // Validate required fields
    if (!name || !dob || !loves || !weight || !gender) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Check if unicorn already exists
    if (unicorns.some(u => u.name === name)) {
      return res.status(409).json({ error: "Unicorn already exists" });
    }

    // Create new unicorn
    const newUnicorn = {
      name,
      dob: new Date(dob),
      loves: Array.isArray(loves) ? loves : [loves],
      weight: Number(weight),
      vampires: vampires ? Number(vampires) : undefined,
      gender,
      vaccinated: true // Default value as per existing data
    };

    unicorns.push(newUnicorn);
    res.status(201).json(newUnicorn);
  } catch (error) {
    console.error("Error creating unicorn", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

// PUT  Update a unicorn
app.put("/unicorns/:name", (req, res) => {
  try {
    const { dob, loves, weight, vampires, gender } = req.body;
    const index = unicorns.findIndex(u => u.name === req.params.name);

    if (index === -1) {
      return res.status(404).json({ error: "Unicorn not found" });
    }

    // Update unicorn properties
    if (dob) unicorns[index].dob = new Date(dob);
    if (loves) unicorns[index].loves = Array.isArray(loves) ? loves : [loves];
    if (weight) unicorns[index].weight = Number(weight);
    if (vampires !== undefined) unicorns[index].vampires = Number(vampires);
    if (gender) unicorns[index].gender = gender;

    res.json(unicorns[index]);
  } catch (error) {
    console.error("Error updating:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

// DELETE  Delete a unicorn
app.delete("/unicorns/:name", (req, res) => {
  try {
    const index = unicorns.findIndex(u => u.name === req.params.name);

    if (index === -1) {
      return res.status(404).json({ error: "Unicorn not found" });
    }

    unicorns.splice(index, 1);
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});