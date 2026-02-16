import { View, Text, TextInput, Pressable, ScrollView, Alert, ActivityIndicator } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useRouter } from "expo-router";
import { useState } from "react";
import { trpc } from "@/lib/trpc";

export default function AddDealershipScreen() {
    const colors = useColors();
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form state
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

    const utils = trpc.useUtils();
    const createMutation = trpc.dealerships.create.useMutation({
        onSuccess: () => {
            utils.dealerships.list.invalidate();
            Alert.alert("Éxito", "Concesionario creado correctamente", [
                { text: "OK", onPress: () => router.back() }
            ]);
        },
        onError: (error) => {
            Alert.alert("Error", error.message || "No se pudo crear el concesionario");
        }
    });

    const handleSubmit = async () => {
        if (!formData.name.trim()) {
            Alert.alert("Error", "El nombre es obligatorio");
            return;
        }

        try {
            setIsSubmitting(true);
            await createMutation.mutateAsync(formData);
        } catch (error) {
            // Error handled in onError
        } finally {
            setIsSubmitting(false);
        }
    };

    const InputField = ({ label, value, field, placeholder, multiline = false }: any) => (
        <View className="mb-4">
            <Text className="text-xs font-bold text-muted uppercase mb-2 ml-1">{label}</Text>
            <TextInput
                className={`bg-surface text-foreground border border-border rounded-xl p-3 ${multiline ? 'h-24 text-top' : 'h-12'}`}
                placeholder={placeholder}
                placeholderTextColor={colors.muted}
                value={value}
                onChangeText={(text) => setFormData(prev => ({ ...prev, [field]: text }))}
                multiline={multiline}
                textAlignVertical={multiline ? "top" : "center"}
            />
        </View>
    );

    return (
        <ScreenContainer className="flex-1">
            <View className="px-4 py-3 border-b border-border flex-row items-center justify-between bg-surface">
                <Pressable onPress={() => router.back()} className="p-2 -ml-2 rounded-full active:bg-muted/10">
                    <IconSymbol name="chevron.left" size={24} color={colors.primary} />
                </Pressable>
                <Text className="text-lg font-bold text-foreground text-center uppercase tracking-wider">Nuevo Concesionario</Text>
                <View className="w-10" />
            </View>

            <ScrollView contentContainerStyle={{ padding: 20 }}>
                <View className="bg-surface/30 p-4 rounded-xl border border-border mb-6">
                    <Text className="text-sm text-muted mb-2">Información Principal</Text>
                    <InputField label="Nombre *" value={formData.name} field="name" placeholder="Ej. Auto Madrid Central" />

                    <View className="mb-2">
                        <Text className="text-xs font-bold text-muted uppercase mb-2 ml-1">Estado Inicial</Text>
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
                </View>

                <InputField label="Dirección" value={formData.address} field="address" placeholder="Calle Principal 123" />

                <View className="flex-row gap-3">
                    <View className="flex-1">
                        <InputField label="Ciudad" value={formData.city} field="city" placeholder="Madrid" />
                    </View>
                    <View className="flex-1">
                        <InputField label="País" value={formData.country} field="country" placeholder="España" />
                    </View>
                </View>

                <InputField label="Teléfono" value={formData.phone} field="phone" placeholder="+34 600 000 000" />
                <InputField label="Sitio Web" value={formData.website} field="website" placeholder="https://..." />

                <InputField label="Notas" value={formData.notes} field="notes" placeholder="Información adicional..." multiline />

                <Pressable
                    onPress={handleSubmit}
                    disabled={isSubmitting}
                    className={`mt-4 p-4 rounded-xl items-center justify-center shadow-lg ${isSubmitting || !formData.name ? 'bg-muted' : 'bg-primary'}`}
                >
                    {isSubmitting ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text className="text-white font-bold text-lg uppercase tracking-wider">Crear Concesionario</Text>
                    )}
                </Pressable>
            </ScrollView>
        </ScreenContainer>
    );
}
