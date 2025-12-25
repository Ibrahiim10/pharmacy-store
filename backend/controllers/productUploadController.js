
import Product from "../models/Product.js"
import cloudinary from "../utils/cloudinary.js"

export const uploadProductImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" })
    }

    const product = await Product.findById(req.params.id)
    if (!product) return res.status(404).json({ message: "Product not found" })

    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "pharmacy_products",
        resource_type: "image",
      },
      async (error, result) => {
        if (error) return next(error)

        // ✅ Set cover image + keep in gallery
        product.image = result.secure_url
        if (!product.images.includes(result.secure_url)) {
          product.images.push(result.secure_url)
        }

        await product.save()

        res.status(201).json({
          success: true,
          imageUrl: result.secure_url,
          product,
        })
      }
    )

    stream.end(req.file.buffer)
  } catch (err) {
    next(err)
  }
}
