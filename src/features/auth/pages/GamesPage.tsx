import React, { useState, useMemo } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { Plus, Edit, Trash2, Gamepad2 } from 'lucide-react';
import {
    getBacklog,
    getUserScoringWeights,
    softDeleteGame
} from '../../../services/backlogService';
import type { BacklogItem } from '../../../types/database.types';
import { platformsData } from '../../../data/platforms';
import { calculateCustomPriority } from '../../../utils/priorityCalculator';
import GameDetailsModal from '../components/GameDetailsModal';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog';

export interface GamesPageProps {
    className?: string;
}

/**
 * All Games Page.
 * Displays user's backlog collection in a mobile-optimized responsive card grid
 * sorted by custom priority algorithm.
 */
const GamesPage: React.FC<GamesPageProps> = ({ className = '' }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [selectedGame, setSelectedGame] = useState<BacklogItem | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [gameToDelete, setGameToDelete] = useState<BacklogItem | null>(null);
    const [showCompleted, setShowCompleted] = useState(false);

    const { data: gamesFromBacklog = [], isLoading: loading } = useQuery({
        queryKey: ['backlog'],
        queryFn: getBacklog
    });

    const { data: weights, isLoading: isLoadingWeights } = useQuery({
        queryKey: ['user-scoring-weights'],
        queryFn: getUserScoringWeights
    });

    const processedGames = useMemo(() => {
        let result = [...gamesFromBacklog];

        if (!showCompleted) {
            result = result.filter((game) => !game.completion_date);
        }

        // Sort by priority (highest to lowest)
        if (weights) {
            result.sort((a, b) => {
                const priorityA = calculateCustomPriority(a, weights);
                const priorityB = calculateCustomPriority(b, weights);
                return priorityB - priorityA;
            });
        }

        return result;
    }, [gamesFromBacklog, weights, showCompleted]);

    const unknownGameURL =
        'https://www.igdb.com/assets/no_cover_show-ef1e36c00e101c2fb23d15bb80edd9667bbf604a12fc0267a66033afea320c65.png';

    const findConsoleById = (id: string | null) => {
        if (id == null) return t('games.unknownPlatform');
        for (const company of platformsData) {
            const consoleItem = company.consoles.find((c) => c.id === id);
            if (consoleItem) {
                return consoleItem.name;
            }
        }
        return t('games.unknownPlatform');
    };

    const handleEditGame = (gameId: string) => {
        setIsDetailsOpen(false);
        navigate({ to: `/games/edit-game/${gameId}` });
    };

    const deleteGameMutation = useMutation({
        mutationFn: softDeleteGame,
        onSuccess: () => {
            toast.success(t('games.toast.deleteSuccess'));
            queryClient.invalidateQueries({ queryKey: ['backlog'] });
            setGameToDelete(null);
        },
        onError: () => {
            toast.error(t('games.toast.errorDelete'));
            setGameToDelete(null);
        }
    });

    const confirmDelete = () => {
        if (gameToDelete) {
            deleteGameMutation.mutate(gameToDelete.id);
        }
    };

    return (
        <div className={`space-y-6 ${className}`}>
            {/* Header with Title and Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                        {t('appLayout.allMyGames')}
                    </h1>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                        {t('games.subtitle', 'Catálogo completo ordenado por prioridad.')}
                    </p>
                </div>

                <div className="flex items-center space-x-4 self-end sm:self-auto">
                    <div className="flex items-center space-x-2">
                        <Switch
                            id="show-completed"
                            checked={showCompleted}
                            onCheckedChange={setShowCompleted}
                        />
                        <Label
                            htmlFor="show-completed"
                            className="text-xs sm:text-sm cursor-pointer"
                        >
                            {t('games.showCompleted')}
                        </Label>
                    </div>

                    <Button
                        onClick={() => navigate({ to: '/games/add-game' })}
                        className="h-10 min-h-[44px] text-xs sm:text-sm font-semibold active:scale-95 transition-transform"
                    >
                        <Plus className="w-4 h-4 mr-1.5" />
                        {t('games.addGame')}
                    </Button>
                </div>
            </div>

            {/* Loading Skeleton */}
            {loading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
                    {Array.from({ length: 10 }).map((_, index) => (
                        <div
                            key={index}
                            className="animate-pulse rounded-xl bg-muted/60 aspect-[2/3] border border-border"
                        />
                    ))}
                </div>
            ) : processedGames.length === 0 ? (
                <div className="text-center py-16 space-y-3 bg-muted/20 rounded-2xl border border-dashed border-border p-6">
                    <Gamepad2 className="w-12 h-12 mx-auto text-muted-foreground/50" />
                    <p className="text-sm text-muted-foreground">
                        {t('games.noGames', 'No hay videojuegos para mostrar con los filtros actuales.')}
                    </p>
                    <Button
                        variant="outline"
                        onClick={() => navigate({ to: '/games/add-game' })}
                        className="min-h-[44px]"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        {t('games.addGame')}
                    </Button>
                </div>
            ) : (
                /* Poster Cards Grid */
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
                    {processedGames.map((game: BacklogItem) => {
                        const priorityScore =
                            !isLoadingWeights && weights
                                ? calculateCustomPriority(game, weights).toFixed(1)
                                : null;

                        return (
                            <Card
                                key={game.id}
                                onClick={() => {
                                    setSelectedGame(game);
                                    setIsDetailsOpen(true);
                                }}
                                className="group relative overflow-hidden border-border bg-card hover:border-primary/50 transition-all duration-200 cursor-pointer flex flex-col active:scale-[0.98] touch-manipulation shadow-sm"
                            >
                                {/* Cover Image with Priority Badge Overlay */}
                                <div className="relative aspect-[3/4] w-full overflow-hidden bg-muted">
                                    <img
                                        src={game.cover_url || unknownGameURL}
                                        alt={game.game_title}
                                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                        loading="lazy"
                                        draggable={false}
                                    />

                                    {/* Priority Badge */}
                                    {priorityScore && (
                                        <div className="absolute top-2 left-2">
                                            <Badge
                                                variant="secondary"
                                                className="bg-background/90 backdrop-blur text-foreground font-bold text-[11px] shadow-sm px-1.5 py-0.5 border-border"
                                            >
                                                ⭐ {priorityScore}
                                            </Badge>
                                        </div>
                                    )}

                                    {/* Quick Actions (Floating on hover or mobile friendly) */}
                                    <div className="absolute top-2 right-2 flex space-x-1">
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleEditGame(game.id);
                                            }}
                                            aria-label="Edit Game"
                                            className="w-8 h-8 rounded-full bg-background/80 backdrop-blur hover:bg-background text-foreground flex items-center justify-center transition-all active:scale-95 shadow-sm"
                                        >
                                            <Edit className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setGameToDelete(game);
                                            }}
                                            aria-label="Delete Game"
                                            className="w-8 h-8 rounded-full bg-background/80 backdrop-blur hover:bg-destructive hover:text-destructive-foreground text-destructive flex items-center justify-center transition-all active:scale-95 shadow-sm"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>

                                {/* Content / Title & Platform */}
                                <CardContent className="p-3 flex-1 flex flex-col justify-between">
                                    <div>
                                        <h3
                                            className="font-bold text-xs sm:text-sm line-clamp-1 text-foreground"
                                            title={game.game_title}
                                        >
                                            {game.game_title}
                                        </h3>
                                        <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                                            {findConsoleById(game.platform)}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}

            {/* Game Details Modal / Bottom Sheet */}
            <GameDetailsModal
                game={selectedGame}
                open={isDetailsOpen}
                onClose={() => setIsDetailsOpen(false)}
                onEdit={handleEditGame}
            />

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={!!gameToDelete}
                onOpenChange={(isOpen) => !isOpen && setGameToDelete(null)}
            >
                <DialogContent className="max-w-md p-6">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-bold">
                            {t('games.modal.deleteTitle', '¿Eliminar juego?')}
                        </DialogTitle>
                        <DialogDescription className="text-sm pt-2">
                            {t(
                                'games.modal.deleteContent',
                                '¿Estás seguro de que deseas eliminar este juego de tu backlog? Esta acción se puede revertir luego.'
                            )}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="flex-col sm:flex-row gap-2 pt-4">
                        <Button
                            variant="outline"
                            onClick={() => setGameToDelete(null)}
                            className="w-full sm:w-auto h-11 sm:h-10 min-h-[44px]"
                        >
                            {t('games.modal.cancelDelete', 'Cancelar')}
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={confirmDelete}
                            disabled={deleteGameMutation.isPending}
                            className="w-full sm:w-auto h-11 sm:h-10 min-h-[44px] font-semibold"
                        >
                            {t('games.modal.confirmDelete', 'Eliminar')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default GamesPage;
