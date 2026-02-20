# Release Process

1. **Verify**: `npm run ci`
2. **Bump Version**: `npm version <patch|minor|major> --no-git-tag-version`
3. **Update Changelog**: `npm run create-changelog`
4. **Commit**: `git add . && git commit -m "chore(release): $(node -p 'require("./package.json").version')"`
5. **Tag & Push**: `git tag v$(node -p 'require("./package.json").version') && git push && git push --tags`
6. **Publish**: `npm publish`
