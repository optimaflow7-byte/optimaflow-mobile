import { ScrollView, Text, View, Pressable, FlatList, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { DashboardMetrics } from "@/components/dashboard-metrics";
import * as Haptics from "expo-haptics";
import { useState, useEffect } from "react";

interface Opportunity {
  id: number;
  companyName: string;
  country: string;
  companyType: string;
  status: "contactado" | "en_progreso" | "cerrado" | "perdido";
  opportunityScore: number;
  contactDate: string | null;
  lastActivityDate: string | null;
  createdAt: string;
}

const statusConfig = {
  contactado: { label: "Contactado", color: "#0A7EA4", bgColor: "#E0F2FE" },
  en_progreso: { label: "En Progreso", color: "#F59E0B", bgColor: "#FEF3C7" },
  cerrado: { label: "Cerrado", color: "#22C55E", bgColor: "#DCFCE7" },
  perdido: { label: "Perdido", color: "#EF4444", bgColor: "#FEE2E2" },
};

export default function OpportunitiesScreen() {
  const router = useRouter();
  const colors = useColors();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"todas" | "contactado" | "en_progreso" | "cerrado" | "perdido">("todas");
  const [metrics, setMetrics] = useState({
    total: 0,
    byStatus: [] as { status: string; count: number }[],
    averageScore: "0.0",
  });

  useEffect(() => {
    loadOpportunities();
  }, []);

  const loadOpportunities = async () => {
    try {
      setLoading(true);
      // Mock data - en producción se usaría tRPC
      const mockData: Opportunity[] = [
        {
          id: 1,
          companyName: "BMW Concesionario Madrid",
          country: "España",
          companyType: "Concesionario",
          status: "en_progreso",
          opportunityScore: 8,
          contactDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          lastActivityDate: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 2,
          companyName: "Tesla Service Berlin",
          country: "Alemania",
          companyType: "Distribuidor EV",
          status: "contactado",
          opportunityScore: 7,
          contactDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          lastActivityDate: null,
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 3,
          companyName: "Renault Group France",
          country: "Francia",
          companyType: "Concesionario",
          status: "cerrado",
          opportunityScore: 9,
          contactDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          lastActivityDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 4,
          companyName: "Fiat Italia S.p.A",
          country: "Italia",
          companyType: "Empresa B2B",
          status: "perdido",
          opportunityScore: 5,
          contactDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
          lastActivityDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ];
      setOpportunities(mockData);

      // Calcular métricas basadas en los datos (simulando backend)
      const total = mockData.length;
      const statusCounts = mockData.reduce((acc, curr) => {
        acc[curr.status] = (acc[curr.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const byStatus = Object.entries(statusCounts).map(([status, count]) => ({ status, count }));
      const avgScore = (mockData.reduce((acc, curr) => acc + curr.opportunityScore, 0) / total).toFixed(1);

      setMetrics({
        total,
        byStatus,
        averageScore: avgScore,
      });

    } catch (err) {
      console.error("Error loading opportunities:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredOpportunities =
    filter === "todas"
      ? opportunities
      : opportunities.filter((opp) => opp.status === filter);

  const handleStatusChange = async (id: number, newStatus: Opportunity["status"]) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setOpportunities(
      opportunities.map((opp) =>
        opp.id === id ? { ...opp, status: newStatus, lastActivityDate: new Date().toISOString() } : opp
      )
    );
  };

  const handleViewDetails = (opportunity: Opportunity) => {
    router.push({
      pathname: "/(tabs)/opportunity-detail",
      params: {
        opportunityId: opportunity.id.toString(),
        companyName: opportunity.companyName,
        country: opportunity.country,
        status: opportunity.status,
      },
    });
  };

  if (loading) {
    return (
      <ScreenContainer className="items-center justify-center">
        <View className="gap-4">
          <ActivityIndicator size="large" color={colors.primary} />
          <Text className="text-center text-muted">Cargando oportunidades...</Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="p-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View className="gap-6">
          {/* Header */}
          <View className="gap-2">
            <Text className="text-2xl font-bold text-foreground">Seguimiento de Oportunidades</Text>
            <Text className="text-sm text-muted">Gestión de pipeline de ventas</Text>
          </View>

          {/* Dashboard Metrics */}
          <DashboardMetrics metrics={metrics} />

          <View className="h-px bg-border" />

          {/* Filter Buttons */}
          <View className="gap-2">
            <Text className="text-sm font-semibold text-muted">Filtrar por estado</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="gap-2">
              {(["todas", "contactado", "en_progreso", "cerrado", "perdido"] as const).map((status) => (
                <Pressable
                  key={status}
                  onPress={() => setFilter(status)}
                  style={({ pressed }) => ({
                    opacity: pressed ? 0.7 : 1,
                  })}
                  className={`rounded-full px-4 py-2 border ${filter === status
                    ? "bg-primary border-primary"
                    : "bg-surface border-border"
                    }`}
                >
                  <Text
                    className={`text-sm font-medium ${filter === status ? "text-white" : "text-foreground"
                      }`}
                  >
                    {status === "todas"
                      ? "Todas"
                      : status === "contactado"
                        ? "Contactado"
                        : status === "en_progreso"
                          ? "En Progreso"
                          : status === "cerrado"
                            ? "Cerrado"
                            : "Perdido"}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>

          {/* Opportunities List */}
          {filteredOpportunities.length === 0 ? (
            <View className="items-center justify-center py-8 gap-3">
              <IconSymbol name="paperplane.fill" size={48} color={colors.muted} />
              <Text className="text-center text-muted">No hay oportunidades en este estado</Text>
            </View>
          ) : (
            <View className="gap-3">
              {filteredOpportunities.map((opportunity) => {
                const statusInfo = statusConfig[opportunity.status];
                const daysAgo = Math.floor(
                  (Date.now() - new Date(opportunity.contactDate || opportunity.createdAt).getTime()) /
                  (24 * 60 * 60 * 1000)
                );

                return (
                  <Pressable
                    key={opportunity.id}
                    onPress={() => handleViewDetails(opportunity)}
                    style={({ pressed }) => ({
                      opacity: pressed ? 0.7 : 1,
                      transform: [{ scale: pressed ? 0.97 : 1 }],
                    })}
                    className="bg-surface rounded-xl p-4 border border-border gap-3"
                  >
                    {/* Company Info */}
                    <View className="gap-1">
                      <View className="flex-row items-center justify-between">
                        <Text className="text-base font-semibold text-foreground flex-1">
                          {opportunity.companyName}
                        </Text>
                        <View
                          style={{ backgroundColor: statusInfo.bgColor }}
                          className="rounded-full px-3 py-1"
                        >
                          <Text style={{ color: statusInfo.color }} className="text-xs font-semibold">
                            {statusInfo.label}
                          </Text>
                        </View>
                      </View>
                      <Text className="text-sm text-muted">
                        {opportunity.country} • {opportunity.companyType}
                      </Text>
                    </View>

                    {/* Score and Activity */}
                    <View className="flex-row items-center justify-between pt-2 border-t border-border">
                      <View className="flex-row items-center gap-2">
                        <View className="bg-primary/10 rounded-full px-3 py-1">
                          <Text className="text-sm font-semibold text-primary">
                            Score: {opportunity.opportunityScore}/10
                          </Text>
                        </View>
                      </View>
                      <Text className="text-xs text-muted">
                        {daysAgo === 0 ? "Hoy" : daysAgo === 1 ? "Ayer" : `Hace ${daysAgo}d`}
                      </Text>
                    </View>

                    {/* Status Change Buttons */}
                    <View className="flex-row gap-2 pt-2">
                      {(["contactado", "en_progreso", "cerrado", "perdido"] as const).map((status) => (
                        <Pressable
                          key={status}
                          onPress={() => handleStatusChange(opportunity.id, status)}
                          disabled={opportunity.status === status}
                          style={({ pressed }) => ({
                            opacity: opportunity.status === status ? 0.5 : pressed ? 0.7 : 1,
                          })}
                          className={`flex-1 rounded-lg py-2 ${opportunity.status === status
                            ? "bg-primary/20"
                            : "bg-surface border border-border"
                            }`}
                        >
                          <Text
                            className={`text-xs font-medium text-center ${opportunity.status === status
                              ? "text-primary"
                              : "text-foreground"
                              }`}
                          >
                            {status === "contactado"
                              ? "Contactado"
                              : status === "en_progreso"
                                ? "Progreso"
                                : status === "cerrado"
                                  ? "Cerrado"
                                  : "Perdido"}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  </Pressable>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
