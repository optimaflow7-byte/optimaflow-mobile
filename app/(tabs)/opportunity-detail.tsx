import { ScrollView, Text, View, Pressable, TextInput, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import * as Haptics from "expo-haptics";
import { useState, useEffect } from "react";

interface Activity {
  id: number;
  type: "llamada" | "email" | "reunion" | "nota" | "propuesta";
  title: string;
  notes?: string;
  result?: string;
  createdAt: string;
}

const activityTypeConfig = {
  llamada: { label: "Llamada", icon: "paperplane.fill", color: "#0A7EA4" },
  email: { label: "Email", icon: "paperplane.fill", color: "#F59E0B" },
  reunion: { label: "Reunión", icon: "paperplane.fill", color: "#22C55E" },
  nota: { label: "Nota", icon: "paperplane.fill", color: "#8B5CF6" },
  propuesta: { label: "Propuesta", icon: "paperplane.fill", color: "#EC4899" },
};

export default function OpportunityDetailScreen() {
  const router = useRouter();
  const colors = useColors();
  const params = useLocalSearchParams();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [newActivityTitle, setNewActivityTitle] = useState("");
  const [newActivityNotes, setNewActivityNotes] = useState("");
  const [selectedActivityType, setSelectedActivityType] = useState<Activity["type"]>("nota");

  const opportunityId = parseInt(params.opportunityId as string);
  const companyName = params.companyName as string;
  const country = params.country as string;
  const status = params.status as string;

  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = async () => {
    try {
      setLoading(true);
      // Mock data
      const mockActivities: Activity[] = [
        {
          id: 1,
          type: "llamada",
          title: "Primera llamada de contacto",
          notes: "Gerente de ventas disponible, mostró interés en el sistema",
          result: "Positivo",
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 2,
          type: "email",
          title: "Envío de propuesta inicial",
          notes: "Propuesta con casos de éxito de concesionarios similares",
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ];
      setActivities(mockActivities);
    } catch (err) {
      console.error("Error loading activities:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddActivity = async () => {
    if (!newActivityTitle.trim()) {
      alert("Por favor ingresa un título para la actividad");
      return;
    }

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const newActivity: Activity = {
      id: activities.length + 1,
      type: selectedActivityType,
      title: newActivityTitle,
      notes: newActivityNotes || undefined,
      createdAt: new Date().toISOString(),
    };

    setActivities([newActivity, ...activities]);
    setNewActivityTitle("");
    setNewActivityNotes("");
    setSelectedActivityType("nota");
  };

  if (loading) {
    return (
      <ScreenContainer className="items-center justify-center">
        <View className="gap-4">
          <ActivityIndicator size="large" color={colors.primary} />
          <Text className="text-center text-muted">Cargando detalles...</Text>
        </View>
      </ScreenContainer>
    );
  }

  const statusColors: Record<string, { bg: string; text: string }> = {
    contactado: { bg: "#E0F2FE", text: "#0A7EA4" },
    en_progreso: { bg: "#FEF3C7", text: "#F59E0B" },
    cerrado: { bg: "#DCFCE7", text: "#22C55E" },
    perdido: { bg: "#FEE2E2", text: "#EF4444" },
  };

  const statusColor = statusColors[status] || statusColors.contactado;

  return (
    <ScreenContainer className="p-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View className="gap-6">
          {/* Header */}
          <View className="gap-2">
            <Pressable
              onPress={() => router.back()}
              className="flex-row items-center gap-2 mb-2"
            >
              <IconSymbol name="chevron.left" size={24} color={colors.primary} />
              <Text className="text-primary font-semibold">Volver</Text>
            </Pressable>
            <Text className="text-2xl font-bold text-foreground">{companyName}</Text>
            <View className="flex-row items-center justify-between">
              <Text className="text-sm text-muted">{country}</Text>
              <View style={{ backgroundColor: statusColor.bg }} className="rounded-full px-3 py-1">
                <Text style={{ color: statusColor.text }} className="text-xs font-semibold capitalize">
                  {status}
                </Text>
              </View>
            </View>
          </View>

          {/* Add Activity Section */}
          <View className="gap-3 bg-surface rounded-xl p-4 border border-border">
            <Text className="text-lg font-semibold text-foreground">Agregar Actividad</Text>

            {/* Activity Type Selector */}
            <View className="gap-2">
              <Text className="text-sm font-medium text-muted">Tipo de Actividad</Text>
              <View className="flex-row gap-2 flex-wrap">
                {(["llamada", "email", "reunion", "nota", "propuesta"] as const).map((type) => (
                  <Pressable
                    key={type}
                    onPress={() => setSelectedActivityType(type)}
                    className={`rounded-full px-3 py-2 border ${
                      selectedActivityType === type
                        ? "bg-primary border-primary"
                        : "bg-background border-border"
                    }`}
                  >
                    <Text
                      className={`text-xs font-medium ${
                        selectedActivityType === type ? "text-white" : "text-foreground"
                      }`}
                    >
                      {activityTypeConfig[type].label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Title Input */}
            <View className="gap-2">
              <Text className="text-sm font-medium text-muted">Título</Text>
              <TextInput
                placeholder="Ej: Primera llamada de contacto"
                placeholderTextColor={colors.muted}
                value={newActivityTitle}
                onChangeText={setNewActivityTitle}
                className="bg-background rounded-lg px-4 py-3 text-foreground border border-border"
              />
            </View>

            {/* Notes Input */}
            <View className="gap-2">
              <Text className="text-sm font-medium text-muted">Notas (opcional)</Text>
              <TextInput
                placeholder="Detalles de la actividad..."
                placeholderTextColor={colors.muted}
                value={newActivityNotes}
                onChangeText={setNewActivityNotes}
                multiline
                numberOfLines={3}
                className="bg-background rounded-lg px-4 py-3 text-foreground border border-border"
              />
            </View>

            {/* Add Button */}
            <Pressable
              onPress={handleAddActivity}
              style={({ pressed }) => ({
                backgroundColor: colors.primary,
                opacity: pressed ? 0.9 : 1,
                transform: [{ scale: pressed ? 0.97 : 1 }],
              })}
              className="rounded-lg p-3"
            >
              <Text className="text-white font-semibold text-center">Guardar Actividad</Text>
            </Pressable>
          </View>

          {/* Activities Timeline */}
          <View className="gap-3">
            <Text className="text-lg font-semibold text-foreground">Historial de Actividades</Text>

            {activities.length === 0 ? (
              <View className="items-center justify-center py-8 gap-3">
                <IconSymbol name="paperplane.fill" size={48} color={colors.muted} />
                <Text className="text-center text-muted">No hay actividades registradas</Text>
              </View>
            ) : (
              <View className="gap-3">
                {activities.map((activity, index) => {
                  const typeConfig = activityTypeConfig[activity.type];
                  const daysAgo = Math.floor(
                    (Date.now() - new Date(activity.createdAt).getTime()) / (24 * 60 * 60 * 1000)
                  );

                  return (
                    <View key={activity.id} className="gap-2">
                      {/* Timeline Connector */}
                      {index < activities.length - 1 && (
                        <View
                          style={{ backgroundColor: colors.border }}
                          className="w-0.5 h-4 ml-6"
                        />
                      )}

                      {/* Activity Card */}
                      <View className="flex-row gap-3">
                        {/* Timeline Dot */}
                        <View
                          style={{ backgroundColor: typeConfig.color }}
                          className="w-4 h-4 rounded-full mt-1"
                        />

                        {/* Activity Content */}
                        <View className="flex-1 bg-surface rounded-lg p-3 border border-border gap-2">
                          <View className="flex-row items-center justify-between">
                            <Text className="text-sm font-semibold text-foreground">
                              {activity.title}
                            </Text>
                            <Text className="text-xs text-muted">
                              {daysAgo === 0 ? "Hoy" : `Hace ${daysAgo}d`}
                            </Text>
                          </View>

                          <View className="flex-row items-center gap-2">
                            <View
                              style={{ backgroundColor: typeConfig.color + "20" }}
                              className="rounded-full px-2 py-1"
                            >
                              <Text
                                style={{ color: typeConfig.color }}
                                className="text-xs font-medium"
                              >
                                {typeConfig.label}
                              </Text>
                            </View>
                            {activity.result && (
                              <View className="bg-success/10 rounded-full px-2 py-1">
                                <Text className="text-xs font-medium text-success">
                                  {activity.result}
                                </Text>
                              </View>
                            )}
                          </View>

                          {activity.notes && (
                            <Text className="text-sm text-muted leading-relaxed">
                              {activity.notes}
                            </Text>
                          )}
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
