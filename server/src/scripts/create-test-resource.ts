// Script to add a test resource to the database
import { db } from '../db/config.js';
import { resources, sections } from '../db/schema.js';
import { v4 as uuidv4 } from 'uuid';

async function createTestResource() {
  try {
    console.log('🔍 Creating a test resource in the database');

    // Get the user ID
    const user = await db.query.users.findFirst();
    
    if (!user) {
      console.error('❌ No user found in the database');
      return;
    }
    
    console.log(`👤 Using user: ${user.id} (${user.email})`);
    
    // Create resource IDs
    const resourceId = uuidv4();
    const sectionId = uuidv4();
    const now = new Date();
    
    // Insert the resource
    await db.insert(resources).values({
      id: resourceId,
      name: 'Test Resource',
      type: 'book',
      author: 'Test Author',
      sourceUrl: 'https://example.com',
      isPublic: true,
      createdAt: now,
      updatedAt: now,
      userId: user.id,
    });
    
    console.log(`✅ Created resource: ${resourceId}`);
    
    // Insert a section
    await db.insert(sections).values({
      id: sectionId,
      resourceId: resourceId,
      title: 'Chapter 1',
      number: 1,
      createdAt: now,
      updatedAt: now,
    });
    
    console.log(`✅ Created section: ${sectionId}`);
    
    // Verify the resource was created
    const createdResource = await db.query.resources.findFirst({
      where: (resources, { eq }) => eq(resources.id, resourceId),
      with: {
        sections: true
      }
    });
    
    if (createdResource) {
      console.log('📝 Created Resource Details:');
      console.log(`   ID: ${createdResource.id}`);
      console.log(`   Name: ${createdResource.name}`);
      console.log(`   User ID: ${createdResource.userId}`);
      console.log(`   isPublic: ${createdResource.isPublic}`);
      console.log(`   Sections: ${createdResource.sections.length}`);
    } else {
      console.log('⚠️ Resource was not found after creation');
    }
    
  } catch (error) {
    console.error('❌ Error creating test resource:', error);
  } finally {
    process.exit(0);
  }
}

// Run the script
createTestResource(); 