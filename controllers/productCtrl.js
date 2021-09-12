// jshint esversion:8

const Product = require('../models/productModel');

const productCtrl = {
  getProducts: async (req, res) => {
    try {
      const products = await Product.find();

      res.json(products);
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  createProduct: async (req, res) => {
    try {
      const {
        product_id,
        title,
        price,
        description,
        content,
        images,
        category,
      } = req.body;

      if (!images) return res.status(400).json({ msg: 'No images uploaded.' });

      const product = await Product.findOne({ product_id });
      if (product)
        return res.status(400).json({ msg: 'Product already exists.' });

      const newProduct = new Product({
        product_id,
        title: title.toLowerCase(),
        price,
        description,
        content,
        images,
        category,
      });

      await newProduct.save();

      res.json({ msg: 'new product created' });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  deleteProduct: async (req, res) => {
    try {
      const { id } = req.params;

      await Product.findByIdAndDelete(id);

      res.json({ msg: 'Product deleted.' });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  updateProduct: async (req, res) => {
    try {
      const { id } = req.params;
      const { title, price, description, content, images, category } = req.body;

      if (!images) return res.status(400).json({ msg: 'No images uploaded.' });

      await Product.findByIdAndUpdate(id, {
        title: title.toLowerCase(),
        price,
        description,
        content,
        images,
        category,
      });

      res.json({ msg: 'Product updated.' });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
};

module.exports = productCtrl;
