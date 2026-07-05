import { createFileRoute } from '@tanstack/react-router';
import GamesPage from '../features/auth/pages/GamesPage';

export const Route = createFileRoute('/_authenticated/games/')({
    component: GamesPage
});
