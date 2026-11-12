import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { Sparkles, Save, RotateCcw } from 'lucide-react';
import {
    getUserScoringWeights,
    updateUserScoringWeights
} from '../../../services/backlogService';
import { WeightSlider } from '../components/WeightSlider';
import { PlatformWeightsTree } from '../components/PlatformWeightsTree';
import { GameTypeTriangleSlider } from '../components/GameTypeTriangleSlider';
import type { UserScoringWeights } from '../../../types/database.types';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export interface RatingConfigProps {
    className?: string;
}

const defaultWeights: Partial<UserScoringWeights> = {
    weight_excitement: 50,
    weight_dropped: 50,
    weight_beated_before: 50,
    weight_recommended: 50,
    weight_release_year: 50,
    weight_rating: 50,
    weight_steam_rating: 50,
    weight_length_hours: 50,
    weight_game_type: { AAA: 33, AA: 33, Indie: 33 },
    weight_platform: {}
};

interface RatingConfigFormProps {
    initialWeights: UserScoringWeights | null | undefined;
    className?: string;
}

/**
 * Inner Form Component.
 * Initializes state from initial props without needing an effect.
 */
const RatingConfigForm: React.FC<RatingConfigFormProps> = ({
    initialWeights,
    className = ''
}) => {
    const { t } = useTranslation();
    const queryClient = useQueryClient();

    const [weightsForm, setWeightsForm] = useState<Partial<UserScoringWeights>>(() => ({
        weight_excitement: initialWeights?.weight_excitement ?? defaultWeights.weight_excitement,
        weight_dropped: initialWeights?.weight_dropped ?? defaultWeights.weight_dropped,
        weight_beated_before: initialWeights?.weight_beated_before ?? defaultWeights.weight_beated_before,
        weight_recommended: initialWeights?.weight_recommended ?? defaultWeights.weight_recommended,
        weight_release_year: initialWeights?.weight_release_year ?? defaultWeights.weight_release_year,
        weight_rating: initialWeights?.weight_rating ?? defaultWeights.weight_rating,
        weight_steam_rating: initialWeights?.weight_steam_rating ?? defaultWeights.weight_steam_rating,
        weight_length_hours: initialWeights?.weight_length_hours ?? defaultWeights.weight_length_hours,
        weight_game_type: initialWeights?.weight_game_type ?? defaultWeights.weight_game_type,
        weight_platform: initialWeights?.weight_platform ?? defaultWeights.weight_platform
    }));

    const mutation = useMutation({
        mutationFn: updateUserScoringWeights,
        onSuccess: () => {
            toast.success(
                t('ratingConfig.saveSuccess', 'Configuración guardada exitosamente')
            );
            queryClient.invalidateQueries({
                queryKey: ['user-scoring-weights']
            });
        },
        onError: () => {
            toast.error(
                t('ratingConfig.saveError', 'Error al guardar la configuración')
            );
        }
    });

    const updateField = (field: keyof UserScoringWeights, val: unknown) => {
        setWeightsForm((prev) => ({
            ...prev,
            [field]: val
        }));
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        mutation.mutate(weightsForm);
    };

    const handleReset = () => {
        setWeightsForm(defaultWeights);
    };

    return (
        <form onSubmit={handleSave} className={`space-y-6 max-w-3xl mx-auto py-2 ${className}`}>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                        {t('ratingConfig.title', 'Configuración del Algoritmo')}
                    </h1>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                        {t('ratingConfig.subtitle', 'Ajusta los pesos para priorizar los juegos que más te interesan.')}
                    </p>
                </div>

                <div className="flex items-center space-x-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleReset}
                        className="h-10 min-h-[44px] text-xs font-semibold active:scale-95"
                    >
                        <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                        {t('ratingConfig.reset', 'Restablecer')}
                    </Button>
                    <Button
                        type="submit"
                        disabled={mutation.isPending}
                        className="h-10 min-h-[44px] text-xs font-semibold active:scale-95"
                    >
                        <Save className="w-3.5 h-3.5 mr-1.5" />
                        {t('ratingConfig.submit', 'Guardar')}
                    </Button>
                </div>
            </div>

            <div className="space-y-6">
                {/* General Factor Sliders */}
                <Card className="border-border">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base font-bold flex items-center space-x-2">
                            <Sparkles className="w-4 h-4 text-primary" />
                            <span>{t('ratingConfig.generalFactors', 'Factores de Ponderación')}</span>
                        </CardTitle>
                        <CardDescription className="text-xs">
                            {t('ratingConfig.factorsDescription', 'Puntúa de 1 a 100 la importancia de cada atributo.')}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <WeightSlider
                            label={t('ratingConfig.excitement')}
                            value={weightsForm.weight_excitement ?? 50}
                            onChange={(val) => updateField('weight_excitement', val)}
                        />
                        <WeightSlider
                            label={t('ratingConfig.dropped')}
                            value={weightsForm.weight_dropped ?? 50}
                            onChange={(val) => updateField('weight_dropped', val)}
                        />
                        <WeightSlider
                            label={t('ratingConfig.beatenBefore')}
                            value={weightsForm.weight_beated_before ?? 50}
                            onChange={(val) => updateField('weight_beated_before', val)}
                        />
                        <WeightSlider
                            label={t('ratingConfig.recommended')}
                            value={weightsForm.weight_recommended ?? 50}
                            onChange={(val) => updateField('weight_recommended', val)}
                        />
                        <WeightSlider
                            label={t('ratingConfig.releaseYear')}
                            tooltip={t('ratingConfig.releaseYearInfo')}
                            value={weightsForm.weight_release_year ?? 50}
                            onChange={(val) => updateField('weight_release_year', val)}
                        />
                        <WeightSlider
                            label={t('ratingConfig.ratingOpencritic')}
                            value={weightsForm.weight_rating ?? 50}
                            onChange={(val) => updateField('weight_rating', val)}
                        />
                        <WeightSlider
                            label={t('ratingConfig.steamRating')}
                            value={weightsForm.weight_steam_rating ?? 50}
                            onChange={(val) => updateField('weight_steam_rating', val)}
                        />
                        <WeightSlider
                            label={t('ratingConfig.lengthHours')}
                            tooltip={t('ratingConfig.lengthHoursInfo')}
                            value={weightsForm.weight_length_hours ?? 50}
                            onChange={(val) => updateField('weight_length_hours', val)}
                        />
                    </CardContent>
                </Card>

                {/* Game Type Triangle Slider */}
                <Card className="border-border">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base font-bold">
                            {t('ratingConfig.gameType')}
                        </CardTitle>
                        <CardDescription className="text-xs">
                            {t('ratingConfig.triangleInfo', 'Arrastra el selector dentro del triángulo para balancear la preferencia entre tipos de juegos.')}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-2">
                        <GameTypeTriangleSlider
                            value={weightsForm.weight_game_type}
                            onChange={(val) => updateField('weight_game_type', val)}
                        />
                    </CardContent>
                </Card>

                {/* Platform Weights */}
                <Card className="border-border">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base font-bold">
                            {t('ratingConfig.platform')}
                        </CardTitle>
                        <CardDescription className="text-xs">
                            {t('ratingConfig.platformsInfo', 'Ajusta la prioridad según tu preferencia por cada consola y plataforma.')}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <PlatformWeightsTree
                            value={weightsForm.weight_platform}
                            onChange={(val) => updateField('weight_platform', val)}
                        />
                    </CardContent>
                </Card>

                {/* Save Button for mobile */}
                <div className="pt-2 pb-6">
                    <Button
                        type="submit"
                        disabled={mutation.isPending}
                        className="w-full h-12 min-h-[48px] text-base font-bold active:scale-98 shadow-md"
                    >
                        <Save className="w-4 h-4 mr-2" />
                        {t('ratingConfig.submit', 'Guardar Configuración')}
                    </Button>
                </div>
            </div>
        </form>
    );
};

/**
 * Priority Scoring Weights Configuration Page.
 * Calibrates user preferences for the smart backlog priority algorithm.
 */
const RatingConfig: React.FC<RatingConfigProps> = ({ className = '' }) => {
    const { data: serverWeights, isLoading } = useQuery({
        queryKey: ['user-scoring-weights'],
        queryFn: getUserScoringWeights
    });

    if (isLoading) {
        return (
            <div className="space-y-4 max-w-3xl mx-auto py-4">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="h-16 rounded-xl bg-muted/60 animate-pulse" />
                ))}
            </div>
        );
    }

    return (
        <RatingConfigForm
            key={serverWeights?.user_id || 'initial'}
            initialWeights={serverWeights}
            className={className}
        />
    );
};

export default RatingConfig;
