import { View, Text, FlatList, Pressable, RefreshControl, ActivityIndicator, Alert, TextInput } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { trpc } from "@/lib/trpc";
import { useColors } from "@/hooks/use-colors";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useRouter, Stack } from "expo-router";
import { useState } from "react";
import { useDebounce } from "@/hooks/use-debounce"; // Assuming this hook exists or we create it, otherwise simple state

export default function EuropeanDealershipsScreen() {
    const colors = useColors();
    const router = useRouter();
    const [page, setPage] = useState(0);
    const [search, setSearch] = useState("");
    const debouncedSearch = useDebounce(search, 500);
    const LIMIT = 50;

    const { data: dealerships, isLoading, isFetching, refetch } = trpc.europeanDealerships.list.useQuery({
        limit: LIMIT,
        offset: page * LIMIT,
        query: debouncedSearch
    });

    const utils = trpc.useContext();
    const importMutation = trpc.europeanDealerships.import.useMutation({
        onSuccess: () => {
            utils.dealerships.list.invalidate();
            Alert.alert("Éxito", "Concesionario importado correctamente");
        },
        onError: (err) => {
            Alert.alert("Error", err.message || "No se pudo importar");
        }
    });

    const handleImport = (id: string) => {
        importMutation.mutate({ id });
    };

    const onNextPage = () => setPage(p => p + 1);
    const onPrevPage = () => setPage(p => Math.max(0, p - 1));

    const renderItem = ({ item }: { item: any }) => (
        <View className="bg-surface rounded-xl border border-border mb-3 p-4 shadow-sm flex-row items-center">
            <View className="flex-1 mr-2">
                <Text className="text-lg font-bold text-foreground mb-1">{item.name}</Text>
                {item.brand && (
                    <Text className="text-xs font-bold text-primary uppercase mb-1">{item.brand}</Text>
                )}
                <View className="flex-row items-center mt-1">
                    <IconSymbol name="mappin.circle.fill" size={12} color={colors.muted} />
                    <Text className="text-xs text-muted ml-1" numberOfLines={1}>
                        {item.city || "Sin ciudad"}, {item.country || "Sin país"}
                    </Text>
                </View>
                {item.website && (
                    <View className="flex-row items-center mt-1">
                        <IconSymbol name="link" size={12} color={colors.muted} />
                        <Text className="text-xs text-muted ml-1" numberOfLines={1}>{item.website}</Text>
                    </View>
                )}
            </View>
            <Pressable
                onPress={() => handleImport(item.id)}
                disabled={importMutation.isPending}
                className="bg-primary/10 border border-primary/20 p-3 rounded-full items-center justify-center active:bg-primary/20"
            >
                {importMutation.isPending ? (
                    <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                    <IconSymbol name="plus.circle.fill" size={24} color={colors.primary} />
                )}
            </Pressable>
        </View>
    );

    return (
        <ScreenContainer className="flex-1">
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header */}
            <View className="px-4 py-3 border-b border-border flex-row items-center justify-between bg-surface">
                <Pressable onPress={() => router.back()} className="p-2 -ml-2 rounded-full active:bg-muted/10">
                    <IconSymbol name="chevron.left" size={24} color={colors.primary} />
                </Pressable>
                <View className="flex-1 mx-2">
                    <Text className="text-xs font-bold text-muted uppercase tracking-wider text-center">Base de Datos</Text>
                    <Text className="text-lg font-bold text-foreground text-center">Concesionarios Europa</Text>
                </View>
                <View style={{ width: 40 }} />
            </View>

            {/* List */}
            <FlatList
                data={dealerships}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
                ListEmptyComponent={
                    !isLoading ? (
                        <View className="items-center justify-center py-20">
                            <Text className="text-muted">No se encontraron resultados</Text>
                        </View>
                    ) : null
                }
                ListFooterComponent={
                    <View className="flex-row justify-between items-center py-4 bg-surface/50 rounded-xl px-4 mt-4 border border-border">
                        <Pressable
                            onPress={onPrevPage}
                            disabled={page === 0}
                            className={`flex-row items-center ${page === 0 ? 'opacity-50' : ''}`}
                        >
                            <IconSymbol name="chevron.left" size={16} color={colors.primary} />
                            <Text className="text-primary font-bold ml-2">Anterior</Text>
                        </Pressable>
                        <Text className="text-muted font-mono text-xs">Página {page + 1}</Text>
                        <Pressable
                            onPress={onNextPage}
                            disabled={!dealerships || dealerships.length < LIMIT}
                            className={`flex-row items-center ${(!dealerships || dealerships.length < LIMIT) ? 'opacity-50' : ''}`}
                        >
                            <Text className="text-primary font-bold mr-2">Siguiente</Text>
                            <IconSymbol name="chevron.right" size={16} color={colors.primary} />
                        </Pressable>
                    </View>
                }
            />

            {isLoading && !dealerships && (
                <View className="absolute inset-0 justify-center items-center bg-background/50">
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            )}
        </ScreenContainer>
    );
}
