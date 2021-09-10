// jshint esversion :8
const Category = require('../models/categoryModel');

const categoryCtrl = {
  getCategories: async (req, res) => {
    try {
      const categories = await Category.find();

      res.json({ msg: categories });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },

  createCategory: async (req, res) => {
    try {
      const { name } = req.body;
      //   check existing categories
      const category = await Category.findOne({ name });
      console.log(category);

      if (category)
        return res.status(400).json({ msg: 'This category already exists' });

      const newCategory = new Category({ name });
      await newCategory.save();

      res.json({ msg: 'category created' });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  deleteCategory: async (req, res) => {
    try {
      await Category.findByIdAndDelete(req.params.id);

      res.json({ msg: 'Deleted a category.' });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  updateCategory: async (req, res) => {
    try {
      const { name } = req.body;
      await Category.findByIdAndUpdate(req.params.id, { name });

      res.json({ msg: 'updated a category.' });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
};

module.exports = categoryCtrl;
