import React, { useState } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import {
    Gamepad2,
    Star,
    Save,
    Trash2,
    ArrowLeft
} from 'lucide-react';
import { platformsData } from '../../../data/platforms';
import {
    getGameById,
    updateGameInfo,
    softDeleteGame
} from '../../../services/backlogService';
import { hapticNotification, hapticSelection } from '../../../utils/haptics';
import { NotificationType } from '@capacitor/haptics';
import type {
    GameStatus,
    GameType
} from '../../../types/addGame.types';
import type { BacklogItem } from '../../../types/database.types';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog';

export interface EditGamePageProps {
    className?: string;
}

interface EditGameFormProps {
    gameId: string;
    game: BacklogItem;
    className?: string;
}

/**
 * Inner Edit Game Form.
 * Initializes state from initial prop without cascading render effects.
 */
const EditGameForm: React.FC<EditGameFormProps> = ({
    gameId,
    game,
    className = ''
}) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [titleInput, setTitleInput] = useState(game.game_title || '');
    const [coverImageUrl, setCoverImageUrl] = useState(game.cover_url || '');
    const [platform, setPlatform] = useState<string>(game.platform || '');
    const [releaseYear, setReleaseYear] = useState<number | ''>(game.release_year ?? '');
    const [rating, setRating] = useState<number | ''>(game.rating ?? '');
    const [steamRating, setSteamRating] = useState<number | ''>(game.steam_rating ?? '');
    const [lengthHours, setLengthHours] = useState<number | ''>(game.length_hours ?? '');
    const [gameType, setGameType] = useState<string>(game.game_type || 'Indie');
    const [status, setStatus] = useState<string>(game.status || 'pending');
    const [startDate, setStartDate] = useState<string>(
        game.start_date ? game.start_date.substring(0, 10) : ''
    );
    const [completionDate, setCompletionDate] = useState<string>(
        game.completion_date ? game.completion_date.substring(0, 10) : ''
    );
    const [excitement, setExcitement] = useState<number>(game.excitement ?? 3);
    const [dropped, setDropped] = useState(!!game.dropped);
    const [beatenBefore, setBeatenBefore] = useState(!!game.beaten_before);
    const [recommended, setRecommended] = useState(!!game.recommended);
    const [notes, setNotes] = useState(game.notes || '');
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    const updateMutation = useMutation({
        mutationFn: (values: Partial<BacklogItem>) => {
            return updateGameInfo(gameId, values);
        },
        onSuccess: () => {
            hapticNotification(NotificationType.Success);
            toast.success(t('games.toast.updateSuccess'));
            queryClient.invalidateQueries({ queryKey: ['backlog'] });
            queryClient.invalidateQueries({ queryKey: ['game', gameId] });
            navigate({ to: '/games' });
        },
        onError: () => {
            toast.error(t('addGame.errorFailed'));
        }
    });

    const deleteMutation = useMutation({
        mutationFn: () => softDeleteGame(gameId),
        onSuccess: () => {
            hapticNotification(NotificationType.Warning);
            toast.success(t('games.toast.deleteSuccess'));
            queryClient.invalidateQueries({ queryKey: ['backlog'] });
            navigate({ to: '/games' });
        },
        onError: () => {
            toast.error(t('games.toast.errorDelete'));
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!titleInput.trim()) {
            toast.error(t('addGame.gameNameRequired'));
            return;
        }

        const payload: Partial<BacklogItem> = {
            game_title: titleInput.trim(),
            cover_url: coverImageUrl || null,
            platform: platform || null,
            release_year: releaseYear !== '' ? (releaseYear as number) : null,
            rating: rating !== '' ? (rating as number) : null,
            steam_rating: steamRating !== '' ? (steamRating as number) : null,
            length_hours: lengthHours !== '' ? (lengthHours as number) : null,
            game_type: (gameType as GameType) || null,
            status: (status as GameStatus) || 'pending',
            start_date: startDate ? new Date(startDate).toISOString() : null,
            completion_date: completionDate ? new Date(completionDate).toISOString() : null,
            excitement,
            dropped,
            beaten_before: beatenBefore,
            recommended,
            notes: notes.trim() || null
        };

        updateMutation.mutate(payload);
    };

    return (
        <form onSubmit={handleSubmit} className={`space-y-6 max-w-2xl mx-auto py-2 pb-12 ${className}`}>
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center space-x-3">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() => navigate({ to: '/games' })}
                        className="h-10 w-10 p-0 rounded-full min-h-11 min-w-11"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                            {titleInput || t('editGame.title')}
                        </h1>
                        <p className="text-xs text-muted-foreground">
                            {t('editGame.subtitle')}
                        </p>
                    </div>
                </div>

                <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDeleteDialogOpen(true)}
                    className="text-destructive hover:bg-destructive/10 border-border h-10 min-h-11"
                >
                    <Trash2 className="w-4 h-4 sm:mr-1.5" />
                    <span className="hidden sm:inline">{t('common.delete')}</span>
                </Button>
            </div>

            <Card className="border-border">
                <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold flex items-center space-x-2">
                        <Gamepad2 className="w-4 h-4 text-primary" />
                        <span>{t('addGame.gameInfo')}</span>
                    </CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">
                    {/* Game Title */}
                    <div className="space-y-1.5">
                        <Label htmlFor="game-name" className="text-xs font-semibold">
                            {t('addGame.gameName')} *
                        </Label>
                        <Input
                            id="game-name"
                            value={titleInput}
                            onChange={(e) => setTitleInput(e.target.value)}
                            className="min-h-11 text-sm"
                        />
                    </div>

                    {/* Cover Preview & URL */}
                    <div className="flex items-center space-x-4 p-3 rounded-xl bg-muted/30 border border-border">
                        {coverImageUrl ? (
                            <img
                                src={coverImageUrl}
                                alt="Cover"
                                className="w-16 h-22 object-cover rounded-lg shadow-xs border border-border shrink-0"
                            />
                        ) : (
                            <div className="w-16 h-22 rounded-lg bg-muted flex items-center justify-center shrink-0">
                                <Gamepad2 className="w-6 h-6 text-muted-foreground" />
                            </div>
                        )}
                        <div className="flex-1 space-y-1.5 min-w-0">
                            <Label htmlFor="cover-url" className="text-xs font-medium">
                                {t('editGame.coverUrl')}
                            </Label>
                            <Input
                                id="cover-url"
                                value={coverImageUrl}
                                onChange={(e) => setCoverImageUrl(e.target.value)}
                                placeholder="https://..."
                                className="min-h-10 text-xs"
                            />
                        </div>
                    </div>

                    {/* Platform Selector */}
                    <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">
                            {t('addGame.platform')} *
                        </Label>
                        <Select
                            value={platform}
                            onValueChange={(val) => {
                                if (val) setPlatform(val);
                            }}
                        >
                            <SelectTrigger className="min-h-11">
                                <SelectValue placeholder={t('addGame.platformRequired')} />
                            </SelectTrigger>
                            <SelectContent className="max-h-72">
                                {platformsData.map((company) => (
                                    <SelectGroup key={company.company}>
                                        <SelectLabel className="font-bold text-primary">
                                            {company.company}
                                        </SelectLabel>
                                        {company.consoles.map((c) => (
                                            <SelectItem key={c.id} value={c.id}>
                                                {c.name}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Numerical Stats Row */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="space-y-1">
                            <Label className="text-xs font-medium">
                                {t('addGame.releaseYear')}
                            </Label>
                            <Input
                                type="number"
                                value={releaseYear}
                                onChange={(e) =>
                                    setReleaseYear(e.target.value ? parseInt(e.target.value, 10) : '')
                                }
                                className="min-h-11"
                            />
                        </div>

                        <div className="space-y-1">
                            <Label className="text-xs font-medium">
                                {t('addGame.lengthHours')}
                            </Label>
                            <Input
                                type="number"
                                value={lengthHours}
                                onChange={(e) =>
                                    setLengthHours(e.target.value ? parseFloat(e.target.value) : '')
                                }
                                className="min-h-11"
                            />
                        </div>

                        <div className="space-y-1">
                            <Label className="text-xs font-medium truncate">
                                {t('addGame.ratingOpencritic')}
                            </Label>
                            <Input
                                type="number"
                                value={rating}
                                onChange={(e) =>
                                    setRating(e.target.value ? parseFloat(e.target.value) : '')
                                }
                                className="min-h-11"
                            />
                        </div>

                        <div className="space-y-1">
                            <Label className="text-xs font-medium">
                                {t('addGame.steamRating')}
                            </Label>
                            <Input
                                type="number"
                                value={steamRating}
                                onChange={(e) =>
                                    setSteamRating(e.target.value ? parseFloat(e.target.value) : '')
                                }
                                className="min-h-11"
                            />
                        </div>
                    </div>

                    {/* Game Type & Status */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold">
                                {t('addGame.gameType')}
                            </Label>
                            <Select
                                value={gameType}
                                onValueChange={(val) => {
                                    if (val) setGameType(val);
                                }}
                            >
                                <SelectTrigger className="min-h-11">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="AAA">AAA</SelectItem>
                                    <SelectItem value="AA">AA</SelectItem>
                                    <SelectItem value="Indie">Indie</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold">
                                {t('addGame.status')}
                            </Label>
                            <Select
                                value={status}
                                onValueChange={(val) => {
                                    if (val) setStatus(val);
                                }}
                            >
                                <SelectTrigger className="min-h-11">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="pending">{t('addGame.statusPending')}</SelectItem>
                                    <SelectItem value="playing">{t('addGame.statusPlaying')}</SelectItem>
                                    <SelectItem value="completed">{t('addGame.statusCompleted')}</SelectItem>
                                    <SelectItem value="dropped">{t('addGame.statusDropped')}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        <div className="space-y-1">
                            <Label className="text-xs font-medium">
                                {t('addGame.startDate')}
                            </Label>
                            <Input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="min-h-11"
                            />
                        </div>

                        <div className="space-y-1">
                            <Label className="text-xs font-medium">
                                {t('addGame.completionDate')}
                            </Label>
                            <Input
                                type="date"
                                value={completionDate}
                                onChange={(e) => setCompletionDate(e.target.value)}
                                className="min-h-11"
                            />
                        </div>
                    </div>

                    {/* Excitement Star Rating */}
                    <div className="space-y-1.5 pt-2">
                        <Label className="text-xs font-semibold">
                            {t('addGame.excitement')} ({excitement} / 5)
                        </Label>
                        <div className="flex items-center space-x-2 py-1">
                            {[1, 2, 3, 4, 5].map((starVal) => (
                                <button
                                    key={starVal}
                                    type="button"
                                    onClick={() => {
                                        hapticSelection();
                                        setExcitement(starVal);
                                    }}
                                    aria-label={`Calificar con ${starVal} estrellas`}
                                    className="p-1.5 rounded-lg hover:bg-muted transition-colors active:scale-95 touch-manipulation min-h-11 min-w-11 flex items-center justify-center"
                                >
                                    <Star
                                        className={`w-7 h-7 transition-colors ${
                                            starVal <= excitement
                                                ? 'fill-amber-400 text-amber-400'
                                                : 'text-muted-foreground/40'
                                        }`}
                                    />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Boolean Flags Switches */}
                    <div className="space-y-3 pt-2 border-t border-border">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="switch-dropped-edit" className="text-xs sm:text-sm font-medium cursor-pointer">
                                {t('addGame.dropped')}
                            </Label>
                            <Switch
                                id="switch-dropped-edit"
                                checked={dropped}
                                onCheckedChange={setDropped}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <Label htmlFor="switch-beaten-edit" className="text-xs sm:text-sm font-medium cursor-pointer">
                                {t('addGame.beatenBefore')}
                            </Label>
                            <Switch
                                id="switch-beaten-edit"
                                checked={beatenBefore}
                                onCheckedChange={setBeatenBefore}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <Label htmlFor="switch-recommended-edit" className="text-xs sm:text-sm font-medium cursor-pointer">
                                {t('addGame.recommended')}
                            </Label>
                            <Switch
                                id="switch-recommended-edit"
                                checked={recommended}
                                onCheckedChange={setRecommended}
                            />
                        </div>
                    </div>

                    {/* Notes Field */}
                    <div className="space-y-1.5 pt-2 border-t border-border">
                        <Label htmlFor="game-notes-edit" className="text-xs font-semibold">
                            {t('addGame.notes')}
                        </Label>
                        <textarea
                            id="game-notes-edit"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={3}
                            placeholder="Notas o impresiones sobre el juego..."
                            className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate({ to: '/games' })}
                    className="w-full sm:w-auto flex-1 h-12 min-h-12 text-sm font-semibold active:scale-95"
                >
                    {t('common.cancel')}
                </Button>
                <Button
                    type="submit"
                    disabled={updateMutation.isPending}
                    className="w-full sm:w-auto flex-1 h-12 min-h-12 text-sm font-bold active:scale-95 shadow-md"
                >
                    <Save className="w-4 h-4 mr-2" />
                    {t('gameDetailsModal.update')}
                </Button>
            </div>

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
            >
                <DialogContent className="max-w-md p-6">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-bold">
                            {t('games.modal.deleteTitle')}
                        </DialogTitle>
                        <DialogDescription className="text-sm pt-2">
                            {t('games.modal.deleteContent')}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="flex-col sm:flex-row gap-2 pt-4">
                        <Button
                            variant="outline"
                            onClick={() => setIsDeleteDialogOpen(false)}
                            className="w-full sm:w-auto h-11 sm:h-10 min-h-11"
                        >
                            {t('games.modal.cancelDelete')}
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => deleteMutation.mutate()}
                            disabled={deleteMutation.isPending}
                            className="w-full sm:w-auto h-11 sm:h-10 min-h-11 font-semibold"
                        >
                            {t('games.modal.confirmDelete')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </form>
    );
};

/**
 * Edit Game Page.
 * Allows viewing and editing all metadata and status for a game in the user's backlog.
 */
const EditGamePage: React.FC<EditGamePageProps> = ({ className = '' }) => {
    const { gameId } = useParams({
        from: '/_authenticated/games/edit-game/$gameId'
    });

    const { data: game, isLoading } = useQuery({
        queryKey: ['game', gameId],
        queryFn: () => getGameById(gameId)
    });

    if (isLoading || !game) {
        return (
            <div className="max-w-2xl mx-auto py-8 space-y-4">
                <div className="h-8 w-48 rounded bg-muted/60 animate-pulse" />
                <div className="h-96 rounded-2xl bg-muted/40 animate-pulse" />
            </div>
        );
    }

    return (
        <EditGameForm
            key={game.id}
            gameId={gameId}
            game={game}
            className={className}
        />
    );
};

export default EditGamePage;
