import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const i18nDir = path.resolve(process.cwd(), 'src/i18n');
const jsonFiles = fs.readdirSync(i18nDir).filter((file) => file.endsWith('.json')).sort();

describe('i18n JSON validity', () => {
  for (const file of jsonFiles) {
    it(`${file} should be valid JSON`, () => {
      const fullPath = path.join(i18nDir, file);
      const text = fs.readFileSync(fullPath, 'utf8');

      assert.doesNotThrow(() => JSON.parse(text));
    });
  }
});
