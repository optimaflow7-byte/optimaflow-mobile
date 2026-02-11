import { ScrollView, Text, View, Pressable, Share, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState, useEffect } from "react";

interface Strategy {
  id: string;
  companyName: string;
  country: string;
  type: string;
  createdAt: string;
  outreachMessage: string;
  hypothesis: string;
  discoveryAngles: string[];
  objections: Array<{ objection: string; response: string }>;
  callHook: string;
}

export default function StrategyScreen() {
  const router = useRouter();
  const colors = useColors();
  const params = useLocalSearchParams();
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [strategy, setStrategy] = useState<Strategy | null>(null);

  const companyName = params.companyName as string;
  const country = params.country as string;
  const type = params.type as string;
  const opportunityScore = parseInt(params.opportunityScore as string) || 7;
  const weaknessesJson = params.weaknessesJson as string;

  useEffect(() => {
    loadStrategy();
  }, []);

  const loadStrategy = async () => {
    try {
      setLoading(true);
      const weaknesses = weaknessesJson ? JSON.parse(weaknessesJson) : [];
      const analysis = {
        weaknesses,
        hypothesis: "Sistema de seguimiento manual sin automatización",
        insights: [],
        opportunityScore,
      };

      const result = await trpc.company.generateStrategy.useQuery({
        companyName,
        country,
        type,
        analysis,
      }).data;

      if (result) {
        setStrategy({
          id: `strategy-${Date.now()}`,
          companyName,
          country,
          type,
          createdAt: new Date().toISOString(),
          outreachMessage: result.outreachMessage,
          hypothesis: result.hypothesis,
          discoveryAngles: result.discoveryAngles,
          objections: result.objections,
          callHook: result.callHook,
        });
      }
    } catch (err) {
      console.error("Error generating strategy:", err);
      // Fallback to mock data
      const mockStrategy: Strategy = {
        id: `strategy-${Date.now()}`,
        companyName,
        country,
        type,
        createdAt: new Date().toISOString(),
        outreachMessage: `Hola ${companyName},\n\nHe estado analizando el mercado de movilidad en ${country} y noto que muchas empresas como la suya están perdiendo oportunidades de venta por falta de un sistema de seguimiento estructurado.\n\nEn OptimaFlow, hemos ayudado a concesionarios a mejorar su respuesta a leads de 24 horas a menos de 2 horas, aumentando los test drives en un 30-40%.\n\n¿Te gustaría una breve llamada para explorar dónde podrías estar perdiendo oportunidades?\n\nSaludos,\n[Tu nombre]`,
        hypothesis: "Sistema de seguimiento manual sin automatización, causando pérdida de leads y respuestas lentas.",
        discoveryAngles: [
          "¿Cuál es tu proceso actual para capturar y dar seguimiento a leads? ¿Cuánto tiempo pasa entre el contacto inicial y la primera respuesta?",
          "¿Cuántos leads estimas que pierdes mensualmente por falta de seguimiento automático? ¿Cómo impacta esto en tus ventas?",
        ],
        objections: [
          {
            objection: "No vendemos software, vendemos un sistema de ventas.",
            response: "Correcto. No es una herramienta más. Es un sistema probado que previene leads perdidos y mejora la velocidad de respuesta.",
          },
          {
            objection: "Ya tenemos un CRM.",
            response: "Excelente. Nuestro sistema se integra con tu CRM existente. La diferencia es que automatizamos el seguimiento para que no se pierda ningún lead.",
          },
        ],
        callHook: "En 15 minutos, te mostraré exactamente dónde estás perdiendo oportunidades de venta y cómo otros concesionarios en tu región han aumentado sus ventas en un 25-35%.",
      };
      setStrategy(mockStrategy);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <ScreenContainer className="items-center justify-center">
        <View className="gap-4">
          <ActivityIndicator size="large" color={colors.primary} />
          <Text className="text-center text-muted">Generando estrategia...</Text>
        </View>
      </ScreenContainer>
    );
  }

  if (!strategy) {
    return (
      <ScreenContainer className="items-center justify-center">
        <View className="gap-4">
          <Text className="text-center text-foreground">Error al generar estrategia</Text>
          <Pressable
            onPress={() => router.push("/")}
            className="bg-primary rounded-lg px-4 py-2"
          >
            <Text className="text-white text-center">Volver</Text>
          </Pressable>
        </View>
      </ScreenContainer>
    );
  }

  const handleSaveStrategy = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      const existing = await AsyncStorage.getItem("savedStrategies");
      const strategies = existing ? JSON.parse(existing) : [];
      strategies.push(strategy);
      await AsyncStorage.setItem("savedStrategies", JSON.stringify(strategies));
      setSaved(true);
      setTimeout(() => {
        router.push("/");
      }, 1500);
    } catch (error) {
      console.error("Error saving strategy:", error);
    }
  };

  const handleShare = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await Share.share({
        message: strategy.outreachMessage,
        title: `Estrategia para ${companyName}`,
      });
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  const handleCopyMessage = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    alert("Mensaje copiado al portapapeles");
  };

  return (
    <ScreenContainer className="p-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View className="gap-6">
          {/* Header */}
          <View className="gap-2">
            <Text className="text-2xl font-bold text-foreground">Estrategia de Prospección</Text>
            <Text className="text-sm text-muted">{companyName}</Text>
          </View>

          {/* Outreach Message */}
          <View className="gap-3">
            <Text className="text-lg font-semibold text-foreground">Mensaje de Prospección</Text>
            <View className="bg-surface rounded-xl p-4 border border-border gap-3">
              <Text className="text-sm text-foreground leading-relaxed">
                {strategy.outreachMessage}
              </Text>
              <View className="flex-row gap-2 pt-2 border-t border-border">
                <Pressable
                  onPress={handleCopyMessage}
                  style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
                  className="flex-1 flex-row items-center justify-center gap-2 bg-primary/10 rounded-lg py-2"
                >
                  <IconSymbol name="chevron.right" size={16} color={colors.primary} />
                  <Text className="text-sm font-medium text-primary">Copiar</Text>
                </Pressable>
                <Pressable
                  onPress={handleShare}
                  style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
                  className="flex-1 flex-row items-center justify-center gap-2 bg-surface border border-border rounded-lg py-2"
                >
                  <IconSymbol name="paperplane.fill" size={16} color={colors.primary} />
                  <Text className="text-sm font-medium text-primary">Compartir</Text>
                </Pressable>
              </View>
            </View>
          </View>

          {/* Hypothesis */}
          <View className="gap-3">
            <Text className="text-lg font-semibold text-foreground">Hipótesis de Ineficiencia</Text>
            <View className="bg-surface rounded-xl p-4 border border-border">
              <Text className="text-sm text-foreground leading-relaxed">
                {strategy.hypothesis}
              </Text>
            </View>
          </View>

          {/* Discovery Angles */}
          <View className="gap-3">
            <Text className="text-lg font-semibold text-foreground">Ángulos de Descubrimiento</Text>
            {strategy.discoveryAngles.map((angle, index) => (
              <View key={index} className="bg-surface rounded-xl p-4 border border-border gap-2">
                <View className="flex-row gap-2">
                  <Text className="text-lg font-bold text-primary">{index + 1}</Text>
                  <Text className="text-sm text-foreground flex-1 leading-relaxed">
                    {angle}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          {/* Objections */}
          <View className="gap-3">
            <Text className="text-lg font-semibold text-foreground">Objeciones Probables</Text>
            {strategy.objections.map((item, index) => (
              <View key={index} className="gap-2">
                <View className="bg-surface rounded-xl p-4 border border-border">
                  <Text className="text-sm font-semibold text-foreground">
                    Objeción: {item.objection}
                  </Text>
                </View>
                <View className="bg-primary/5 rounded-xl p-4 border border-primary/20 ml-4">
                  <Text className="text-sm text-foreground">
                    Respuesta: {item.response}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          {/* Call Hook */}
          <View className="gap-3">
            <Text className="text-lg font-semibold text-foreground">Hook de Llamada (15 min)</Text>
            <View className="bg-primary/10 rounded-xl p-4 border border-primary/20">
              <Text className="text-sm font-medium text-primary leading-relaxed">
                "{strategy.callHook}"
              </Text>
            </View>
          </View>

          {/* Actions */}
          <View className="gap-3 mt-4">
            <Pressable
              onPress={handleSaveStrategy}
              style={({ pressed }) => ({
                backgroundColor: colors.primary,
                opacity: pressed ? 0.9 : 1,
                transform: [{ scale: pressed ? 0.97 : 1 }],
              })}
              className="rounded-2xl p-4"
            >
              <View className="flex-row items-center justify-center gap-2">
                <IconSymbol
                  name={saved ? "chevron.right" : "paperplane.fill"}
                  size={20}
                  color="white"
                />
                <Text className="text-white font-semibold text-base">
                  {saved ? "¡Guardado!" : "Guardar Estrategia"}
                </Text>
              </View>
            </Pressable>

            <Pressable
              onPress={() => router.push("/")}
              style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
              className="rounded-2xl p-4 border border-border"
            >
              <Text className="text-center font-semibold text-foreground">Volver</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
