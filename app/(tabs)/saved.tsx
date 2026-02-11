import { ScrollView, Text, View, FlatList, Pressable, Alert } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useState, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";

interface SavedStrategy {
  id: string;
  companyName: string;
  country: string;
  type: string;
  createdAt: string;
  outreachMessage: string;
  hypothesis: string;
}

export default function SavedScreen() {
  const colors = useColors();
  const [strategies, setStrategies] = useState<SavedStrategy[]>([]);
  const [searchText, setSearchText] = useState("");

  useFocusEffect(
    useCallback(() => {
      loadStrategies();
    }, [])
  );

  const loadStrategies = async () => {
    try {
      const data = await AsyncStorage.getItem("savedStrategies");
      if (data) {
        const parsed = JSON.parse(data);
        setStrategies(parsed.reverse());
      }
    } catch (error) {
      console.error("Error loading strategies:", error);
    }
  };

  const handleDeleteStrategy = async (id: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      "Eliminar estrategia",
      "¿Estás seguro de que deseas eliminar esta estrategia?",
      [
        { text: "Cancelar", onPress: () => {} },
        {
          text: "Eliminar",
          onPress: async () => {
            try {
              const data = await AsyncStorage.getItem("savedStrategies");
              if (data) {
                const parsed = JSON.parse(data);
                const filtered = parsed.filter((s: any) => s.id !== id);
                await AsyncStorage.setItem("savedStrategies", JSON.stringify(filtered));
                loadStrategies();
              }
            } catch (error) {
              console.error("Error deleting strategy:", error);
            }
          },
          style: "destructive",
        },
      ]
    );
  };

  const filteredStrategies = strategies.filter((s) =>
    s.companyName.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <ScreenContainer className="p-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View className="gap-4">
          {/* Header */}
          <View className="gap-2 mb-2">
            <Text className="text-2xl font-bold text-foreground">Estrategias Guardadas</Text>
            <Text className="text-sm text-muted">
              {strategies.length} estrategia{strategies.length !== 1 ? "s" : ""}
            </Text>
          </View>

          {/* Search */}
          <View className="flex-row items-center bg-surface border border-border rounded-xl px-4 py-3 gap-2">
            <IconSymbol name="chevron.right" size={18} color={colors.muted} />
            <TextInput
              placeholder="Buscar estrategias..."
              placeholderTextColor={colors.muted}
              value={searchText}
              onChangeText={setSearchText}
              className="flex-1 text-foreground"
            />
          </View>

          {/* Strategies List */}
          {filteredStrategies.length > 0 ? (
            <FlatList
              data={filteredStrategies}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <Pressable
                  style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
                  className="bg-surface rounded-xl p-4 border border-border mb-3"
                >
                  <View className="gap-3">
                    <View className="flex-row items-start justify-between">
                      <View className="flex-1">
                        <Text className="text-base font-semibold text-foreground">
                          {item.companyName}
                        </Text>
                        <Text className="text-xs text-muted mt-1">
                          {item.type} • {item.country}
                        </Text>
                      </View>
                      <Pressable
                        onPress={() => handleDeleteStrategy(item.id)}
                        style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}
                      >
                        <IconSymbol name="chevron.right" size={18} color={colors.error} />
                      </Pressable>
                    </View>

                    <View className="bg-surface border border-border rounded-lg p-3">
                      <Text className="text-xs text-muted line-clamp-2">
                        {item.hypothesis}
                      </Text>
                    </View>

                    <View className="flex-row gap-2">
                      <Text className="text-xs text-muted">
                        {new Date(item.createdAt).toLocaleDateString("es-ES")}
                      </Text>
                    </View>
                  </View>
                </Pressable>
              )}
            />
          ) : (
            <View className="items-center py-12">
              <View className="w-16 h-16 rounded-full bg-primary/10 items-center justify-center mb-4">
                <IconSymbol name="paperplane.fill" size={32} color={colors.primary} />
              </View>
              <Text className="text-base font-semibold text-foreground text-center">
                {strategies.length === 0
                  ? "No hay estrategias guardadas"
                  : "No se encontraron resultados"}
              </Text>
              <Text className="text-sm text-muted text-center mt-2">
                {strategies.length === 0
                  ? "Crea tu primera estrategia desde la pantalla de búsqueda"
                  : "Intenta con otro término de búsqueda"}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

import { TextInput } from "react-native";
