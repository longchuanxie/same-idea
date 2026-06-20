/**
 * 获取浏览器存储使用情况
 */
export async function getStorageUsage(): Promise<{ used: number; quota: number }> {
  if (navigator.storage && navigator.storage.estimate) {
    const est = await navigator.storage.estimate();
    return {
      used: est.usage ?? 0,
      quota: est.quota ?? 0,
    };
  }
  return { used: 0, quota: 0 };
}
