const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const Product = require('./models/products');
const OrderModel = require('./models/checkout');
const User = require('./models/signup');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(bodyParser.json());

mongoose.connect("mongodb+srv://ahmeddehwar2:PKshop@pkshop.tvb81o0.mongodb.net/", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', (error) => {
  console.error('MongoDB connection error:', error);
});
db.once('open', () => {
  console.log('Connected to MongoDB');
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './server/uploaded');
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {

    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'), false);
    }
  }
});





app.post('/api/products', upload.array('additionalImages', 5), async (req, res) => {
  try {
    const productData = req.body;
    productData.prices = parseFloat(productData.price).toString();

    delete productData.price;


    const newProduct = new Product(productData);


    const originalFileNames = Array.isArray(req.files)? req.files.map((file) => file.originalname): [];
    const additionalImagesData = [];

    req.files.forEach((file, index) => {
      additionalImagesData.push({
        url: file.path,
        originalName: originalFileNames[index],
      });
    });

    newProduct.additionalImages = additionalImagesData;
    await newProduct.save();

    res.status(201).json({ message: 'Product created successfully', product: newProduct });
  } catch (error) {
    console.error('Error saving product:', error);
    res.status(500).json({ message: 'Failed to create product' });
  }
});

app.delete('/api/orders/:orderId', async (req, res) => {
  try {
    const orderId = req.params.orderId;

    // Use the Mongoose findByIdAndDelete method to delete the order by its ID
    const deletedOrder = await OrderModel.findByIdAndDelete(orderId);

    if (!deletedOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // If the order is successfully deleted, send a success response
    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({ message: 'Failed to delete order' });
  }
});



app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Failed to fetch products' });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json(product);
  } catch (error) {
    console.error('Error fetching product by ID:', error);
    res.status(500).json({ message: 'Failed to fetch product' });
  }
});


app.put('/api/products/:id', async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json({ message: 'Product updated successfully', product: updatedProduct });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Failed to update product' });
  }
});


app.delete('/api/products/:id', async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndRemove(req.params.id);
    if (!deletedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json({ message: 'Product deleted successfully', product: deletedProduct });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Failed to delete product' });
  }
});

app.post('/api/orders', async (req, res) => {

  const orderData = req.body;

  try {

    const order = new OrderModel({
      firstname: orderData.firstname,
      email: orderData.email,
      number: orderData.number,
      address: orderData.address,
      city: orderData.city,
      checkoutData: orderData.checkoutData,
      date: orderData.date,
    });

    await order.save();

    res.json({ message: 'Order saved successfully' });
  } catch (error) {
    console.error('Error saving order:', error);
    res.status(500).json({ error: 'Error saving order' });
  }
});

app.get('/api/orders', async (req, res) => {
  try {

    const orders = await OrderModel.find();

    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: 'No orders found' });
    }


    res.status(200).json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
});

app.post('/api/signup', async (req, res) => {
  try {
    const { signupName, signupEmail, signupPassword, type } = req.body;

    const existingUser = await User.findOne({ signupEmail });

    if (existingUser) {
      return res.status(400).json({ message: 'Email address already in use' });
    }

    const user = new User({ signupName, signupEmail, signupPassword, type });
    await user.save();

    res.status(201).json({ message: 'Signup successful' });
  } catch (error) {

    res.status(500).json({ error: 'Internal server error' });
  }
});



















app.post('/check-session', function (req, res) {
  const token = req.body.meraToken;

  // Verify the JWT token
  jwt.verify(token, 'shoe store wali user ki session', async function (err, data) {
    if (err) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    try {
      // Find the user based on the decoded token data
      const user = await User.findById(data.id);

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Return the user data
      res.json(user);
    } catch (error) {
      console.error('Error finding user:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
});

app.post('/api/login', async (req, res) => {
  try {
    const {    loginEmail,  loginPassword } = req.body;
    const user = await User.findOne({ signupEmail: loginEmail });

    if (!user || loginPassword !== user.signupPassword) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate a JWT token
    jwt.sign({ id: user._id }, 'shoe store wali user ki session', { expiresIn: '1d' }, function (err, myToken) {
      if (err) {
        return res.status(500).json({ error: 'Error generating JWT token' });
      }

      // Send the user and token in the response
      res.json({
        user,
        myToken
      });
    });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


app.use('/server/uploaded', express.static('./data'))
app.use(express.static('./data'))
app.use('/server/uploaded', express.static('./server/uploaded'))
app.use(express.static('./server/uploaded'))
const port = process.env.PORT || 8381;
app.listen(port, () => {
console.log( port)
});
