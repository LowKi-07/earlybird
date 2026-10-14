// Builds a static web version of the app into dist/ with relative asset paths,
// so it can be hosted under any URL (e.g. a claude.ai Artifact) and opened on a phone.
import { execSync } from 'node:child_process';
import { readdirSync, readFileSync, renameSync, writeFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

execSync('npx expo export --platform web --clear', { stdio: 'inherit' });

const rewrite = (file, pairs) => {
  let s = readFileSync(file, 'utf8');
  for (const [from, to] of pairs) s = s.split(from).join(to);
  writeFileSync(file, s);
};

const walk = (dir) =>
  readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });

// Hosts like claude.ai reserve top-level names starting with "_", so move _expo/ to expo/.
renameSync('dist/_expo', 'dist/expo');

rewrite('dist/index.html', [
  ['src="/_expo/', 'src="./expo/'],
  ['href="/favicon.ico"', 'href="./favicon.ico"'],
]);

// Fonts/images are loaded relative to the page, so "./assets/..." resolves next to index.html.
for (const f of walk('dist/expo').filter((p) => p.endsWith('.js'))) {
  rewrite(f, [['"/assets/', '"./assets/']]);
}

const files = walk('dist').filter((p) => p !== 'dist/index.html' && !p.endsWith('metadata.json'));
console.log(`\nPreview built: dist/index.html + ${files.length} files`);
