const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, 'prisma', 'schema.prisma');
let schema = fs.readFileSync(schemaPath, 'utf8');

// 1. Change Provider and URL
schema = schema.replace('provider = "sqlite"', 'provider = "mongodb"');
schema = schema.replace('url      = "file:./dev.db"', 'url      = env("MONGODB_URI")');

// 2. Change all IDs
schema = schema.replace(/id\s+String\s+@id\s+@default\(uuid\(\)\)/g, 'id String @id @default(auto()) @map("_id") @db.ObjectId');

// 3. Find all relation foreign keys and add @db.ObjectId
// Look for @relation(fields: [foreignKeyName], references: [id])
const relationRegex = /@relation\([^)]*fields:\s*\[([^\]]+)\].*?references:\s*\[id\]/g;
const fieldsToUpdate = new Set();
let match;
while ((match = relationRegex.exec(schema)) !== null) {
  match[1].split(',').map(f => f.trim()).forEach(f => fieldsToUpdate.add(f));
}

// Replace each of these fields to add @db.ObjectId
for (const field of fieldsToUpdate) {
  // Matches line starting with whitespace, then field name, then whitespace, then String or String?, then doesn't already have @db.ObjectId
  const fieldRegex = new RegExp(`^(\\s+${field}\\s+String\\??(?!.*@db\\.ObjectId))(.*)$`, 'gm');
  schema = schema.replace(fieldRegex, '$1 @db.ObjectId$2');
}

fs.writeFileSync(schemaPath, schema);
console.log('Schema updated successfully.');
