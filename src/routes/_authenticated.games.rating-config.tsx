import { createFileRoute } from '@tanstack/react-router';
import RatingConfig from '../features/auth/pages/RatingConfig';

export const Route = createFileRoute('/_authenticated/games/rating-config')({
    component: RatingConfig
});
