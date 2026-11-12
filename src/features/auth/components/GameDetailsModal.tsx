import React from 'react';
import type { BacklogItem } from '../../../types/database.types';
import { useTranslation } from 'react-i18next';
import { platformsData } from '../../../data/platforms';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Star, Edit, Calendar, Gamepad2, Info } from 'lucide-react';

export interface GameDetailsModalProps {
    game: BacklogItem | null;
    open: boolean;
    onClose: () => void;
    onEdit: (gameId: string) => void;
}

/**
 * Game Details Modal / Bottom Sheet.
 * Displays enriched game details and actions with a mobile-first responsive presentation.
 */
const GameDetailsModal: React.FC<GameDetailsModalProps> = ({
    game,
    open,
    onClose,
    onEdit
}) => {
    const { t } = useTranslation();

    if (!game) return null;

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

    const getStatusBadge = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'playing':
                return (
                    <Badge variant="default" className="bg-primary text-primary-foreground">
                        {t('addGame.statusPlaying')}
                    </Badge>
                );
            case 'completed':
                return (
                    <Badge variant="secondary" className="bg-green-500/15 text-green-600 dark:text-green-400 border-green-500/20">
                        {t('addGame.statusCompleted')}
                    </Badge>
                );
            case 'dropped':
                return (
                    <Badge variant="destructive" className="bg-destructive/15 text-destructive border-destructive/20">
                        {t('addGame.statusDropped')}
                    </Badge>
                );
            case 'pending':
            default:
                return (
                    <Badge variant="outline" className="text-muted-foreground">
                        {t('addGame.statusPending')}
                    </Badge>
                );
        }
    };

    return (
        <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto p-5 sm:p-6">
                <DialogHeader className="space-y-1">
                    <DialogTitle className="text-xl font-bold tracking-tight pr-6">
                        {game.game_title}
                    </DialogTitle>
                    <DialogDescription className="flex items-center space-x-2 pt-1">
                        {getStatusBadge(game.status)}
                        {game.platform && (
                            <span className="text-xs text-muted-foreground flex items-center">
                                <Gamepad2 className="w-3.5 h-3.5 mr-1" />
                                {findConsoleById(game.platform)}
                            </span>
                        )}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    {/* Cover + Core metadata */}
                    <div className="flex gap-4 items-start">
                        {game.cover_url && (
                            <img
                                src={game.cover_url}
                                alt={game.game_title}
                                className="w-28 sm:w-32 h-36 sm:h-44 object-cover rounded-lg shadow-sm border border-border shrink-0"
                            />
                        )}

                        <div className="flex-1 space-y-2.5 text-xs sm:text-sm">
                            <div className="flex items-center justify-between py-1 border-b border-border/50">
                                <span className="text-muted-foreground">
                                    {t('addGame.releaseYear')}:
                                </span>
                                <span className="font-medium flex items-center">
                                    <Calendar className="w-3.5 h-3.5 mr-1 text-muted-foreground" />
                                    {game.release_year || 'N/A'}
                                </span>
                            </div>

                            <div className="flex items-center justify-between py-1 border-b border-border/50">
                                <span className="text-muted-foreground">
                                    {t('addGame.gameType')}:
                                </span>
                                <span className="font-medium">
                                    {game.game_type || 'N/A'}
                                </span>
                            </div>

                            <div className="flex items-center justify-between py-1 border-b border-border/50">
                                <span className="text-muted-foreground">
                                    {t('addGame.lengthHours')}:
                                </span>
                                <span className="font-medium flex items-center">
                                    <Clock className="w-3.5 h-3.5 mr-1 text-muted-foreground" />
                                    {game.length_hours ? `${game.length_hours}h` : 'N/A'}
                                </span>
                            </div>

                            <div className="flex items-center justify-between py-1 border-b border-border/50">
                                <span className="text-muted-foreground">
                                    {t('addGame.excitement')}:
                                </span>
                                <span className="font-medium flex items-center text-amber-500">
                                    <Star className="w-3.5 h-3.5 mr-1 fill-amber-500" />
                                    {game.excitement} / 5
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Extra Tag Badges */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                        {game.dropped && (
                            <Badge variant="destructive" className="text-xs">
                                {t('addGame.dropped')}
                            </Badge>
                        )}
                        {game.beaten_before && (
                            <Badge variant="secondary" className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-xs">
                                {t('addGame.beatenBefore')}
                            </Badge>
                        )}
                        {game.recommended && (
                            <Badge variant="secondary" className="bg-blue-500/15 text-blue-600 dark:text-blue-400 text-xs">
                                {t('addGame.recommended')}
                            </Badge>
                        )}
                    </div>

                    {/* Notes Section */}
                    {game.notes && (
                        <div className="rounded-lg bg-muted/40 p-3 space-y-1 text-xs">
                            <div className="flex items-center space-x-1 font-semibold text-muted-foreground">
                                <Info className="w-3.5 h-3.5" />
                                <span>{t('addGame.notes')}</span>
                            </div>
                            <p className="whitespace-pre-wrap text-foreground leading-relaxed">
                                {game.notes}
                            </p>
                        </div>
                    )}
                </div>

                <DialogFooter className="flex-col sm:flex-row gap-2 pt-2 border-t border-border">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        className="w-full sm:w-auto h-11 sm:h-10 min-h-11"
                    >
                        {t('gameDetailsModal.close', 'Cerrar')}
                    </Button>
                    <Button
                        onClick={() => onEdit(game.id)}
                        className="w-full sm:w-auto h-11 sm:h-10 min-h-11 font-semibold"
                    >
                        <Edit className="w-4 h-4 mr-2" />
                        {t('gameDetailsModal.update', 'Editar')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default GameDetailsModal;
