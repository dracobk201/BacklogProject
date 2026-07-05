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

    // 1. Excitement (Scale 1-5, normalize to 0-1)
    // Assuming excitement is 1-5, (excitement - 1) / 4 gives a 0 to 1 scale.
    const excitementNorm = (Math.max(1, Math.min(5, game.excitement)) - 1) / 4;
    rawScore += excitementNorm * prefs.weight_excitement;
    maxPotentialScore += Math.abs(prefs.weight_excitement);

    // 2. Dropped (Penalty or Bonus depending on weight)
    if (game.dropped) {
        rawScore += prefs.weight_dropped;
    }
    maxPotentialScore += Math.abs(prefs.weight_dropped);

    // 3. Game Type (Indie vs AAA)
    if (game.game_type === 'Indie') {
        rawScore += prefs.weight_type_indie;
    } else if (game.game_type === 'AAA') {
        rawScore += prefs.weight_type_aaa;
    }
    // For potential score, we take the maximum possible type weight
    const maxTypeWeight = Math.max(
        Math.abs(prefs.weight_type_indie),
        Math.abs(prefs.weight_type_aaa)
    );
    maxPotentialScore += maxTypeWeight;

    // 4. Release Year (> 5 years old)
    const currentYear = new Date().getFullYear();
    const isOldGame = game.release_year && currentYear - game.release_year > 5;

    if (isOldGame) {
        rawScore += prefs.weight_year_old;
    }
    maxPotentialScore += Math.abs(prefs.weight_year_old);

    // 5. Rating (Assume 0-100 scale, normalize to 0-1)
    const ratingNorm = game.rating
        ? Math.max(0, Math.min(100, game.rating)) / 100
        : 0;
    rawScore += ratingNorm * prefs.weight_rating;
    maxPotentialScore += Math.abs(prefs.weight_rating);

    // Handle case where all weights are 0
    if (maxPotentialScore === 0) {
        return 0;
    }

    // Shift score to be positive if weights are negative, then normalize to 0-10 scale
    // Using a min-max normalization concept. Since rawScore could be negative (if weights are negative),
    // we map [-maxPotentialScore, maxPotentialScore] to [0, 10].

    const normalizedScale =
        (rawScore + maxPotentialScore) / (2 * maxPotentialScore);
    let finalScore = normalizedScale * 10;

    // Strict bounding just in case
    if (finalScore < 0) finalScore = 0;
    if (finalScore > 10) finalScore = 10;

    // Return rounded to 1 decimal place
    return Math.round(finalScore * 10) / 10;
};
