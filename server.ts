import express from 'express';
import { createServer as createViteServer } from 'vite';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const app = express();
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-in-production';

app.use(express.json());

// --- Database Setup ---
async function connectDB() {
  let mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    console.log('MONGODB_URI not found. Starting in-memory MongoDB for development...');
    const mongoServer = await MongoMemoryServer.create();
    mongoUri = mongoServer.getUri();
  }

  await mongoose.connect(mongoUri);
  console.log('Connected to MongoDB');
  await seedDatabase();
}

// --- Mongoose Schemas ---
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
}, { timestamps: true });

const productSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true }, // Keeping numeric ID for frontend compatibility
  name: String,
  brand: String,
  price: Number,
  discount: Number,
  image: String,
  images: [String],
  category: String,
  rating: Number,
  stock: Number,
  description: String,
});

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    quantity: Number,
    price: Number,
  }],
  total: Number,
  status: { type: String, default: 'Processing' },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
const Product = mongoose.model('Product', productSchema);
const Order = mongoose.model('Order', orderSchema);

// --- Seeding ---
async function seedDatabase() {
  const count = await Product.countDocuments();
  if (count === 0) {
    const seedProducts = [
      { 
        id: 1, 
        name: 'Oversized Graphic T-Shirt', 
        brand: 'URBAN STREET', 
        price: 1299, 
        discount: 30, 
        image: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=600&auto=format&fit=crop', 
        images: [
          'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=600&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=600&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1583744946564-b52ac1c389c8?q=80&w=600&auto=format&fit=crop'
        ],
        category: 'Men', 
        rating: 4.5, 
        stock: 50, 
        description: 'Comfortable oversized graphic t-shirt for everyday wear.' 
      },
      { 
        id: 2, 
        name: 'Slim Fit Denim Jacket', 
        brand: 'DENIM CO', 
        price: 2499, 
        discount: 15, 
        image: 'https://images.unsplash.com/photo-1495105787522-5334e3ffa0ef?q=80&w=600&auto=format&fit=crop', 
        images: [
          'https://images.unsplash.com/photo-1495105787522-5334e3ffa0ef?q=80&w=600&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1551537482-f2075a1d41f2?q=80&w=600&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1520975916090-3105956dac38?q=80&w=600&auto=format&fit=crop'
        ],
        category: 'Men', 
        rating: 4.2, 
        stock: 30, 
        description: 'Classic slim fit denim jacket.' 
      },
      { 
        id: 3, 
        name: 'Floral Print Maxi Dress', 
        brand: 'ELEGANCE', 
        price: 3499, 
        discount: 40, 
        image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?q=80&w=600&auto=format&fit=crop', 
        images: [
          'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?q=80&w=600&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=600&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?q=80&w=600&auto=format&fit=crop'
        ],
        category: 'Women', 
        rating: 4.8, 
        stock: 20, 
        description: 'Beautiful floral print maxi dress perfect for summer.' 
      },
      { 
        id: 4, 
        name: 'High-Waist Mom Jeans', 
        brand: 'DENIM CO', 
        price: 1899, 
        discount: 20, 
        image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=600&auto=format&fit=crop', 
        images: [
          'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=600&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1582533081022-de962451f2f8?q=80&w=600&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?q=80&w=600&auto=format&fit=crop'
        ],
        category: 'Women', 
        rating: 4.6, 
        stock: 40, 
        description: 'Vintage style high-waist mom jeans.' 
      },
      { 
        id: 5, 
        name: 'Chunky Sneakers', 
        brand: 'STREETWALK', 
        price: 2999, 
        discount: 10, 
        image: 'https://images.unsplash.com/photo-1552346154-21d32810baa3?q=80&w=600&auto=format&fit=crop', 
        images: [
          'https://images.unsplash.com/photo-1552346154-21d32810baa3?q=80&w=600&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1560769629-975ec94e6a86?q=80&w=600&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1539185441755-76908df3978b?q=80&w=600&auto=format&fit=crop'
        ],
        category: 'Footwear', 
        rating: 4.3, 
        stock: 60, 
        description: 'Trendy chunky sneakers.' 
      },
      { 
        id: 6, 
        name: 'Leather Crossbody Bag', 
        brand: 'LUXE', 
        price: 4599, 
        discount: 5, 
        image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=600&auto=format&fit=crop', 
        images: [
          'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=600&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1594223274512-ad4803739b7c?q=80&w=600&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=600&auto=format&fit=crop'
        ],
        category: 'Accessories', 
        rating: 4.9, 
        stock: 15, 
        description: 'Premium leather crossbody bag.' 
      },
      { 
        id: 7, 
        name: 'Matte Liquid Lipstick', 
        brand: 'GLAMOUR', 
        price: 599, 
        discount: 0, 
        image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?q=80&w=600&auto=format&fit=crop', 
        images: [
          'https://images.unsplash.com/photo-1586495777744-4413f21062fa?q=80&w=600&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1596704017254-9b121068fb31?q=80&w=600&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1625093742435-6fa192349079?q=80&w=600&auto=format&fit=crop'
        ],
        category: 'Beauty', 
        rating: 4.1, 
        stock: 100, 
        description: 'Long-lasting matte liquid lipstick.' 
      },
      { 
        id: 8, 
        name: 'Kids Printed Sweatshirt', 
        brand: 'LITTLE ONES', 
        price: 999, 
        discount: 25, 
        image: 'https://images.unsplash.com/photo-1519238263530-99abad674e40?q=80&w=600&auto=format&fit=crop', 
        images: [
          'https://images.unsplash.com/photo-1519238263530-99abad674e40?q=80&w=600&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1621452773781-0f992fd1f5cb?q=80&w=600&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1617135314032-60293144ef91?q=80&w=600&auto=format&fit=crop'
        ],
        category: 'Kids', 
        rating: 4.7, 
        stock: 45, 
        description: 'Cozy printed sweatshirt for kids.' 
      }
    ];
    await Product.insertMany(seedProducts);
    console.log('Database seeded with products.');
  }
}

