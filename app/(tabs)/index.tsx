import { ScrollView, Text, View, Pressable, FlatList } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useThemeContext } from "@/lib/theme-provider";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";

interface RecentInvestigation {
  id: string;
  companyName: string;
  country: string;
  date: string;
}

export default function HomeScreen() {
  const router = useRouter();
  const colors = useColors();
  const { colorScheme, setColorScheme } = useThemeContext();
  const [recentInvestigations, setRecentInvestigations] = useState<RecentInvestigation[]>([]);
  const [totalStrategies, setTotalStrategies] = useState(0);

  useEffect(() => {
    loadRecentData();
  }, []);

  const loadRecentData = async () => {
    try {
      const strategiesData = await AsyncStorage.getItem("savedStrategies");
      if (strategiesData) {
        const strategies = JSON.parse(strategiesData);
        setTotalStrategies(strategies.length);
        
        // Get last 3 investigations
        const recent = strategies.slice(-3).reverse().map((s: any) => ({
          id: s.id,
          companyName: s.companyName,
          country: s.country,
          date: new Date(s.createdAt).toLocaleDateString("es-ES"),
        }));
        setRecentInvestigations(recent);
      }
    } catch (error) {
      console.error("Error loading recent data:", error);
    }
  };

  const handleNewInvestigation = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push("/(tabs)/search");
  };

  const handleViewStrategies = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push("/(tabs)/saved");
  };

  const handleToggleTheme = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newScheme = colorScheme === "light" ? "dark" : "light";
    setColorScheme(newScheme);
  };

  return (
    <ScreenContainer className="p-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View className="gap-8">
          {/* Header with Theme Toggle */}
          <View className="flex-row items-start justify-between gap-4">
            <View className="flex-1 gap-2">
              <Text className="text-4xl font-bold text-foreground">OptimaFlow</Text>
              <Text className="text-lg text-muted">Sales Intelligence</Text>
              <Text className="text-sm text-muted mt-2">
                Genera oportunidades de venta cualificadas con estrategias personalizadas
              </Text>
            </View>
            <Pressable
              onPress={handleToggleTheme}
              style={({ pressed }) => ({
                opacity: pressed ? 0.7 : 1,
                transform: [{ scale: pressed ? 0.95 : 1 }],
              })}
              className="w-12 h-12 rounded-full bg-surface border border-border items-center justify-center"
            >
              <IconSymbol
                name={colorScheme === "light" ? "paperplane.fill" : "house.fill"}
                size={20}
                color={colors.primary}
              />
            </Pressable>
          </View>

          {/* Quick Stats */}
          <View className="flex-row gap-4">
            <View className="flex-1 bg-surface rounded-2xl p-4 border border-border">
              <Text className="text-3xl font-bold text-primary">{totalStrategies}</Text>
              <Text className="text-xs text-muted mt-1">Estrategias</Text>
            </View>
            <View className="flex-1 bg-surface rounded-2xl p-4 border border-border">
              <Text className="text-3xl font-bold text-primary">5</Text>
              <Text className="text-xs text-muted mt-1">Países</Text>
            </View>
          </View>

          {/* Primary CTA */}
          <Pressable
            onPress={handleNewInvestigation}
            style={({ pressed }) => ({
              backgroundColor: colors.primary,
              opacity: pressed ? 0.9 : 1,
              transform: [{ scale: pressed ? 0.97 : 1 }],
            })}
            className="rounded-2xl p-4"
          >
            <View className="flex-row items-center justify-center gap-2">
              <IconSymbol name="paperplane.fill" size={20} color="white" />
              <Text className="text-white font-semibold text-base">Nueva Investigación</Text>
            </View>
          </Pressable>

          {/* Recent Investigations */}
          {recentInvestigations.length > 0 && (
            <View className="gap-3">
              <View className="flex-row items-center justify-between">
                <Text className="text-lg font-semibold text-foreground">Investigaciones Recientes</Text>
                <Pressable onPress={handleViewStrategies}>
                  <Text className="text-sm text-primary font-medium">Ver todas</Text>
                </Pressable>
              </View>

              <FlatList
                data={recentInvestigations}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                renderItem={({ item }) => (
                  <Pressable
                    onPress={() => router.push("/(tabs)/saved")}
                    style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
                    className="bg-surface rounded-xl p-4 border border-border mb-3"
                  >
                    <View className="flex-row items-start justify-between">
                      <View className="flex-1">
                        <Text className="text-base font-semibold text-foreground">{item.companyName}</Text>
                        <Text className="text-xs text-muted mt-1">{item.country}</Text>
                      </View>
                      <Text className="text-xs text-muted">{item.date}</Text>
                    </View>
                  </Pressable>
                )}
              />
            </View>
          )}

          {/* Empty State */}
          {recentInvestigations.length === 0 && (
            <View className="bg-surface rounded-2xl p-6 border border-border items-center gap-3">
              <View className="w-12 h-12 rounded-full bg-primary/10 items-center justify-center">
                <IconSymbol name="paperplane.fill" size={24} color={colors.primary} />
              </View>
              <Text className="text-base font-semibold text-foreground text-center">
                Comienza tu primera investigación
              </Text>
              <Text className="text-sm text-muted text-center">
                Analiza empresas y genera estrategias de prospección personalizadas
              </Text>
            </View>
          )}

          {/* Info Cards */}
          <View className="gap-3">
            <Pressable
              onPress={() => router.push("/(tabs)/opportunities")}
              style={({ pressed }) => ({
                opacity: pressed ? 0.7 : 1,
                transform: [{ scale: pressed ? 0.97 : 1 }],
              })}
              className="bg-surface rounded-xl p-4 border border-border"
            >
              <View className="flex-row gap-3">
                <View className="w-10 h-10 rounded-lg bg-primary/10 items-center justify-center">
                  <IconSymbol name="paperplane.fill" size={18} color={colors.primary} />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-foreground">Seguimiento</Text>
                  <Text className="text-xs text-muted mt-1">Gestiona tus oportunidades</Text>
                </View>
              </View>
            </Pressable>

            <View className="bg-surface rounded-xl p-4 border border-border">
              <View className="flex-row gap-3">
                <View className="w-10 h-10 rounded-lg bg-primary/10 items-center justify-center">
                  <IconSymbol name="chevron.right" size={18} color={colors.primary} />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-foreground">Análisis Inteligente</Text>
                  <Text className="text-xs text-muted mt-1">Identifica debilidades en ventas</Text>
                </View>
              </View>
            </View>

            <View className="bg-surface rounded-xl p-4 border border-border">
              <View className="flex-row gap-3">
                <View className="w-10 h-10 rounded-lg bg-primary/10 items-center justify-center">
                  <IconSymbol name="paperplane.fill" size={18} color={colors.primary} />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-foreground">Mensajes Personalizados</Text>
                  <Text className="text-xs text-muted mt-1">Estrategias listas para usar</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
