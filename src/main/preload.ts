// Disable no-unused-vars, broken for spread args
/* eslint no-unused-vars: off */
import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';

export type Channels = 'ipc-example';

// Define capture source interface for TypeScript
interface CaptureSource {
  id: string;
  name: string;
  thumbnailDataUrl: string;
  display_id?: string;
  appIconDataUrl?: string;
  type: 'screen' | 'window';
}

const electronHandler = {
  ipcRenderer: {
    sendMessage(channel: Channels, ...args: unknown[]) {
      ipcRenderer.send(channel, ...args);
    },
    on(channel: Channels, func: (...args: unknown[]) => void) {
      const subscription = (_event: IpcRendererEvent, ...args: unknown[]) =>
        func(...args);
      ipcRenderer.on(channel, subscription);

      return () => {
        ipcRenderer.removeListener(channel, subscription);
      };
    },
    once(channel: Channels, func: (...args: unknown[]) => void) {
      ipcRenderer.once(channel, (_event, ...args) => func(...args));
    },
  },
  screenCapturer: {
    getSources: (sourceType: 'screen' | 'window' | null = null) =>
      ipcRenderer.invoke('screen-capturer:get-sources', sourceType),
    captureScreenshot: (sourceId: string) =>
      ipcRenderer.invoke('screen-capturer:capture-screenshot', sourceId),
  },
};

contextBridge.exposeInMainWorld('electron', electronHandler);

export type ElectronHandler = typeof electronHandler;
