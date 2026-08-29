type BackHandler = () => boolean;

const handlers: BackHandler[] = [];

/**
 * 注册返回键处理器（后注册的优先消费）。
 * 处理器返回 true 表示已消费该次返回（如关闭浮层），返回 false 交给下层。
 * @returns 取消注册函数
 */
export function registerBackHandler(handler: BackHandler): () => void {
  handlers.push(handler);
  return () => {
    const index = handlers.indexOf(handler);
    if (index >= 0) handlers.splice(index, 1);
  };
}

/** 从栈顶依次尝试消费返回事件；返回是否已被某个处理器消费 */
export function consumeBackPress(): boolean {
  for (let i = handlers.length - 1; i >= 0; i--) {
    if (handlers[i]()) return true;
  }
  return false;
}
