import { createFileRoute } from '@tanstack/react-router';
import AddGamePage from '../features/auth/pages/AddGamePage';

export const Route = createFileRoute('/_authenticated/games/add-game')({
    component: AddGamePage
});
