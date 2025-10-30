git checkout main &&
git branch -D gh-pages &&
git branch gh-pages &&
git checkout gh-pages &&
npm install &&
VITE_BASE_URL='/crop-chop/' npm run build &&
git add ./dist &&
git commit -a -m 'release. gh-pages build' &&
git push --force -u origin gh-pages
