import { APP_CONFIG } from '@/constants/config';

async function generateSalt(): Promise<string> {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, (b) => b.toString(16).padStart(2, '0')).join('');
}

async function hashGesture(points: number[], salt: string): Promise<string> {
  const data = points.join('-') + ':' + salt;
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

export async function setupGesture(points: number[]): Promise<{ hash: string; salt: string }> {
  if (points.length < APP_CONFIG.auth.minGesturePoints) {
    throw new Error(`至少需要连接 ${APP_CONFIG.auth.minGesturePoints} 个点`);
  }
  const salt = await generateSalt();
  const hash = await hashGesture(points, salt);
  return { hash, salt };
}

export async function verifyGesture(
  points: number[],
  storedHash: string,
  salt: string
): Promise<boolean> {
  const hash = await hashGesture(points, salt);
  return timingSafeEqual(hash, storedHash);
}

export function isLockedUntilExpired(lockUntil: number | undefined): boolean {
  if (!lockUntil) return false;
  return Date.now() < lockUntil;
}

export function calculateLockUntil(failedAttempts: number, maxAttempts: number): number | undefined {
  if (failedAttempts >= maxAttempts) {
    return Date.now() + APP_CONFIG.auth.lockDurationOnMaxFail;
  }
  return undefined;
}

/** 对安全问题答案进行哈希（与手势密码使用相同的算法） */
export async function hashSecurityAnswer(
  answer: string
): Promise<{ answerHash: string; answerSalt: string }> {
  const salt = await generateSalt();
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(answer + ':' + salt);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const answerHash = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  return { answerHash, answerSalt: salt };
}

/** 验证安全问题答案 */
export async function verifySecurityAnswer(
  answer: string,
  storedHash: string,
  salt: string
): Promise<boolean> {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(answer + ':' + salt);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const answerHash = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  return timingSafeEqual(answerHash, storedHash);
}