// --- Middleware ---
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Access denied' });

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

// --- API Routes ---

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: 'Email already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword });
    await user.save();

    const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// Product Routes
app.get('/api/products', async (req, res) => {
  try {
    const { category, search } = req.query;
    const query: any = {};

    if (category && category !== 'All') {
      query.category = new RegExp(`^${category}$`, 'i');
    }

    if (search) {
      query.$or = [
        { name: new RegExp(search as string, 'i') },
        { brand: new RegExp(search as string, 'i') }
      ];
    }

    const products = await Product.find(query);
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findOne({ id: Number(req.params.id) });
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ error: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// Protected Order Routes
app.post('/api/orders', authenticateToken, async (req: any, res: any) => {
  try {
    const { items, total } = req.body;
    
    // Find mongo ObjectIds for the products
    const productIds = items.map((item: any) => item.id);
    const products = await Product.find({ id: { $in: productIds } });
    
    const orderItems = items.map((item: any) => {
      const product = products.find(p => p.id === item.id);
      return {
        product: product?._id,
        quantity: item.quantity,
        price: item.price
      };
    });

    const order = new Order({
      user: req.user.userId,
      items: orderItems,
      total,
      status: 'Processing'
    });

    await order.save();
    res.json({ success: true, orderId: order._id });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// Vite middleware for development
async function startServer() {
  await connectDB();

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });

  server.on('error', (err: NodeJS.ErrnoException) => {
    if (err.code === 'EADDRINUSE') {
      console.error(
        `\nPort ${PORT} is already in use. Another "npm run start" is still running — stop it with Ctrl+C in that terminal (or kill the process), then try again.\n`
      );
      process.exit(1);
    }
    throw err;
  });
}

startServer();
