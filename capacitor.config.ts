import type { CapacitorConfig } from '@capacitor/cli';
import { KeyboardResize, KeyboardStyle } from '@capacitor/keyboard';

const config: CapacitorConfig = {
    appId: 'com.pakatagames.backlogpriority',
    appName: 'Backlog Priority',
    webDir: 'dist',
    server: {
        androidScheme: 'https'
    },
    backgroundColor: '#09090b',
    plugins: {
        Keyboard: {
            resize: KeyboardResize.Body,
            style: KeyboardStyle.Dark,
            resizeOnFullScreen: true
        }
    }
};

export default config;
