module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parser: '@typescript-eslint/parser',
  plugins: ['react-refresh'],
  rules: {
    'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    // 禁止硬编码检测（数组下标/参数默认值属于结构性用法；通用单位换算因子——
    // 百分比、毫秒/秒/分/时、字节进制、base36——自解释且无业务语义，不计入；
    // 业务阈值/时长/比例必须命名）
    'no-magic-numbers': ['error', {
      ignore: [0, 1, -1, 2, 10, 24, 36, 60, 100, 1000, 1024],
      enforceConst: true,
      ignoreArrayIndexes: true,
      ignoreDefaultValues: true,
    }],
    // TypeScript 严格规则
    '@typescript-eslint/no-explicit-any': 'error',
    // 允许解构剔除占位符 `const { [id]: _, ...rest }`
    '@typescript-eslint/no-unused-vars': ['error', { varsIgnorePattern: '^_', argsIgnorePattern: '^_' }],
    '@typescript-eslint/explicit-function-return-type': 'off',
    // React 规则
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    // 导入排序
    'import/order': [
      'error',
      {
        groups: [['builtin', 'external'], 'internal', ['parent', 'sibling', 'index']],
        pathGroups: [
          {
            pattern: 'react',
            group: 'external',
            position: 'before',
          },
          {
            pattern: '@/**',
            group: 'internal',
          },
        ],
        pathGroupsExcludedImportTypes: ['react'],
        'newlines-between': 'always',
        alphabetize: {
          order: 'asc',
          caseInsensitive: true,
        },
      },
    ],
    // 其他
    'no-console': ['warn', { allow: ['error', 'warn'] }],
    'prefer-const': 'error',
    // `x == null` 同时匹配 null/undefined，是项目中的刻意判空写法
    eqeqeq: ['error', 'always', { null: 'ignore' }],
    // React 18 以 CJS 形式发布，import 插件无法识别其默认导出（TS 编译器已保证正确性）
    'import/default': 'off',
  },
  settings: {
    'import/resolver': {
      typescript: {
        project: './tsconfig.json',
      },
    },
  },
  overrides: [
    {
      files: ['**/*.test.ts', '**/*.test.tsx', 'src/test/**/*.ts'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-non-null-assertion': 'off',
        'no-magic-numbers': 'off',
      },
    },
  ],
}
