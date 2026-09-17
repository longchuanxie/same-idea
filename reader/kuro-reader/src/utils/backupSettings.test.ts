import { describe, expect, it } from 'vitest';

import { stripSensitiveSettings } from './backupSettings';

describe('stripSensitiveSettings', () => {
  it('剔除 knowledgeAiKey，其余字段原样保留', () => {
    const sanitized = stripSensitiveSettings({
      knowledgeAiUrl: 'https://api.example.com',
      knowledgeAiKey: 'sk-secret',
      knowledgeAiModel: 'glm-4',
      fontSize: 18,
      theme: 'dark',
    });

    expect('knowledgeAiKey' in sanitized).toBe(false);
    expect(sanitized.knowledgeAiUrl).toBe('https://api.example.com');
    expect(sanitized.knowledgeAiModel).toBe('glm-4');
    expect(sanitized.fontSize).toBe(18);
    expect(sanitized.theme).toBe('dark');
  });

  it('无 Key 字段时原样返回等价内容', () => {
    const settings = { fontSize: 16, hideStatusBar: true };
    expect(stripSensitiveSettings(settings)).toEqual(settings);
  });
});
