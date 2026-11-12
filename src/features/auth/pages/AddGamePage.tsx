import React, { useState, useRef } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import {
    Gamepad2,
    Search,
    Loader2,
    Star,
    Plus,
    X,
    Sparkles
} from 'lucide-react';
import { platformsData } from '../../../data/platforms';
import {
    searchGamesFromIGDB,
    getEnrichedGameData
} from '../../../services/gameApiService';
import { addGameToBacklog } from '../../../services/backlogService';
import { hapticNotification, hapticSelection } from '../../../utils/haptics';
import { NotificationType } from '@capacitor/haptics';
import type {
    GameStatus,
    GameType,
    OpenCriticResults
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

export interface AddGamePageProps {
    className?: string;
}

/**
 * Add Game Page.
 * Allows searching IGDB/OpenCritic, enriching game data, and adding titles to the user's backlog.
 */
const AddGamePage: React.FC<AddGamePageProps> = ({ className = '' }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    // Form state
    const [titleInput, setTitleInput] = useState('');
    const [coverImageUrl, setCoverImageUrl] = useState('');
    const [platform, setPlatform] = useState<string>('');
    const [releaseYear, setReleaseYear] = useState<number | ''>('');
    const [rating, setRating] = useState<number | ''>('');
    const [steamRating, setSteamRating] = useState<number | ''>('');
    const [lengthHours, setLengthHours] = useState<number | ''>('');
    const [gameType, setGameType] = useState<string>('Indie');
    const [status, setStatus] = useState<string>('pending');
    const [startDate, setStartDate] = useState<string>('');
    const [completionDate, setCompletionDate] = useState<string>('');
    const [excitement, setExcitement] = useState<number>(3);
    const [dropped, setDropped] = useState(false);
    const [beatenBefore, setBeatenBefore] = useState(false);
    const [recommended, setRecommended] = useState(false);
    const [notes, setNotes] = useState('');

    const [selectedGameMeta, setSelectedGameMeta] = useState<{
        game_id: string;
        steam_app_id: string | null;
    }>({ game_id: '', steam_app_id: null });

    // Autocomplete & suggestions state
    const [searchResults, setSearchResults] = useState<OpenCriticResults[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    const searchGameMutation = useMutation({
        mutationFn: (value: string) => searchGamesFromIGDB(value),
        onSuccess: (results) => {
            setSearchResults(results);
            setIsSearching(false);
            setShowSuggestions(true);
        },
        onError: () => {
            setIsSearching(false);
        }
    });

    const enrichGameMutation = useMutation({
        mutationFn: ({ gameId, gameTitle }: { gameId: string; gameTitle: string }) =>
            getEnrichedGameData(gameId, gameTitle),
        onSuccess: (enriched, { gameId }) => {
            if (enriched.rating) setRating(enriched.rating);
            if (enriched.steam_rating) setSteamRating(enriched.steam_rating);
            if (enriched.length_hours) setLengthHours(enriched.length_hours);

            setSelectedGameMeta((prev) => ({
                ...prev,
                game_id: enriched.game_id || gameId,
                steam_app_id: enriched.steam_app_id || prev.steam_app_id || null
            }));
        }
    });

    const addGameMutation = useMutation({
        mutationFn: addGameToBacklog,
        onSuccess: () => {
            hapticNotification(NotificationType.Success);
            toast.success(t('addGame.successAdded'));
            queryClient.invalidateQueries({ queryKey: ['backlog'] });
            navigate({ to: '/games' });
        },
        onError: (error) => {
            if (error instanceof Error) {
                toast.error(error.message || t('addGame.errorFailed'));
            } else {
                toast.error(t('addGame.errorFailed'));
            }
        }
    });

    const handleSearchChange = (value: string) => {
        setTitleInput(value);

        if (!value.trim()) {
            setSearchResults([]);
            setShowSuggestions(false);
            return;
        }

        if (searchTimeout.current) clearTimeout(searchTimeout.current);

        setIsSearching(true);
        searchTimeout.current = setTimeout(() => {
            searchGameMutation.mutate(value);
        }, 400);
    };

    const handleSelectSuggestion = (game: OpenCriticResults) => {
        setTitleInput(game.game_title);
        setCoverImageUrl(game.cover_url || '');
        if (game.release_year) setReleaseYear(game.release_year);

        setSelectedGameMeta({
            game_id: game.game_id,
            steam_app_id: game.steam_app_id || null
        });

        setShowSuggestions(false);
        enrichGameMutation.mutate({
            gameId: game.game_id,
            gameTitle: game.game_title
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!titleInput.trim()) {
            toast.error(t('addGame.gameNameRequired'));
            return;
        }

        if (!platform) {
            toast.error(t('addGame.platformRequired'));
            return;
        }

        const generatedGameId =
            selectedGameMeta.game_id ||
            titleInput
                .trim()
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '');

        const payload: Omit<BacklogItem, 'id' | 'user_id'> = {
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
            notes: notes.trim() || null,
            game_id: generatedGameId,
            steam_app_id: selectedGameMeta.steam_app_id || null,
            deleted_at: null
        };

        addGameMutation.mutate(payload);
    };

    return (
        <form onSubmit={handleSubmit} className={`space-y-6 max-w-2xl mx-auto py-2 pb-12 ${className}`}>
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                    {t('addGame.title', 'Añadir a tu Backlog')}
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                    {t('addGame.subtitle', 'Busca o escribe el título del juego para autocompletar su información.')}
                </p>
            </div>

            <Card className="border-border">
                <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold flex items-center space-x-2">
                        <Gamepad2 className="w-4 h-4 text-primary" />
                        <span>{t('addGame.gameInfo', 'Información Principal')}</span>
                    </CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">
                    {/* Game Search / Title Field */}
                    <div className="space-y-1.5 relative">
                        <Label htmlFor="game-name" className="text-xs font-semibold">
                            {t('addGame.gameName')} *
                        </Label>
                        <div className="relative">
                            <Input
                                id="game-name"
                                value={titleInput}
                                onChange={(e) => handleSearchChange(e.target.value)}
                                onFocus={() => searchResults.length > 0 && setShowSuggestions(true)}
                                placeholder={t('addGame.typeGamePlaceholder', 'Escribe el nombre del juego...')}
                                className="min-h-11 pr-10 text-sm"
                                autoComplete="off"
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                {isSearching ? (
                                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                                ) : (
                                    <Search className="w-4 h-4" />
                                )}
                            </div>
                        </div>

                        {/* Floating Suggestions List */}
                        {showSuggestions && searchResults.length > 0 && (
                            <div className="absolute left-0 right-0 top-full mt-1 z-50 bg-popover border border-border rounded-xl shadow-xl max-h-60 overflow-y-auto divide-y divide-border/50">
                                {searchResults.map((result) => (
                                    <div
                                        key={result.game_id}
                                        onClick={() => handleSelectSuggestion(result)}
                                        className="flex items-center space-x-3 p-2.5 hover:bg-muted/50 cursor-pointer transition-colors touch-manipulation"
                                    >
                                        {result.cover_url ? (
                                            <img
                                                src={result.cover_url}
                                                alt=""
                                                className="w-8 h-10 object-cover rounded shrink-0"
                                            />
                                        ) : (
                                            <div className="w-8 h-10 rounded bg-muted flex items-center justify-center shrink-0">
                                                <Gamepad2 className="w-4 h-4 text-muted-foreground" />
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-bold text-foreground truncate">
                                                {result.game_title}
                                            </p>
                                            <p className="text-[11px] text-muted-foreground">
                                                {result.release_year || 'N/A'}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Cover Preview & Enrich Notice */}
                    {coverImageUrl && (
                        <div className="flex items-center space-x-3 p-3 rounded-xl bg-muted/30 border border-border">
                            <img
                                src={coverImageUrl}
                                alt="Cover preview"
                                className="w-14 h-18 object-cover rounded-lg shadow-xs border border-border shrink-0"
                            />
                            <div className="flex-1 text-xs">
                                <p className="font-semibold text-primary flex items-center">
                                    <Sparkles className="w-3.5 h-3.5 mr-1" />
                                    {t('addGame.autoEnriched', 'Datos enriquecidos con OpenCritic')}
                                </p>
                                <p className="text-muted-foreground mt-0.5">
                                    {t('addGame.coverDetected', 'Portada y calificaciones obtenidas con éxito.')}
                                </p>
                            </div>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => setCoverImageUrl('')}
                                className="h-8 w-8 p-0"
                            >
                                <X className="w-4 h-4 text-muted-foreground" />
                            </Button>
                        </div>
                    )}

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
                                placeholder="2024"
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
                                placeholder="15"
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
                                placeholder="85"
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
                                placeholder="90"
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
                            <Label htmlFor="switch-dropped" className="text-xs sm:text-sm font-medium cursor-pointer">
                                {t('addGame.dropped')}
                            </Label>
                            <Switch
                                id="switch-dropped"
                                checked={dropped}
                                onCheckedChange={setDropped}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <Label htmlFor="switch-beaten" className="text-xs sm:text-sm font-medium cursor-pointer">
                                {t('addGame.beatenBefore')}
                            </Label>
                            <Switch
                                id="switch-beaten"
                                checked={beatenBefore}
                                onCheckedChange={setBeatenBefore}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <Label htmlFor="switch-recommended" className="text-xs sm:text-sm font-medium cursor-pointer">
                                {t('addGame.recommended')}
                            </Label>
                            <Switch
                                id="switch-recommended"
                                checked={recommended}
                                onCheckedChange={setRecommended}
                            />
                        </div>
                    </div>

                    {/* Notes Field */}
                    <div className="space-y-1.5 pt-2 border-t border-border">
                        <Label htmlFor="game-notes" className="text-xs font-semibold">
                            {t('addGame.notes')}
                        </Label>
                        <textarea
                            id="game-notes"
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
                    {t('common.cancel', 'Cancelar')}
                </Button>
                <Button
                    type="submit"
                    disabled={addGameMutation.isPending}
                    className="w-full sm:w-auto flex-1 h-12 min-h-12 text-sm font-bold active:scale-95 shadow-md"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    {t('addGame.submit')}
                </Button>
            </div>
        </form>
    );
};

export default AddGamePage;
