import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'fs';
import { join } from 'path';
import { palette, TOKEN_NAMES, toRgbChannels, mixHex, stageTintColor } from './palette';

const css = readFileSync(join(import.meta.dir, '../../global.css'), 'utf8');
const kebab = (name: string) => name.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase());

function cssBlock(selector: string): Record<string, string> {
  const start = css.indexOf(`${selector} {`);
  expect(start).toBeGreaterThanOrEqual(0);
  const body = css.slice(start, css.indexOf('}', start));
  return Object.fromEntries(
    [...body.matchAll(/--([\w-]+):\s*([^;]+);/g)].map(([, name, value]) => [name, value.trim()])
  );
}

describe('palette', () => {
  test.each([
    ['light', ':root'],
    ['dark', '.dark:root'],
  ] as const)('global.css %s values match palette.ts', (mode, selector) => {
    const vars = cssBlock(selector);
    for (const name of TOKEN_NAMES) {
      expect({ name, value: vars[kebab(name)] }).toEqual({ name, value: toRgbChannels(palette[mode][name]) });
    }
    expect(Object.keys(vars).length).toBe(TOKEN_NAMES.length);
  });

  test('mixHex blends like color-mix', () => {
    expect(mixHex('#000000', 50, '#FFFFFF')).toBe('#808080');
    expect(mixHex('#3A7D4C', 100, '#FFFFFF')).toBe('#3A7D4C');
    expect(mixHex('#3A7D4C', 0, '#FFFFFF')).toBe('#FFFFFF');
  });

  test('stage tint families cover all 14 stages', () => {
    expect(stageTintColor(0)).toBe('#A47148');
    expect(stageTintColor(1)).toBe('#A47148');
    expect(stageTintColor(2)).toBe('#4C9A5A');
    expect(stageTintColor(7)).toBe('#4C9A5A');
    expect(stageTintColor(8)).toBe('#D9668A');
    expect(stageTintColor(10)).toBe('#D9668A');
    expect(stageTintColor(11)).toBe('#2F6B4A');
    expect(stageTintColor(13)).toBe('#2F6B4A');
  });
});
