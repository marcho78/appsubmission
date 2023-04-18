// Import required modules
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

// Initialize the app
const app = express();

// Middleware for handling JSON data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Connect to the MongoDB database
mongoose.connect('mongodb://localhost/app-listing', { useNewUrlParser: true, useUnifiedTopology: true });

// Define App and Category schemas
const AppSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  rating: { type: Number, default: 0 },
  comments: [{ body: String, date: Date }]
});

const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  apps: [{ type: mongoose.Schema.Types.ObjectId, ref: 'App' }]
});

// Create App and Category models
const App = mongoose.model('App', AppSchema);
const Category = mongoose.model('Category', CategorySchema);

// Route for creating a new category
app.post('/categories', async (req, res) => {
  try {
    const category = new Category(req.body);
    await category.save();
    res.status(201).send(category);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

// Route for listing all categories
app.get('/categories', async (req, res) => {
  try {
    const categories = await Category.find().populate('apps');
    res.send(categories);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// Route for adding an app to a category
app.post('/categories/:categoryId/apps', async (req, res) => {
  try {
    const category = await Category.findById(req.params.categoryId);
    if (!category) return res.status(404).send({ error: 'Category not found' });

    const app = new App({ ...req.body, category: category._id });
    await app.save();

    category.apps.push(app);
    await category.save();

    res.status(201).send(app);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

// Route for updating the rating of an app
app.patch('/apps/:appId/rating', async (req, res) => {
  try {
    const app = await App.findById(req.params.appId);
    if (!app) return res.status(404).send({ error: 'App not found' });

    const rating = parseInt(req.body.rating);
    if (isNaN(rating) || rating < 1 || rating > 5) {
      return res.status(400).send({ error: 'Invalid rating value' });
    }

    app.rating = rating;
    await app.save();

    res.send(app);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

// Route for adding a comment to an app
app.post('/apps/:appId/comments', async (req, res) => {
  try {
    const app = await App.findById(req.params.appId);
    if (!app) return res.status(404).send({ error: 'App not found' });

    const comment = { body: req.body.body, date: new Date() };
    app.comments.push(comment);
    await app.save();

    res.status(201).send(comment);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

// Start the server
const PORT = process.env

.PORT || 3000;
app.listen(PORT, () => {
console.log(Server is running on port ${PORT});
});