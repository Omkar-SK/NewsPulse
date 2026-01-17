const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(async () => {
  console.log('✅ MongoDB Connected\n');
  
  const db = mongoose.connection.db;
  const collection = db.collection('reactions');
  
  console.log('📋 Current indexes:');
  const indexes = await collection.indexes();
  indexes.forEach(index => {
    console.log('  -', index.name, ':', JSON.stringify(index.key));
  });
  
  console.log('\n🗑️  Dropping wrong indexes...');
  
  try {
    // Drop the wrong index
    await collection.dropIndex('articleId_1_userId_1');
    console.log('✅ Dropped articleId_1_userId_1');
  } catch (e) {
    console.log('ℹ️  Index articleId_1_userId_1 not found (OK)');
  }
  
  try {
    // Drop old compound index if exists
    await collection.dropIndex('user_1_articleId_1');
    console.log('✅ Dropped user_1_articleId_1');
  } catch (e) {
    console.log('ℹ️  Index user_1_articleId_1 not found (OK)');
  }
  
  console.log('\n✨ Creating correct index...');
  
  // Create the correct index
  await collection.createIndex(
    { user: 1, articleId: 1 },
    { unique: true, name: 'user_1_articleId_1' }
  );
  
  console.log('✅ Created correct index: user_1_articleId_1');
  
  console.log('\n📋 Updated indexes:');
  const newIndexes = await collection.indexes();
  newIndexes.forEach(index => {
    console.log('  -', index.name, ':', JSON.stringify(index.key));
  });
  
  console.log('\n✅ Index fix complete!');
  process.exit(0);
})
.catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});