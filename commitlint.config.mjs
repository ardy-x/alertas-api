export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [2, 'always', ['feat', 'fix', 'docs', 'style', 'refactor', 'test', 'chore', 'perf', 'ci', 'build', 'revert']],
    'scope-empty': [2, 'never'], // Scope obligatorio
    'scope-case': [2, 'always', 'lower-case'], // Scope en minúsculas
    'subject-case': [2, 'never', ['upper-case']],
    'header-max-length': [2, 'always', 120],
  },
};
