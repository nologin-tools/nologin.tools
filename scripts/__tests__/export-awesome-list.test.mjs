import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { generateAwesomeReadme } from '../export-awesome-list.mjs';

describe('export-awesome-list', () => {
  const sampleTools = [
    {
      name: 'Excalidraw',
      url: 'https://excalidraw.com',
      description: 'Virtual collaborative whiteboard',
      coreTask: 'Draw diagrams on a canvas',
      category: 'Design',
      featured: true,
      badge: 'explicit',
      repoUrl: 'https://github.com/excalidraw/excalidraw',
      githubStars: 85000,
    },
    {
      name: 'Squoosh',
      url: 'https://squoosh.app',
      description: 'Image compression in browser',
      coreTask: 'Compress images in browser',
      category: 'Media',
      featured: false,
      badge: 'none',
      repoUrl: null,
      githubStars: null,
    },
  ];

  it('generates valid markdown structure with badge links', () => {
    const md = generateAwesomeReadme(sampleTools);
    assert.ok(md.includes('# Awesome NoLogin Tools'));
    assert.ok(md.includes('badge/Tools-2-4c1'));
    assert.ok(md.includes('## Design'));
    assert.ok(md.includes('## Media'));
    assert.ok(md.includes('Excalidraw ★ 🛡️'));
    assert.ok(md.includes('([Source](https://github.com/excalidraw/excalidraw) ⭐85000)'));
    assert.ok(md.includes('Squoosh'));
    assert.ok(md.includes('## License'));
  });
});
