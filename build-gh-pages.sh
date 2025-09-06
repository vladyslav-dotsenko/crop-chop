git checkout main &&
git branch -D gh-pages &&
git branch gh-pages &&
git checkout gh-pages &&
npm install &&
npm build &&
rm -rf .vite node_modules public README.md AGENTS.md src package.json package-lock.json index.html eslint.config.js tsconfig.app.json tsconfig.node.json tsconfig.json tsconfig.app.json tsconfig.node.json tsconfig.json vite.config.ts build-gh-pages.sh &&
mv dist/* ./ &&
rm -rf dist &&
git add . &&
git commit -a -m 'release. gh-pages build' &&
git push --force -u origin gh-pages
