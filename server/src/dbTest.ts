import client from './db.js';

async function testDb() {
  try {
    const result = await client.execute("SELECT 1 as result;");
    console.log("DB Test Successful:", result);
  } catch (error) {
    console.error("DB Test failed:", error);
  }
}

testDb();