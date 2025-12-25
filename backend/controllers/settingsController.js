import Settings from "../models/Settings.js"

/**
 * @route   GET /api/settings
 * @access  Admin / Pharmacist
 * returns a singleton settings doc (creates defaults if missing)
 */
export const getSettings = async (req, res, next) => {
  try {
    let settings = await Settings.findOne()
    if (!settings) {
      settings = await Settings.create({ updatedBy: req.user?._id })
    }
    res.json(settings)
  } catch (err) {
    next(err)
  }
}

/**
 * @route   PUT /api/settings
 * @access  Admin / Pharmacist
 * updates singleton settings doc (upsert)
 */
export const updateSettings = async (req, res, next) => {
  try {
    const payload = {
      ...req.body,
      updatedBy: req.user._id,
    }

    const updated = await Settings.findOneAndUpdate(
      {},
      payload,
      { new: true, upsert: true, setDefaultsOnInsert: true }
    )

    res.json(updated)
  } catch (err) {
    next(err)
  }
}
