// Conventional Commits, avec les scopes de docs/technique/architecture.md (section Conventions).
// Le scope reste facultatif. Le check « Conventions de PR » lit aussi cette liste.
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'scope-enum': [
      2,
      'always',
      ['web', 'mobile', 'engine', 'api', 'db', 'shared', 'data', 'docs', 'ci', 'design', 'generator', 'deps'],
    ],
  },
};
