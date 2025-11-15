export const ButtonType = {
    Submit: 'submit',
    Cancel: 'cancel',
    Default: 'default'
} as const;

export type ButtonType = (typeof ButtonType)[keyof typeof ButtonType];

export const ButtonWidth = {
    Long: 'long',
    Short: 'short',
    Full: 'full',
    Default: 'default'
} as const;

export type ButtonWidth = (typeof ButtonWidth)[keyof typeof ButtonWidth];
