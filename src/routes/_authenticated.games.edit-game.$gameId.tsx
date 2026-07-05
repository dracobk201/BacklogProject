import { createFileRoute } from '@tanstack/react-router';
import EditGamePage from '../features/auth/pages/EditGamePage';

export const Route = createFileRoute('/_authenticated/games/edit-game/$gameId')(
    {
        component: EditGamePage
    }
);
