import { View, Text } from "react-native";
import { useColors } from "@/hooks/use-colors";
import { IconSymbol } from "@/components/ui/icon-symbol";

interface DashboardMetricsProps {
    metrics: {
        total: number;
        byStatus: { status: string; count: number }[];
        averageScore: string;
    };
}

export function DashboardMetrics({ metrics }: DashboardMetricsProps) {
    const colors = useColors();

    const statusConfig: Record<string, { label: string; color: string; bgColor: string }> = {
        contactado: { label: "Contactado", color: colors.primary, bgColor: colors.primary + "25" },
        en_progreso: { label: "En Progreso", color: colors.warning, bgColor: colors.warning + "25" },
        cerrado: { label: "Cerrado", color: colors.success, bgColor: colors.success + "25" },
        perdido: { label: "Perdido", color: colors.error, bgColor: colors.error + "25" },
    };

    // Calculate generic stats
    const total = metrics.total;
    const closed = metrics.byStatus.find((s) => s.status === "cerrado")?.count || 0;
    const lost = metrics.byStatus.find((s) => s.status === "perdido")?.count || 0;
    const winRate = closed + lost > 0 ? Math.round((closed / (closed + lost)) * 100) : 0;

    return (
        <View className="gap-4">
            {/* Summary Cards Row */}
            <View className="flex-row gap-3">
                {/* Total Card */}
                <View className="flex-1 bg-surface p-3 rounded-xl border border-border items-center justify-center gap-1">
                    <Text className="text-muted text-xs font-medium">Total</Text>
                    <Text className="text-2xl font-bold text-foreground">{total}</Text>
                </View>

                {/* Win Rate Card */}
                <View className="flex-1 bg-surface p-3 rounded-xl border border-border items-center justify-center gap-1">
                    <Text className="text-muted text-xs font-medium">Tasa Cierre</Text>
                    <Text className="text-2xl font-bold text-primary">{winRate}%</Text>
                </View>

                {/* Score Card */}
                <View className="flex-1 bg-surface p-3 rounded-xl border border-border items-center justify-center gap-1">
                    <Text className="text-muted text-xs font-medium">Score Prom.</Text>
                    <Text className="text-2xl font-bold text-accent">{metrics.averageScore}</Text>
                </View>
            </View>

            {/* Pipeline Status Bars */}
            <View className="bg-surface p-4 rounded-xl border border-border gap-3">
                <Text className="text-base font-semibold text-foreground">Pipeline</Text>
                <View className="gap-3">
                    {(["contactado", "en_progreso", "cerrado", "perdido"] as const).map((status) => {
                        const count = metrics.byStatus.find((s) => s.status === status)?.count || 0;
                        const percentage = total > 0 ? (count / total) * 100 : 0;
                        const config = statusConfig[status];

                        return (
                            <View key={status} className="gap-1">
                                <View className="flex-row justify-between items-center">
                                    <Text className="text-sm font-medium text-foreground">{config.label}</Text>
                                    <Text className="text-sm text-muted">
                                        {count} ({Math.round(percentage)}%)
                                    </Text>
                                </View>
                                <View className="h-2 bg-secondary/30 rounded-full overflow-hidden">
                                    <View
                                        style={{
                                            width: `${percentage}%`,
                                            backgroundColor: config.color,
                                        }}
                                        className="h-full rounded-full"
                                    />
                                </View>
                            </View>
                        );
                    })}
                </View>
            </View>
        </View>
    );
}
