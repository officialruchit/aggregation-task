const Listing = require("../models/listingModel");

exports.listingData = async (req, res) => {
  const page = parseInt(req?.query?.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  try {
    const totalData = await Listing.countDocuments();
    const totalpage = Math.ceil(totalData / limit);
    const results = await Listing.aggregate([
      {
        $group: {
          _id: "$property_type",
          count: { $sum: 1 },
        },
      },
      {
        $addFields: {
          propertyType: "$_id",
        },
      },
      {
        $project: {
          _id: 0,
          propertyType: 1,
          count: 1,
        },
      },
      {
        $sort: { property_type: 1, count: 1 },
      },
      {
        $limit: limit,
      },
    ]);

    res.json({
      totalData,
      page,
      limit,
      totalpage,
      results,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch property types" });
  }
};
exports.searchByName = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const name = req.query.name;
  const date = new Date();
  const day = date.getDate();

  try {
    const totalData = await Listing.countDocuments({ name: { $regex: name } });
    const totalpage = Math.ceil(totalData / limit);
    const results = await Listing.find(
      {
        name: {
          $regex: name,
        },
      },
      {
        name: 1,
        _id: 0,
      }
    ).limit(limit);

    res.json({
      totalData,
      page,
      totalpage,
      limit,
      results,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch listings by name" });
  }
};
