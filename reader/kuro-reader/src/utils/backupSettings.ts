/**
 * 数据备份的 settings 脱敏：
 * 导出的备份文件可能经网盘/聊天/分享流转，敏感凭据（AI API Key）不得随文件外泄。
 * 恢复端 settings 走 Partial 合并（useAppStore.updateSettings），缺字段即保留本机现值，
 * 因此旧备份（含明文 Key）仍可恢复，新备份不含 Key 也不会清空本机凭据。
 */
export function stripSensitiveSettings<T extends object>(settings: T): Omit<T, 'knowledgeAiKey'> {
  const exportable = { ...settings } as Record<string, unknown>;
  delete exportable.knowledgeAiKey;
  return exportable as Omit<T, 'knowledgeAiKey'>;
}
