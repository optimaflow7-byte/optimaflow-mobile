import { View, Text, FlatList, Pressable, RefreshControl, ActivityIndicator, Dimensions } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { trpc } from "@/lib/trpc";
import { useColors } from "@/hooks/use-colors";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useRouter } from "expo-router";
import { useState, useMemo } from "react";

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function DealershipsScreen() {
    const colors = useColors();
    const router = useRouter();
    const [refreshing, setRefreshing] = useState(false);

    const { data: dealerships, isLoading, refetch } = trpc.dealerships.list.useQuery();

    const onRefresh = async () => {
        setRefreshing(true);
        await refetch();
        setRefreshing(false);
    };

    const metrics = useMemo(() => {
        if (!dealerships) return { total: 0, active: 0, pending: 0, inactive: 0 };
        return {
            total: dealerships.length,
            active: dealerships.filter(d => d.status === 'activo').length,
            pending: dealerships.filter(d => d.status === 'pendiente').length,
            inactive: dealerships.filter(d => d.status === 'inactivo').length
        };
    }, [dealerships]);

    const MetricCard = ({ title, value, color, icon }: { title: string, value: number, color: string, icon: string }) => (
        <View className="bg-surface rounded-xl p-3 flex-1 border border-border mr-2 min-w-[100px] shadow-sm">
            <View className="flex-row justify-between items-start mb-2">
                <Text className="text-xs font-bold text-muted uppercase tracking-wider">{title}</Text>
                <IconSymbol name={icon as any} size={16} color={color} />
            </View>
            <Text className="text-2xl font-bold text-foreground">{value}</Text>
        </View>
    );

    const renderItem = ({ item }: { item: any }) => {
        let statusColor = colors.muted;
        let statusIcon = "circle";
        if (item.status === 'activo') { statusColor = "#22C55E"; statusIcon = "checkmark.circle.fill"; }
        else if (item.status === 'pendiente') { statusColor = "#F59E0B"; statusIcon = "clock.fill"; }
        else if (item.status === 'inactivo') { statusColor = "#EF4444"; statusIcon = "xmark.circle.fill"; }


        return (
            <Pressable
                onPress={() => router.push(`/dealerships/${item.id}`)}
                style={({ pressed }) => ({
                    opacity: pressed ? 0.9 : 1,
                    transform: [{ scale: pressed ? 0.98 : 1 }]
                })}
                className="bg-surface rounded-xl border border-border mb-3 overflow-hidden shadow-sm"
            >
                <View className="flex-row">
                    <View style={{ width: 6, backgroundColor: statusColor }} />
                    <View className="flex-1 p-4">
                        <View className="flex-row justify-between items-start mb-2">
                            <Text className="text-lg font-bold text-foreground flex-1 pr-2">{item.name}</Text>
                            <View className="flex-row items-center bg-surface/50 px-2 py-1 rounded-md border border-border">
                                <IconSymbol name={statusIcon as any} size={12} color={statusColor} />
                                <Text style={{ color: statusColor }} className="text-xs font-bold uppercase ml-1">
                                    {item.status}
                                </Text>
                            </View>
                        </View>

                        <View className="flex-row flex-wrap gap-4 mt-1">
                            <View className="flex-row items-center">
                                <IconSymbol name="mappin.circle.fill" size={14} color={colors.muted} />
                                <Text className="text-sm text-muted ml-1 font-medium">
                                    {item.city || "Sin ciudad"}, {item.country || "Sin país"}
                                </Text>
                            </View>
                        </View>

                        {(item.phone || item.website) && (
                            <View className="flex-row gap-3 mt-3 pt-3 border-t border-border/50">
                                {item.phone && (
                                    <View className="flex-row items-center">
                                        <IconSymbol name="phone.fill" size={12} color={colors.primary} />
                                        <Text className="text-xs text-muted ml-1">{item.phone}</Text>
                                    </View>
                                )}
                                {item.website && (
                                    <View className="flex-row items-center">
                                        <IconSymbol name="globe" size={12} color={colors.primary} />
                                        <Text className="text-xs text-muted ml-1" numberOfLines={1} style={{ maxWidth: 150 }}>{item.website}</Text>
                                    </View>
                                )}
                            </View>
                        )}
                    </View>
                </View>
            </Pressable>
        );
    };

    return (
        <ScreenContainer className="flex-1 px-4 pt-2">
            <View className="flex-row justify-between items-center mb-6 mt-2">
                <View>
                    <Text className="text-xs font-bold text-primary uppercase tracking-widest mb-1">DASHBOARD</Text>
                    <Text className="text-3xl font-bold text-foreground">Concesionarios</Text>
                </View>
                <View className="flex-row gap-2">
                    <Pressable
                        onPress={() => router.push("/dealerships/discovery")}
                        className="bg-primary/10 w-12 h-12 rounded-xl items-center justify-center border border-primary/20 active:opacity-80"
                    >
                        <IconSymbol name="globe" size={24} color={colors.primary} />
                    </Pressable>
                    <Pressable
                        onPress={() => router.push("/dealerships/add")}
                        className="bg-primary w-12 h-12 rounded-xl items-center justify-center shadow-lg active:opacity-80"
                    >
                        <IconSymbol name="plus" size={24} color="#fff" />
                    </Pressable>
                </View>
            </View>


            {
                isLoading ? (
                    <View className="flex-1 justify-center items-center">
                        <ActivityIndicator size="large" color={colors.primary} />
                    </View>
                ) : (
                    <FlatList
                        data={dealerships}
                        renderItem={renderItem}
                        keyExtractor={(item) => item.id.toString()}
                        contentContainerStyle={{ paddingBottom: 100 }}
                        refreshControl={
                            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
                        }
                        ListHeaderComponent={
                            <View className="flex-row mb-6 overflow-hidden">
                                <MetricCard title="Total" value={metrics.total} color={colors.primary} icon="building.2.fill" />
                                <MetricCard title="Activos" value={metrics.active} color="#22C55E" icon="checkmark.circle.fill" />
                                <MetricCard title="Pendientes" value={metrics.pending} color="#F59E0B" icon="clock.fill" />
                            </View>
                        }
                        ListEmptyComponent={
                            <View className="items-center justify-center py-20 bg-surface/30 rounded-3xl border-2 border-dashed border-border p-8">
                                <View className="w-20 h-20 bg-surface rounded-full items-center justify-center mb-6 shadow-sm">
                                    <IconSymbol name="chart.bar.fill" size={40} color={colors.muted} />
                                </View>
                                <Text className="text-xl font-bold text-foreground text-center">Sin Datos</Text>
                                <Text className="text-sm text-muted text-center mt-2 mb-8 max-w-[250px] leading-relaxed">
                                    No hay métricas disponibles. Añade tu primer concesionario para activar el dashboard.
                                </Text>
                                <Pressable
                                    onPress={() => router.push("/dealerships/add")}
                                    className="bg-primary px-8 py-4 rounded-xl flex-row items-center shadow-lg active:scale-95 transition-transform"
                                >
                                    <IconSymbol name="plus" size={18} color="#fff" />
                                    <Text className="text-white font-bold ml-3 text-base">Añadir Ahora</Text>
                                </Pressable>
                            </View>
                        }
                    />
                )
            }
        </ScreenContainer >
    );
}
