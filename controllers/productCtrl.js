// jshint esversion:9

const Product = require('../models/productModel');

// filter , sorting and pagination

class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filtering() {
    const queryObj = { ...this.queryString };

    ['sort', 'limit', 'page'].forEach((field) => {
      delete queryObj[field];
    });

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(
      /\b(gte|gt|lte|lt|regex)\b/g,
      (match) => `$${match}`
    );

    this.query.find(JSON.parse(queryStr));

    return this;
  }

  sorting() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join('');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  paginating() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 9;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}

const productCtrl = {
  getProducts: async (req, res) => {
    try {
      const features = new APIFeatures(Product.find(), req.query)
        .filtering()
        .sorting()
        .paginating();
      const products = await features.query;

      res.json({ status: 'success', number: products.length, products });
    } catch (err) {
      // console.log(err);
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
