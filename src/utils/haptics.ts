import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

/**
 * Triggers a light, medium, or heavy physical impact vibration.
 *
 * @param style - The impact style (Light, Medium, Heavy)
 */
export const hapticImpact = async (style: ImpactStyle = ImpactStyle.Light): Promise<void> => {
    if (Capacitor.isNativePlatform()) {
        try {
            await Haptics.impact({ style });
        } catch {
            // Silently ignore in unsupported web environments
        }
    }
};

/**
 * Triggers a notification haptic feedback pattern (Success, Warning, Error).
 *
 * @param type - The notification type
 */
export const hapticNotification = async (
    type: NotificationType = NotificationType.Success
): Promise<void> => {
    if (Capacitor.isNativePlatform()) {
        try {
            await Haptics.notification({ type });
        } catch {
            // Silently ignore
        }
    }
};

/**
 * Triggers a subtle tactile feedback when user changes a selection or taps a tab.
 */
export const hapticSelection = async (): Promise<void> => {
    if (Capacitor.isNativePlatform()) {
        try {
            await Haptics.selectionChanged();
        } catch {
            // Silently ignore
        }
    }
};

