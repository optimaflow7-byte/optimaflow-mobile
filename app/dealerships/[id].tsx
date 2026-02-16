import { View, Text, TextInput, Pressable, ScrollView, Alert, ActivityIndicator } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useRouter, useLocalSearchParams, Stack } from "expo-router";
import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";

export default function DealershipDetailScreen() {
    const { id } = useLocalSearchParams();
    const dealershipId = typeof id === 'string' ? parseInt(id, 10) : 0;

    const colors = useColors();
    const router = useRouter();
    const utils = trpc.useUtils();

    const [isEditing, setIsEditing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Fetch dealership data
    const { data: dealership, isLoading, error, refetch } = trpc.dealerships.get.useQuery(
        { id: dealershipId },
        { enabled: !!dealershipId }
    );

    const updateMutation = trpc.dealerships.update.useMutation({
        onSuccess: () => {
            utils.dealerships.list.invalidate();
            utils.dealerships.get.invalidate({ id: dealershipId });
            setIsEditing(false);
            Alert.alert("Éxito", "Concesionario actualizado");
        },
        onError: (err) => Alert.alert("Error", err.message || "No se pudo actualizar")
    });

    const deleteMutation = trpc.dealerships.delete.useMutation({
        onSuccess: () => {
            utils.dealerships.list.invalidate();
            router.back();
        },
        onError: (err) => Alert.alert("Error", err.message || "No se pudo eliminar")
    });

    const [formData, setFormData] = useState({
        name: "",
        address: "",
        city: "",
        country: "",
        phone: "",
        website: "",
        notes: "",
        status: "activo" as "activo" | "inactivo" | "pendiente",
    });

    useEffect(() => {
        if (dealership) {
            setFormData({
                name: dealership.name || "",
                address: dealership.address || "",
                city: dealership.city || "",
                country: dealership.country || "",
                phone: dealership.phone || "",
                website: dealership.website || "",
                notes: dealership.notes || "",
                status: (dealership.status as any) || "activo",
            });
        }
    }, [dealership]);

    const handleUpdate = async () => {
        if (!formData.name.trim()) return Alert.alert("Error", "Nombre obligatorio");
        setIsSubmitting(true);
        try {
            await updateMutation.mutateAsync({ id: dealershipId, ...formData });
        } catch (e) {
            // Error handled in onError
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = () => {
        Alert.alert("Eliminar", "¿Estás seguro de que quieres eliminar este concesionario?", [
            { text: "Cancelar", style: "cancel" },
            { text: "Eliminar", style: "destructive", onPress: () => deleteMutation.mutate({ id: dealershipId }) }
        ]);
    };

    if (isLoading) return (
        <ScreenContainer className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color={colors.primary} />
        </ScreenContainer>
    );

    if (error || !dealership) return (
        <ScreenContainer className="flex-1 justify-center items-center p-4">
            <IconSymbol name="exclamationmark.triangle.fill" size={48} color={colors.muted} />
            <Text className="text-foreground text-lg mt-4 font-medium">No se encontró el concesionario</Text>
            <Pressable onPress={() => router.back()} className="mt-4 bg-primary px-6 py-2 rounded-full">
                <Text className="text-white font-bold">Volver</Text>
            </Pressable>
        </ScreenContainer>
    );

    const DetailItem = ({ label, value, icon }: { label: string, value: string | undefined | null, icon: string }) => (
        <View className="mb-4 bg-surface/50 p-3 rounded-xl border border-border">
            <View className="flex-row items-center mb-1">
                <IconSymbol name={icon as any} size={14} color={colors.muted} />
                <Text className="text-xs font-bold text-muted uppercase ml-2">{label}</Text>
            </View>
            <Text className="text-foreground text-base ml-6 font-medium">{value || "-"}</Text>
        </View>
    );

    const InputField = ({ label, value, field, placeholder, multiline = false }: any) => (
        <View className="mb-4">
            <Text className="text-xs font-bold text-muted uppercase mb-2 ml-1">{label}</Text>
            <TextInput
                className={`bg-surface text-foreground border border-border rounded-xl p-3 ${multiline ? 'h-24 text-top' : 'h-12'}`}
                value={value}
                onChangeText={(text) => setFormData(prev => ({ ...prev, [field]: text }))}
                multiline={multiline}
                placeholder={placeholder}
                placeholderTextColor={colors.muted}
                textAlignVertical={multiline ? "top" : "center"}
            />
        </View>
    );

    let statusColor = colors.muted;
    let statusIcon = "circle";
    if (dealership.status === 'activo') { statusColor = "#22C55E"; statusIcon = "checkmark.circle.fill"; }
    else if (dealership.status === 'pendiente') { statusColor = "#F59E0B"; statusIcon = "clock.fill"; }
    else if (dealership.status === 'inactivo') { statusColor = "#EF4444"; statusIcon = "xmark.circle.fill"; }

    return (
        <ScreenContainer className="flex-1">
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header Area */}
            <View className="px-4 py-3 border-b border-border flex-row items-center justify-between bg-surface">
                <Pressable onPress={() => router.back()} className="p-2 -ml-2 rounded-full active:bg-muted/10">
                    <IconSymbol name="chevron.left" size={24} color={colors.primary} />
                </Pressable>
                <Text className="text-lg font-bold text-foreground flex-1 mx-2 text-center uppercase tracking-wider">
                    {isEditing ? "Editar" : "Detalles"}
                </Text>
                <Pressable onPress={() => setIsEditing(!isEditing)} className="p-2 -mr-2 bg-primary/10 rounded-lg">
                    <Text className="text-primary font-bold text-xs uppercase px-2">{isEditing ? "Cancelar" : "Editar"}</Text>
                </Pressable>
            </View>

            <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>

                {!isEditing && (
                    <View className="bg-surface rounded-xl border border-border p-4 mb-6 shadow-sm border-l-4" style={{ borderLeftColor: statusColor }}>
                        <Text className="text-xs font-bold text-muted uppercase mb-1">Proyecto / Concesionario</Text>
                        <Text className="text-2xl font-bold text-foreground mb-2">{dealership.name}</Text>

                        <View className="flex-row items-center mt-2 bg-background/50 self-start px-3 py-1 rounded-full border border-border">
                            <IconSymbol name={statusIcon as any} size={14} color={statusColor} />
                            <Text style={{ color: statusColor }} className="font-bold text-sm ml-2 uppercase">{dealership.status}</Text>
                        </View>
                    </View>
                )}

                {isEditing ? (
                    <>
                        <InputField label="Nombre *" value={formData.name} field="name" placeholder="Nombre" />
                        <View className="mb-4">
                            <Text className="text-xs font-bold text-muted uppercase mb-2 ml-1">Estado</Text>
                            <View className="flex-row bg-surface border border-border rounded-xl p-1">
                                {(["activo", "pendiente", "inactivo"] as const).map((status) => (
                                    <Pressable
                                        key={status}
                                        onPress={() => setFormData(prev => ({ ...prev, status }))}
                                        className={`flex-1 items-center py-2 rounded-lg ${formData.status === status ? 'bg-primary shadow-sm' : 'bg-transparent'}`}
                                    >
                                        <Text className={`capitalize font-bold text-xs ${formData.status === status ? 'text-white' : 'text-muted'}`}>
                                            {status}
                                        </Text>
                                    </Pressable>
                                ))}
                            </View>
                        </View>
                        <InputField label="Dirección" value={formData.address} field="address" placeholder="Dirección" />
                        <View className="flex-row gap-3">
                            <View className="flex-1">
                                <InputField label="Ciudad" value={formData.city} field="city" placeholder="Ciudad" />
                            </View>
                            <View className="flex-1">
                                <InputField label="País" value={formData.country} field="country" placeholder="País" />
                            </View>
                        </View>
                        <InputField label="Teléfono" value={formData.phone} field="phone" placeholder="Teléfono" />
                        <InputField label="Sitio Web" value={formData.website} field="website" placeholder="URL Web" />
                        <InputField label="Notas" value={formData.notes} field="notes" placeholder="Notas..." multiline />

                        <View className="gap-3 mt-6">
                            <Pressable
                                onPress={handleUpdate}
                                disabled={isSubmitting}
                                className={`p-4 rounded-xl items-center justify-center shadow-lg ${isSubmitting || !formData.name ? 'bg-muted' : 'bg-primary'}`}
                            >
                                {isSubmitting ? <ActivityIndicator color="#fff" /> : <Text className="text-white font-bold text-lg uppercase tracking-wider">Guardar</Text>}
                            </Pressable>

                            <Pressable onPress={handleDelete} className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl items-center mt-2">
                                <Text className="text-red-500 font-bold uppercase tracking-wider">Eliminar</Text>
                            </Pressable>
                        </View>
                    </>
                ) : (
                    <View className="gap-2">
                        <View className="flex-row gap-4">
                            <View className="flex-1">
                                <DetailItem label="Ciudad" value={dealership.city} icon="building.2.fill" />
                            </View>
                            <View className="flex-1">
                                <DetailItem label="País" value={dealership.country} icon="globe" />
                            </View>
                        </View>

                        <DetailItem label="Dirección" value={dealership.address} icon="mappin.and.ellipse" />

                        <View className="flex-row gap-4">
                            <View className="flex-1">
                                <DetailItem label="Teléfono" value={dealership.phone} icon="phone.fill" />
                            </View>
                        </View>

                        <DetailItem label="Web" value={dealership.website} icon="link" />

                        {dealership.notes && (
                            <View className="mb-4 bg-surface p-4 rounded-xl border border-border mt-2">
                                <View className="flex-row items-center mb-2">
                                    <IconSymbol name="note.text" size={16} color={colors.primary} />
                                    <Text className="text-xs font-bold text-primary uppercase ml-2">Notas</Text>
                                </View>
                                <Text className="text-foreground text-base leading-relaxed">{dealership.notes}</Text>
                            </View>
                        )}
                    </View>
                )}
            </ScrollView>
        </ScreenContainer>
    );
}
