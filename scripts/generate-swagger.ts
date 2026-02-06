import { writeFileSync } from 'fs';
import { join } from 'path';
import { getSwaggerSpec } from '../src/core/config/swagger';

const outputPath = join(__dirname, '../docs/openapi.json');

writeFileSync(outputPath, JSON.stringify(getSwaggerSpec(), null, 2));

console.log(`✅ OpenAPI specification generated at: ${outputPath}`);
console.log(`📄 You can view it at: https://editor.swagger.io/`);
