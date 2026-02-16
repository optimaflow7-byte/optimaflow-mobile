import { useState } from "react";
import { View, Text, TextInput, Pressable, ScrollView, Alert, ActivityIndicator } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import { useRouter } from "expo-router";

export default function ImportLeadsScreen() {
    const colors = useColors();
    const router = useRouter();
    const [jsonInput, setJsonInput] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);
    const [lastResult, setLastResult] = useState<{ success: boolean; count?: number; error?: string } | null>(null);

    const importMutation = trpc.importNotebookLeads.useMutation({
        onSuccess: (data) => {
            setLastResult({ success: true, count: data.count });
            Alert.alert("Éxito", `Se han importado ${data.count} leads correctamente.`);
            setJsonInput(""); // Clear input on success
        },
        onError: (error) => {
            setLastResult({ success: false, error: error.message });
            Alert.alert("Error", "No se pudieron importar los datos. Verifica el formato JSON.");
        }
    });

    const handleImport = async () => {
        if (!jsonInput.trim()) {
            Alert.alert("Error", "Por favor pega el JSON generado por NotebookLM.");
            return;
        }

        try {
            setIsProcessing(true);
            const parsedData = JSON.parse(jsonInput);

            if (!Array.isArray(parsedData)) {
                throw new Error("El JSON debe ser una lista (array) de objetos.");
            }

            // Basic validation of structure could go here, but Zod on backend handles it strictly
            await importMutation.mutateAsync({
                userId: 1, // TODO: Get from auth context
                leads: parsedData
            });

        } catch (e: any) {
            Alert.alert("JSON Inválido", "El texto introducido no es un JSON válido. Revisa el formato.");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <ScreenContainer className="flex-1 p-4">
            <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
                <View className="flex-row items-center mb-6 mt-2">
                    <Pressable onPress={() => router.back()} className="mr-3">
                        <IconSymbol name="chevron.left" size={24} color={colors.primary} />
                    </Pressable>
                    <Text className="text-xl font-bold text-foreground">Importar Leads de IA</Text>
                </View>

                <View className="bg-surface p-4 rounded-xl border border-border mb-6">
                    <View className="flex-row items-center gap-3 mb-3">
                        <View className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center">
                            <IconSymbol name="sparkles" size={20} color={colors.primary} />
                        </View>
                        <View className="flex-1">
                            <Text className="font-semibold text-foreground">Instrucciones</Text>
                            <Text className="text-xs text-muted">
                                1. Pide a NotebookLM que genere la lista de leads en formato JSON.
                                2. Copia todo el bloque de código JSON.
                                3. Pégalo en el cuadro de abajo y pulsa Importar.
                            </Text>
                        </View>
                    </View>
                </View>

                <View className="mb-4">
                    <Text className="text-sm font-medium text-foreground mb-2">Pegar JSON de NotebookLM:</Text>
                    <TextInput
                        className="bg-surface text-foreground border border-border rounded-xl p-3 h-64 text-xs font-mono"
                        multiline
                        textAlignVertical="top"
                        placeholder='[
  {
    "companyName": "Ejemplo Motors",
    "country": "España",
    ...
  }
]'
                        placeholderTextColor={colors.muted}
                        value={jsonInput}
                        onChangeText={setJsonInput}
                        autoCapitalize="none"
                        autoCorrect={false}
                    />
                </View>

                <Pressable
                    onPress={handleImport}
                    disabled={isProcessing}
                    className={`flex-row items-center justify-center p-4 rounded-xl ${isProcessing ? 'bg-muted' : 'bg-primary'}`}
                >
                    {isProcessing ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <>
                            <IconSymbol name="arrow.down.doc.fill" size={20} color="#fff" />
                            <Text className="text-white font-bold ml-2">Importar Leads</Text>
                        </>
                    )}
                </Pressable>

                {lastResult?.success && (
                    <View className="mt-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl flex-row items-center">
                        <IconSymbol name="checkmark.circle.fill" size={20} color={colors.success} />
                        <Text className="ml-2 text-green-700 dark:text-green-400 font-medium">
                            ¡Importación completada! {lastResult.count} leads añadidos.
                        </Text>
                    </View>
                )}
            </ScrollView>
        </ScreenContainer>
    );
}
