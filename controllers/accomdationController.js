const model = require("../models/listingModel");

exports.calculateday = async (req, res) => {
  const {
    startdate,
    enddate,
    page = 1,
    limit = 10,
    name = "",
    accommodates = "",
    property_type = "",
  } = req.query;

  // Step 1: Check if startdate and enddate are provided
  if (!startdate || !enddate) {
    return res
      .status(400)
      .json({ error: "Both start date and end date are required" });
  }

  // Utility function to parse dates in dd/mm/yyyy format
  const parseDate = (dateStr) => {
    const [day, month, year] = dateStr.split("/").map(Number);
    if (!day || !month || !year) {
      throw new Error("Invalid date format");
    }
    if (day < 1 || day > 31) {
      throw new Error("Invalid day");
    }
    if (month < 1 || month > 12) {
      throw new Error("Invalid month");
    }
    return new Date(year, month - 1, day);
  };

  // Step 2: Convert startdate and enddate to Date objects using the parseDate function
  let date1, date2;
  try {
    date1 = parseDate(startdate);
    date2 = parseDate(enddate);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }

  // Validate the dates
  if (
    !(date1 instanceof Date && !isNaN(date1)) ||
    !(date2 instanceof Date && !isNaN(date2))
  ) {
    return res.status(400).json({ error: "Invalid date format" });
  }

  // Get current date
  const currentDate = new Date();

  // Step 3: Check if startdate is in the future compared to the current date
  if (date1 < currentDate) {
    return res
      .status(400)
      .json({ error: "Start date should be in the future" });
  }
  if (date2 < date1) {
    return res.status(400).json({ error: "enter the valie end date" });
  }

  // Step 4: Calculate the difference in days between startdate and enddate
  const one_day = 1000 * 60 * 60 * 24;
  const differenceInTime = date2.getTime() - date1.getTime();
  const differenceInDays = Math.round(differenceInTime / one_day);

  try {
    // Build aggregation pipeline based on provided filters
    let pipeline = [
      {
        $addFields: {
          minNightsInt: { $toInt: "$minimum_nights" },
          maxNightsInt: { $toInt: "$maximum_nights" },
        },
      },
      {
        $match: {
          minNightsInt: { $lte: differenceInDays },
          maxNightsInt: { $gte: differenceInDays },
        },
      },
      {
        $project: {
          property_type: 1,
          name: 1,
          minimum_nights: 1,
          maximum_nights: 1,
          bedrooms: 1,
          accommodates: 1,
          _id: 0,
        },
      },
    ];

    // Sort by name in ascending order if provided
    pipeline.push({
      $sort: {
        name: 1,
      },
    });

    // Add regex filter for name if provided
    if (name) {
      pipeline.push({
        $match: {
          name: { $regex: name, $options: "i" }, // Case insensitive regex match
        },
      });
    }

    // Filter for minimum accommodates if provided
    if (accommodates) {
      pipeline.push({
        $match: {
          accommodates: { $gte: parseInt(accommodates) },
        },
      });
    }

    // Add filter for property_type if provided
    if (property_type) {
      pipeline.push({
        $match: {
          property_type: property_type, // Exact match for property_type
        },
      });
    }

    // Calculate the total number of documents matching the criteria
    const totalresults = await model.aggregate([...pipeline]);

    const totalCount = totalresults.length;
    const totalPages = Math.ceil(totalCount / limit);

    // Apply pagination
    pipeline.push({ $skip: (page - 1) * limit }, { $limit: parseInt(limit) });

    // Get the results with sorting and pagination
    const results = await model.aggregate([...pipeline]);

    res.json({
      differenceInDays,
      page: parseInt(page),
      limit: parseInt(limit),
      totalCount,
      totalPages,
      results,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch listings" });
  }
};
