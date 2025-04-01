import { db, client } from './db/config.js';
import { resources, sections, markers } from './db/schema.js';

async function testTables() {
  console.log('Testing database tables...');
  
  try {
    // Test resources table
    console.log('Testing resources table...');
    const resourcesResult = await client.execute('SELECT name FROM sqlite_master WHERE type="table" AND name="resources"');
    console.log('Resources table check:', resourcesResult.rows);
    
    // Test sections table
    console.log('Testing sections table...');
    const sectionsResult = await client.execute('SELECT name FROM sqlite_master WHERE type="table" AND name="sections"');
    console.log('Sections table check:', sectionsResult.rows);
    
    // Test markers table
    console.log('Testing markers table...');
    const markersResult = await client.execute('SELECT name FROM sqlite_master WHERE type="table" AND name="markers"');
    console.log('Markers table check:', markersResult.rows);
    
    // Test column in sections
    console.log('Testing resource_id column in sections...');
    const columnsResult = await client.execute("PRAGMA table_info('sections')");
    console.log('Sections columns:', columnsResult.rows);
    
    console.log('All tests completed');
  } catch (error) {
    console.error('Error testing tables:', error);
  } finally {
    process.exit(0);
  }
}

testTables(); 