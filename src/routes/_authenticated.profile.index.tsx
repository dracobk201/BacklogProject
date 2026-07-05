import { createFileRoute } from '@tanstack/react-router';
import ProfilePage from '../features/auth/pages/ProfilePage';

export const Route = createFileRoute('/_authenticated/profile/')({
    component: ProfilePage
});
