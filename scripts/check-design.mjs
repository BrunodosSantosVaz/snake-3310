import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const styles = await readFile(new URL('../src/web/styles.css', import.meta.url), 'utf8');
const tokenProperties = /^(color|background(-color)?|font(-family|-size|-weight)?|line-height|gap|padding(-\w+)?|margin(-\w+)?|border(-\w+)?|outline(-\w+)?|box-shadow)$/;
const literals = /#[\da-f]{3,8}\b|\b(rgb|hsl)a?\(|\b\d+(px|rem|em)\b/i;
for (const [, property, value] of styles.matchAll(/([\w-]+)\s*:\s*([^;{}]+)/g)) {
  if (tokenProperties.test(property)) assert.ok(!literals.test(value), `FE-01: ${property} must use design tokens: ${value}`);
}
console.log('Design: colors, fonts, spacing, borders and shadows use the approved tokens.');
