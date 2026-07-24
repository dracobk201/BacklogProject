import type { BacklogItem, UserScoringWeights } from '../types/database.types';

/**
 * Calculates a custom priority score from 0 to 10 for a given backlog item
 * based on user preferences.
 *
 * @param game - The backlog item to evaluate
 * @param prefs - The user's weighting preferences
 * @returns A normalized score strictly between 0 and 10
 */
export const calculateCustomPriority = (
    game: BacklogItem,
    prefs: UserScoringWeights
): number => {
    let rawScore = 0;
    let maxPotentialScore = 0;

    // Helper to safely add weight
    const addWeight = (valueNorm: number, weight: number | undefined) => {
        const w = weight ?? 0;
        rawScore += valueNorm * w;
        maxPotentialScore += w;
    };

    // 1. Excitement (Scale 1-5, normalize to 0-1)
    const excitementNorm =
        (Math.max(1, Math.min(5, game.excitement || 1)) - 1) / 4;
    addWeight(excitementNorm, prefs.weight_excitement);

    // 2. Dropped
    addWeight(game.dropped ? 1 : 0, prefs.weight_dropped);

    // 3. Beaten Before
    addWeight(game.beaten_before ? 1 : 0, prefs.weight_beated_before);

    // 4. Recommended
    addWeight(game.recommended ? 1 : 0, prefs.weight_recommended);

    // 5. Release Year
    // 50 = neutral. < 50 = older games better. > 50 = newer games better.
    const currentYear = new Date().getFullYear();
    const age = game.release_year
        ? Math.max(0, currentYear - game.release_year)
        : 0;
    const ageNorm = Math.min(20, age) / 20; // 0 = new, 1 = 20+ years old
    const recentness = 1 - ageNorm; // 1 = new, 0 = 20+ years old

    const releaseWeight = prefs.weight_release_year ?? 50;
    const wRelease = releaseWeight / 100;
    // Smooth gradient: 100 -> prefers new, 0 -> prefers old, 50 -> neutral 0.5
    const releaseValueNorm =
        recentness * wRelease + (1 - recentness) * (1 - wRelease);
    const effectiveReleaseWeight = Math.abs(releaseWeight - 50) * 2;
    addWeight(releaseValueNorm, effectiveReleaseWeight);

    // Helper to check if a rating value is valid (ignores null, undefined, '', and -1)
    const isValidRating = (val: number | null | undefined): val is number => {
        if (val === null || val === undefined || (val as unknown) === '')
            return false;
        const num = Number(val);
        return !isNaN(num) && num >= 0 && num !== -1;
    };

    // 6. Opencritic Rating (0-100)
    if (isValidRating(game.rating)) {
        const ratingNorm = Math.max(0, Math.min(100, game.rating)) / 100;
        addWeight(ratingNorm, prefs.weight_rating);
    }

    // 7. Steam Rating (0-100)
    if (isValidRating(game.steam_rating)) {
        const steamRatingNorm =
            Math.max(0, Math.min(100, game.steam_rating)) / 100;
        addWeight(steamRatingNorm, prefs.weight_steam_rating);
    }

    // 8. Length Hours
    // 50 = neutral. < 50 = shorter games better. > 50 = longer games better.
    const lengthNormRaw = game.length_hours
        ? Math.min(1, Math.max(0, game.length_hours / 100))
        : 0; // 0 = 0h, 1 = 100h+
    const lengthWeight = prefs.weight_length_hours ?? 50;
    const wLength = lengthWeight / 100;
    // Smooth gradient: 100 -> prefers long, 0 -> prefers short, 50 -> neutral 0.5
    const lengthValueNorm =
        lengthNormRaw * wLength + (1 - lengthNormRaw) * (1 - wLength);
    const effectiveLengthWeight = Math.abs(lengthWeight - 50) * 2;
    addWeight(lengthValueNorm, effectiveLengthWeight);

    // 9. Game Type
    if (game.game_type && prefs.weight_game_type) {
        const gtWeight = prefs.weight_game_type[game.game_type] ?? 33.3; // Fallback al centro del triángulo
        rawScore += gtWeight;
        maxPotentialScore += 100;
    } else {
        // Default to center of triangle (33.3/100) if not specified
        rawScore += 33.3;
        maxPotentialScore += 100;
    }

    // 10. Platform
    if (game.platform && prefs.weight_platform) {
        // Platform keys are lowercase in the UI Tree
        const platformKey = game.platform.toLowerCase();
        // Fallback to 50 (neutral) if not in predefined list or no weight set
        const platWeight = prefs.weight_platform[platformKey] ?? 50;
        rawScore += platWeight;
        maxPotentialScore += 100;
    } else {
        // Default to neutral (50/100) if not specified
        rawScore += 50;
        maxPotentialScore += 100;
    }

    if (maxPotentialScore === 0) {
        return 0;
    }

    // Normalize rawScore (which could theoretically be up to maxPotentialScore) to 0-10 scale
    let finalScore = (rawScore / maxPotentialScore) * 10;

    if (finalScore < 0) finalScore = 0;
    if (finalScore > 10) finalScore = 10;

    return Math.round(finalScore * 10) / 10;
};
