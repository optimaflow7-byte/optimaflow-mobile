import { View, Text, Switch, Pressable, ScrollView, Alert, Platform } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useState } from "react";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";

export default function SettingsScreen() {
    const colors = useColors();
    const { colorScheme, toggleColorScheme } = useColorScheme();
    const router = useRouter();

    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [marketingEmails, setMarketingEmails] = useState(false);
    const [locationEnabled, setLocationEnabled] = useState(true);

    // Mock user data - in prod retrieve from auth context
    const user = {
        name: "Carlos Rodriguez",
        email: "carlos.rodriguez@example.com",
        role: "Sales Manager",
        company: "AutoAlliance Group"
    };

    const handleToggleTheme = async () => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        toggleColorScheme();
    };

    const handleToggleNotifications = async (value: boolean) => {
        await Haptics.selectionAsync();
        setNotificationsEnabled(value);
    };

    const handleSignOut = () => {
        Alert.alert(
            "Cerrar Sesión",
            "¿Estás seguro que deseas cerrar sesión?",
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Cerrar Sesión",
                    style: "destructive",
                    onPress: () => {
                        // Implement actual logout logic here
                        console.log("User signed out");
                        // router.replace("/oauth/login"); // Example redirect
                    }
                }
            ]
        );
    };

    const SettingSection = ({ title, children }: { title: string, children: React.ReactNode }) => (
        <View className="gap-2 mb-6">
            <Text className="text-sm font-semibold text-muted px-2 uppercase tracking-wider">{title}</Text>
            <View className="bg-surface rounded-xl overflow-hidden border border-border">
                {children}
            </View>
        </View>
    );

    const SettingItem = ({
        icon,
        label,
        value,
        type = "arrow",
        onPress,
        isLast = false,
        color
    }: {
        icon: string,
        label: string,
        value?: string | boolean,
        type?: "arrow" | "switch" | "text",
        onPress?: () => void,
        isLast?: boolean,
        color?: string
    }) => {
        return (
            <Pressable
                onPress={type === "switch" ? undefined : onPress}
                style={({ pressed }) => ({
                    opacity: pressed && type !== "switch" ? 0.7 : 1,
                    backgroundColor: pressed && type !== "switch" ? colors.secondary : 'transparent'
                })}
                className={`flex-row items-center p-4 ${!isLast ? "border-b border-border" : ""}`}
            >
                <View className="w-8 items-center justify-center mr-3">
                    <IconSymbol name={icon as any} size={22} color={color || colors.foreground} />
                </View>

                <View className="flex-1">
                    <Text className={`text-base font-medium ${color ? "" : "text-foreground"}`} style={color ? { color } : {}}>
                        {label}
                    </Text>
                </View>

                {type === "arrow" && (
                    <IconSymbol name="chevron.right" size={18} color={colors.muted} />
                )}

                {type === "text" && value && (
                    <Text className="text-muted text-sm">{value}</Text>
                )}

                {type === "switch" && (
                    <Switch
                        value={value as boolean}
                        onValueChange={(val) => {
                            if (onPress) onPress();
                        }}
                        trackColor={{ false: colors.border, true: colors.primary }}
                        thumbColor={Platform.OS === 'ios' ? '#fff' : (value ? '#fff' : '#f4f3f4')}
                    />
                )}
            </Pressable>
        );
    };

    return (
        <ScreenContainer className="flex-1">
            <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>

                {/* Header */}
                <View className="mb-8 mt-2 items-center">
                    <View className="w-20 h-20 bg-primary/10 rounded-full items-center justify-center mb-3">
                        <Text className="text-2xl font-bold text-primary">
                            {user.name.split(' ').map(n => n[0]).join('')}
                        </Text>
                    </View>
                    <Text className="text-xl font-bold text-foreground">{user.name}</Text>
                    <Text className="text-muted">{user.email}</Text>
                    <View className="mt-2 text-xs bg-secondary/50 px-3 py-1 rounded-full">
                        <Text className="text-xs font-medium text-foreground">{user.role}</Text>
                    </View>
                </View>

                {/* Account Settings */}
                <SettingSection title="Cuenta">
                    <SettingItem icon="person.fill" label="Perfil Personal" onPress={() => { }} />
                    <SettingItem icon="building.2.fill" label="Empresa" value={user.company} type="text" onPress={() => { }} />
                    <SettingItem icon="lock.fill" label="Seguridad y Contraseña" isLast onPress={() => { }} />
                </SettingSection>

                {/* App Preferences */}
                <SettingSection title="Preferencias">
                    <SettingItem
                        icon={colorScheme === 'dark' ? "moon.fill" : "sun.max.fill"}
                        label="Modo Oscuro"
                        value={colorScheme === 'dark'}
                        type="switch"
                        onPress={handleToggleTheme}
                    />
                    <SettingItem
                        icon="bell.fill"
                        label="Notificaciones Push"
                        value={notificationsEnabled}
                        type="switch"
                        onPress={() => handleToggleNotifications(!notificationsEnabled)}
                    />
                    <SettingItem
                        icon="location.fill"
                        label="Servicios de Ubicación"
                        value={locationEnabled}
                        type="switch"
                        isLast
                        onPress={() => setLocationEnabled(!locationEnabled)}
                    />
                </SettingSection>

                {/* Support & Info */}
                <SettingSection title="Soporte">
                    <SettingItem icon="questionmark.circle.fill" label="Ayuda y Soporte" onPress={() => { }} />
                    <SettingItem icon="star.fill" label="Calificar Aplicación" onPress={() => { }} />
                    <SettingItem icon="doc.text.fill" label="Términos y Privacidad" onPress={() => { }} />
                    <SettingItem icon="info.circle.fill" label="Versión" value="1.0.0" type="text" isLast onPress={() => { }} />
                </SettingSection>

                {/* Danger Zone */}
                <View className="gap-2 mb-6">
                    <View className="bg-surface rounded-xl overflow-hidden border border-red-200 dark:border-red-900/30">
                        <SettingItem
                            icon="rectangle.portrait.and.arrow.right"
                            label="Cerrar Sesión"
                            color="#EF4444"
                            isLast
                            onPress={handleSignOut}
                        />
                    </View>
                </View>

                <View className="items-center mt-4 mb-8">
                    <Text className="text-xs text-muted">OptimaFlow Mobile App</Text>
                    <Text className="text-xs text-muted text-center mt-1">
                        © 2026 OptimaFlow Inc. Todos los derechos reservados.
                    </Text>
                </View>

            </ScrollView>
        </ScreenContainer>
    );
}
