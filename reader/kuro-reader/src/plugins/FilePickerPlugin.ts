import { registerPlugin } from '@capacitor/core';

export interface FilePickerFile {
  path: string;
  name: string;
  mimeType: string;
  size: number;
}

export interface PickFilesOptions {
  multiple?: boolean;
  mimeTypes?: string[];
}

export interface PickFilesResult {
  files: FilePickerFile[];
}

export interface PickFolderResult {
  path: string;
  name: string;
  files: FilePickerFile[];
}

export interface FilePickerPlugin {
  pickFiles(options: PickFilesOptions): Promise<PickFilesResult>;
  pickFolder(): Promise<PickFolderResult>;
}

export const FilePicker = registerPlugin<FilePickerPlugin>('FilePicker');
