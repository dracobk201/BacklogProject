import React, { useMemo } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import {
    Gamepad2,
    Trophy,
    Clock,
    Plus,
    Sparkles,
    ArrowRight,
    Play
} from 'lucide-react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    getBacklog,
    getUserScoringWeights
} from '../../../services/backlogService';
import { calculateCustomPriority } from '../../../utils/priorityCalculator';
import type { BacklogItem } from '../../../types/database.types';

export interface DashboardPageProps {
    className?: string;
}

/**
 * Main Dashboard Page.
 * Displays quick backlog statistics, smart recommendations based on the priority algorithm,
 * and quick access to core game management actions.
 */
const DashboardPage: React.FC<DashboardPageProps> = ({ className = '' }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const { data: games = [], isLoading: isLoadingGames } = useQuery({
        queryKey: ['backlog'],
        queryFn: getBacklog
    });

    const { data: weights } = useQuery({
        queryKey: ['user-scoring-weights'],
        queryFn: getUserScoringWeights
    });

    // Compute statistics
    const stats = useMemo(() => {
        const total = games.length;
        const playing = games.filter(
            (g) => g.status?.toLowerCase() === 'playing'
        ).length;
        const completed = games.filter(
            (g) => g.status?.toLowerCase() === 'completed' || g.completion_date
        ).length;
        const pending = games.filter(
            (g) => !g.completion_date && g.status?.toLowerCase() !== 'completed' && g.status?.toLowerCase() !== 'playing'
        ).length;

        return { total, playing, completed, pending };
    }, [games]);

    // Compute recommended next game
    const topRecommendedGame = useMemo<BacklogItem | null>(() => {
        const eligibleGames = games.filter(
            (g) => !g.completion_date && g.status?.toLowerCase() !== 'completed'
        );

        if (eligibleGames.length === 0) return null;

        if (!weights) return eligibleGames[0];

        const sorted = [...eligibleGames].sort((a, b) => {
            const scoreA = calculateCustomPriority(a, weights);
            const scoreB = calculateCustomPriority(b, weights);
            return scoreB - scoreA;
        });

        return sorted[0];
    }, [games, weights]);

    return (
        <div className={`space-y-6 ${className}`}>
            {/* Header Greeting */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                        {t('appLayout.dashboard')}
                    </h1>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        {t('dashboard.subtitle', 'Organiza tu backlog y vence la parálisis por análisis.')}
                    </p>
                </div>

                <Button
                    onClick={() => navigate({ to: '/games/add-game' })}
                    className="w-full sm:w-auto h-11 sm:h-10 min-h-[44px] text-sm font-semibold active:scale-95 transition-transform"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    {t('appLayout.addGame')}
                </Button>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                <Card className="border-border">
                    <CardHeader className="p-4 pb-2">
                        <CardDescription className="text-xs font-medium">
                            {t('dashboard.totalGames', 'Total en Backlog')}
                        </CardDescription>
                        <CardTitle className="text-2xl font-bold">
                            {isLoadingGames ? '-' : stats.total}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                        <div className="flex items-center text-xs text-muted-foreground">
                            <Gamepad2 className="w-3.5 h-3.5 mr-1" />
                            <span>{t('dashboard.registered', 'Títulos')}</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-border">
                    <CardHeader className="p-4 pb-2">
                        <CardDescription className="text-xs font-medium">
                            {t('addGame.statusPlaying', 'Jugando')}
                        </CardDescription>
                        <CardTitle className="text-2xl font-bold text-primary">
                            {isLoadingGames ? '-' : stats.playing}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                        <div className="flex items-center text-xs text-muted-foreground">
                            <Play className="w-3.5 h-3.5 mr-1 text-primary" />
                            <span>{t('dashboard.inProgress', 'En curso')}</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-border">
                    <CardHeader className="p-4 pb-2">
                        <CardDescription className="text-xs font-medium">
                            {t('addGame.statusCompleted', 'Completados')}
                        </CardDescription>
                        <CardTitle className="text-2xl font-bold text-green-500">
                            {isLoadingGames ? '-' : stats.completed}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                        <div className="flex items-center text-xs text-muted-foreground">
                            <Trophy className="w-3.5 h-3.5 mr-1 text-green-500" />
                            <span>{t('dashboard.finished', 'Terminados')}</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-border">
                    <CardHeader className="p-4 pb-2">
                        <CardDescription className="text-xs font-medium">
                            {t('addGame.statusPending', 'Pendientes')}
                        </CardDescription>
                        <CardTitle className="text-2xl font-bold text-amber-500">
                            {isLoadingGames ? '-' : stats.pending}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                        <div className="flex items-center text-xs text-muted-foreground">
                            <Clock className="w-3.5 h-3.5 mr-1 text-amber-500" />
                            <span>{t('dashboard.waiting', 'Por comenzar')}</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Smart Algorithm Top Recommendation */}
            <Card className="border-primary/30 bg-card/60 backdrop-blur shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                    <Sparkles className="w-32 h-32" />
                </div>

                <CardHeader className="p-4 sm:p-6 pb-2">
                    <div className="flex items-center space-x-2">
                        <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 text-xs">
                            <Sparkles className="w-3 h-3 mr-1" />
                            {t('dashboard.smartRecommendation', 'Recomendación Inteligente')}
                        </Badge>
                    </div>
                    <CardTitle className="text-lg sm:text-xl font-bold mt-2">
                        {t('dashboard.whatToPlayNext', '¿A qué jugar a continuación?')}
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm">
                        {t(
                            'dashboard.recommendationExplanation',
                            'Calculado según tu algoritmo de preferencias, entusiasmo y tiempo disponible.'
                        )}
                    </CardDescription>
                </CardHeader>

                <CardContent className="p-4 sm:p-6 pt-2">
                    {topRecommendedGame ? (
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-xl bg-muted/40 border border-border">
                            {topRecommendedGame.cover_url && (
                                <img
                                    src={topRecommendedGame.cover_url}
                                    alt={topRecommendedGame.game_title}
                                    className="w-20 h-28 sm:w-24 sm:h-32 rounded-lg object-cover shadow-sm shrink-0"
                                />
                            )}
                            <div className="flex-1 space-y-1.5 min-w-0">
                                <h3 className="text-base sm:text-lg font-bold truncate">
                                    {topRecommendedGame.game_title}
                                </h3>
                                <div className="flex flex-wrap gap-1.5 text-xs text-muted-foreground">
                                    {topRecommendedGame.platform && (
                                        <Badge variant="outline" className="text-[11px]">
                                            {topRecommendedGame.platform}
                                        </Badge>
                                    )}
                                    {topRecommendedGame.game_type && (
                                        <Badge variant="outline" className="text-[11px]">
                                            {topRecommendedGame.game_type}
                                        </Badge>
                                    )}
                                    {topRecommendedGame.length_hours && (
                                        <span className="flex items-center">
                                            <Clock className="w-3 h-3 mr-1" />
                                            {topRecommendedGame.length_hours}h
                                        </span>
                                    )}
                                </div>
                                {weights && (
                                    <p className="text-xs text-primary font-medium">
                                        {t('dashboard.priorityScore', 'Puntuación de prioridad')}:{' '}
                                        {calculateCustomPriority(topRecommendedGame, weights).toFixed(1)} / 10
                                    </p>
                                )}
                            </div>

                            <div className="w-full sm:w-auto flex sm:flex-col gap-2 shrink-0">
                                <Button
                                    onClick={() => navigate({ to: '/games' })}
                                    className="flex-1 sm:flex-initial h-10 min-h-[44px] text-xs font-semibold"
                                >
                                    {t('dashboard.viewInGames', 'Ver en Catálogo')}
                                    <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-8 text-muted-foreground space-y-3">
                            <p className="text-sm">
                                {t('dashboard.emptyBacklog', 'Aún no tienes juegos pendientes en tu backlog.')}
                            </p>
                            <Button
                                variant="outline"
                                onClick={() => navigate({ to: '/games/add-game' })}
                                className="min-h-[44px]"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                {t('appLayout.addGame')}
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Quick Links Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Card
                    onClick={() => navigate({ to: '/games' })}
                    className="border-border hover:border-primary/50 transition-colors cursor-pointer p-4 flex items-center justify-between touch-manipulation active:scale-[0.99]"
                >
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                            <Gamepad2 className="w-5 h-5" />
                        </div>
                        <div>
                            <h4 className="text-sm font-semibold">{t('appLayout.myGames')}</h4>
                            <p className="text-xs text-muted-foreground">
                                {t('dashboard.browseAll', 'Explora y filtra toda tu colección')}
                            </p>
                        </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                </Card>

                <Card
                    onClick={() => navigate({ to: '/games/rating-config' })}
                    className="border-border hover:border-primary/50 transition-colors cursor-pointer p-4 flex items-center justify-between touch-manipulation active:scale-[0.99]"
                >
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                            <Sparkles className="w-5 h-5" />
                        </div>
                        <div>
                            <h4 className="text-sm font-semibold">{t('appLayout.ratingConfig')}</h4>
                            <p className="text-xs text-muted-foreground">
                                {t('dashboard.adjustWeights', 'Calibra los pesos de tu algoritmo')}
                            </p>
                        </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                </Card>
            </div>
        </div>
    );
};

export default DashboardPage;
