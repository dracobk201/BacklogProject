import secureLocalStorage from 'react-secure-storage';

/**
 * Sets a local storage item with an expiry time.
 * @param {string} key - Key to store the item.
 * @param {string} value - Value to store.
 * @param {number} expiryInDays - Number of days until the item expires.
 */
export const setLocalItemWithExpiry = (
    key: string,
    value: string,
    expiryInDays: number
) => {
    const now = new Date();
    const expiryTime = now.getTime() + expiryInDays * 24 * 60 * 60 * 1000;

    const item = {
        value: value,
        expiry: expiryTime
    };

    secureLocalStorage.setItem(key, JSON.stringify(item));
};

/**
 * Sets a local storage item with an expiry time.
 * @param {string} key - Key to store the item.
 * @param {string} value - Value to store.
 * @param {number} expiryEpochMs - Exact expiry time in epoch milliseconds.
 */
export const setLocalItemWithExactExpiry = (
    key: string,
    value: string,
    expiryEpochMs: number
) => {
    const item = {
        value: value,
        expiry: expiryEpochMs
    };
    secureLocalStorage.setItem(key, JSON.stringify(item));
};

/**
 * Sets a local storage item with an expiry time.
 * @param {string} key - Key to update the item.
 * @param {string} value - Value to update.
 */
export const updateLocalItemPreserveExpiry = (
    key: string,
    newValue: string
) => {
    const itemStr = secureLocalStorage.getItem(key) as string;
    if (itemStr) {
        try {
            const item = JSON.parse(itemStr);
            if (item && typeof item.expiry === 'number') {
                setLocalItemWithExactExpiry(key, newValue, item.expiry);
                return;
            }
        } catch {
            // fall through to default path
        }
    }
    // Fallback: set with 1 day expiry
    setLocalItemWithExpiry(key, newValue, 1);
};

/**
 * Gets a local storage item.
 * @param {string} key - Key to retrieve the item.
 * @returns {string | null} The stored value or null if not found or expired.
 */
export const getLocalItem = (key: string) => {
    const itemStr = secureLocalStorage.getItem(key) as string;

    if (!itemStr) {
        return null;
    }

    try {
        const item = JSON.parse(itemStr);

        return item.value;
    } catch (error) {
        console.error(`Error getting ${key}:`, error);
        return null;
    }
};

/**
 * Cleans local storage items that have expired.
 */
export const cleanlocalStorageWithExpiry = () => {
    const keys = Object.keys(secureLocalStorage);

    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const itemStr = secureLocalStorage.getItem(key) as string;

        if (itemStr) {
            try {
                const item = JSON.parse(itemStr);

                if (item && item.expiry) {
                    const now = new Date();
                    if (now.getTime() > item.expiry) {
                        secureLocalStorage.removeItem(key);
                    }
                }
            } catch (error) {
                console.error(`Error processing ${key}:`, error);
            }
        }
    }
};

/**
 * Clears all local storage items.
 */
export const cleanlocalStorage = () => {
    secureLocalStorage.clear();
};
