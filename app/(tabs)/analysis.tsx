import { ScrollView, Text, View, Pressable, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import * as Haptics from "expo-haptics";
import { useEffect, useState } from "react";

interface WeaknessIndicator {
  label: string;
  score: number;
  description: string;
}

export default function AnalysisScreen() {
  const router = useRouter();
  const colors = useColors();
  const params = useLocalSearchParams();
  const [weaknesses, setWeaknesses] = useState<WeaknessIndicator[]>([]);
  const [opportunityScore, setOpportunityScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const companyName = params.companyName as string;
  const country = params.country as string;
  const type = params.type as string;

  // Load analysis from API
  useEffect(() => {
    loadAnalysis();
  }, []);

  const loadAnalysis = async () => {
    try {
      setLoading(true);
      const result = await trpc.company.analyze.useQuery({
        companyName,
        country,
        type,
      }).data;
      if (result) {
        setWeaknesses(
          result.weaknesses.map((w: any) => ({
            label: w.label,
            score: w.score,
            description: w.description,
          }))
        );
        setOpportunityScore(result.opportunityScore);
      }
    } catch (err) {
      console.error("Error analyzing company:", err);
      setError("Error al analizar la empresa. Por favor, intenta de nuevo.");
      // Fallback to mock data
      setWeaknesses([
        {
          label: "Captura de Leads",
          score: 6,
          description: "Formulario básico en web, sin seguimiento automático",
        },
        {
          label: "Sistema de Seguimiento",
          score: 4,
          description: "Sin CRM visible, seguimiento manual por email",
        },
        {
          label: "Velocidad de Respuesta",
          score: 5,
          description: "Respuesta promedio > 24 horas",
        },
        {
          label: "Claridad del Proceso",
          score: 3,
          description: "Flujo de ventas poco claro en web",
        },
        {
          label: "Indicadores de CRM",
          score: 2,
          description: "Sin evidencia de sistema CRM moderno",
        },
      ]);
      setOpportunityScore(7);
    } finally {
      setLoading(false);
    }
  };

  // Mock analysis data (fallback)
  const mockWeaknesses: WeaknessIndicator[] = [
    {
      label: "Captura de Leads",
      score: 6,
      description: "Formulario básico en web, sin seguimiento automático",
    },
    {
      label: "Sistema de Seguimiento",
      score: 4,
      description: "Sin CRM visible, seguimiento manual por email",
    },
    {
      label: "Velocidad de Respuesta",
      score: 5,
      description: "Respuesta promedio > 24 horas",
    },
    {
      label: "Claridad del Proceso",
      score: 3,
      description: "Flujo de ventas poco claro en web",
    },
    {
      label: "Indicadores de CRM",
      score: 2,
      description: "Sin evidencia de sistema CRM moderno",
    },
  ];

  if (loading) {
    return (
      <ScreenContainer className="items-center justify-center">
        <View className="gap-4">
          <ActivityIndicator size="large" color={colors.primary} />
          <Text className="text-center text-muted">Analizando empresa...</Text>
        </View>
      </ScreenContainer>
    );
  }

  const handleGenerateStrategy = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({
      pathname: "/(tabs)/strategy",
      params: {
        companyName,
        country,
        type,
        opportunityScore: opportunityScore.toString(),
        weaknessesJson: JSON.stringify(weaknesses),
      },
    });
  };

  const renderWeaknessBar = (score: number) => {
    const percentage = (score / 10) * 100;
    return (
      <View className="flex-row items-center gap-2">
        <View className="flex-1 h-2 bg-surface rounded-full overflow-hidden">
          <View
            style={{
              width: `${percentage}%`,
              backgroundColor: score > 6 ? colors.primary : score > 3 ? "#F59E0B" : "#EF4444",
            }}
            className="h-full"
          />
        </View>
        <Text className="text-xs font-semibold text-foreground w-6">{score}/10</Text>
      </View>
    );
  };

  return (
    <ScreenContainer className="p-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View className="gap-6">
          {/* Header */}
          <View className="gap-2">
            <Text className="text-2xl font-bold text-foreground">{companyName}</Text>
            <View className="flex-row gap-2">
              <View className="bg-primary/10 px-3 py-1 rounded-full">
                <Text className="text-xs font-medium text-primary">{country}</Text>
              </View>
              <View className="bg-surface border border-border px-3 py-1 rounded-full">
                <Text className="text-xs font-medium text-foreground">{type}</Text>
              </View>
            </View>
          </View>

          {/* Opportunity Score */}
          <View className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl p-6 border border-primary/20">
            <View className="gap-3">
              <Text className="text-sm font-semibold text-muted">Puntuación de Oportunidad</Text>
              <View className="flex-row items-end gap-2">
                <Text className="text-5xl font-bold text-primary">{opportunityScore}</Text>
                <Text className="text-lg text-muted mb-2">/10</Text>
              </View>
              <Text className="text-xs text-muted">
                Alto potencial de mejora en procesos de ventas
              </Text>
            </View>
          </View>

          {/* Weaknesses Analysis */}
          <View className="gap-4">
            <Text className="text-lg font-semibold text-foreground">Análisis de Debilidades</Text>

            {weaknesses.map((weakness, index) => (
              <View key={index} className="bg-surface rounded-xl p-4 border border-border gap-2">
                <View className="flex-row items-start justify-between">
                  <Text className="text-sm font-semibold text-foreground flex-1">
                    {weakness.label}
                  </Text>
                </View>
                {renderWeaknessBar(weakness.score)}
                <Text className="text-xs text-muted mt-2">{weakness.description}</Text>
              </View>
            ))}
          </View>

          {/* Key Insights */}
          <View className="gap-3">
            <Text className="text-lg font-semibold text-foreground">Insights Clave</Text>

            <View className="bg-surface rounded-xl p-4 border border-border gap-2">
              <View className="flex-row gap-2">
                <IconSymbol name="chevron.right" size={16} color={colors.primary} />
                <Text className="text-sm text-foreground flex-1">
                  Sistema de seguimiento manual sin automatización
                </Text>
              </View>
            </View>

            <View className="bg-surface rounded-xl p-4 border border-border gap-2">
              <View className="flex-row gap-2">
                <IconSymbol name="chevron.right" size={16} color={colors.primary} />
                <Text className="text-sm text-foreground flex-1">
                  Oportunidad de mejorar respuesta a leads en menos de 2 horas
                </Text>
              </View>
            </View>

            <View className="bg-surface rounded-xl p-4 border border-border gap-2">
              <View className="flex-row gap-2">
                <IconSymbol name="chevron.right" size={16} color={colors.primary} />
                <Text className="text-sm text-foreground flex-1">
                  Potencial de incremento en test drives del 30-40%
                </Text>
              </View>
            </View>
          </View>

          {/* CTA */}
          <Pressable
            onPress={handleGenerateStrategy}
            style={({ pressed }) => ({
              backgroundColor: colors.primary,
              opacity: pressed ? 0.9 : 1,
              transform: [{ scale: pressed ? 0.97 : 1 }],
            })}
            className="rounded-2xl p-4 mt-4"
          >
            <View className="flex-row items-center justify-center gap-2">
              <IconSymbol name="paperplane.fill" size={20} color="white" />
              <Text className="text-white font-semibold text-base">Generar Estrategia</Text>
            </View>
          </Pressable>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
