import mongoose from 'mongoose';
import Product from '../models/Product.js';

const ensureProductIndexes = async () => {
  const existingIndexes = await Product.collection.indexes();
  const indexByName = new Map(existingIndexes.map((index) => [index.name, index]));

  const recreateSparseUniqueIndex = async (name, key) => {
    const existingIndex = indexByName.get(name);

    if (existingIndex) {
      const needsRebuild = !existingIndex.unique || !existingIndex.sparse;
      if (needsRebuild) {
        await Product.collection.dropIndex(name);
      } else {
        return;
      }
    }

    await Product.collection.createIndex(key, {
      name,
      unique: true,
      sparse: true,
      background: true,
    });
  };

  await recreateSparseUniqueIndex('sku_1', { sku: 1 });
  await recreateSparseUniqueIndex('variations.sku_1', { 'variations.sku': 1 });
};

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    await ensureProductIndexes();
    console.log('Product indexes verified');
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });

    // Note: Graceful shutdown (SIGINT/SIGTERM) is handled in index.js
    

  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    throw error; // Let server.js handle this
  }
};

export default connectDB;
