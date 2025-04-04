// Script to check what resources exist in the database
import { db } from '../db/config.js';
import { resources } from '../db/schema.js';

async function checkResources() {
  try {
    console.log('🔍 Checking all resources in the database');
    
    // Get all resources without any filtering
    const allResources = await db.query.resources.findMany();
    
    console.log(`📊 Found ${allResources.length} total resources`);
    
    if (allResources.length > 0) {
      console.log('📝 Resources:');
      allResources.forEach((resource, index) => {
        console.log(`${index + 1}. ID: ${resource.id}`);
        console.log(`   Name: ${resource.name}`);
        console.log(`   User ID: ${resource.userId}`);
        console.log(`   isPublic: ${resource.isPublic}`);
        console.log(`   Created: ${resource.createdAt}`);
      });
    } else {
      console.log('⚠️ No resources found in the database');
    }
    
    // Check users
    console.log('\n👥 Checking all users');
    const allUsers = await db.query.users.findMany();
    console.log(`👤 Found ${allUsers.length} users`);
    
    if (allUsers.length > 0) {
      console.log('📝 Users:');
      allUsers.forEach((user, index) => {
        console.log(`${index + 1}. ID: ${user.id}`);
        console.log(`   Email: ${user.email}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error checking resources:', error);
  } finally {
    process.exit(0);
  }
}

// Run the script
checkResources(); 