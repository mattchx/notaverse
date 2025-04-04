// Script to make all existing resources public
import { db } from '../db/config.js';
import { resources } from '../db/schema.js';
import { eq } from 'drizzle-orm';

async function makeResourcesPublic() {
  try {
    console.log('🔄 Starting migration: Make all resources public');
    
    // Get all resources
    const allResources = await db.query.resources.findMany();
    
    console.log(`📚 Found ${allResources.length} resources to update`);
    
    // Update each resource to be public
    for (const resource of allResources) {
      await db.update(resources)
        .set({ isPublic: true })
        .where(eq(resources.id, resource.id));
      
      console.log(`✅ Updated resource: ${resource.id} - ${resource.name}`);
    }
    
    console.log('✅ Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    process.exit(0);
  }
}

// Run the migration
makeResourcesPublic(); 