import { registerPlugin } from '@capacitor/core';

export interface TextFocusOptions {
  focused: boolean;
}

export interface TextFocusPlugin {
  setFocused(options: TextFocusOptions): Promise<void>;
}

export const TextFocus = registerPlugin<TextFocusPlugin>('TextFocus');
