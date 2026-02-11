import { ScrollView, Text, View, TextInput, Pressable, FlatList } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useState } from "react";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";

interface Company {
  id: string;
  name: string;
  country: string;
  type: string;
  city: string;
}

// Mock data for demonstration
const mockCompanies: Company[] = [
  { id: "1", name: "BMW Group", country: "Alemania", type: "Concesionario", city: "Munich" },
  { id: "2", name: "Mercedes-Benz", country: "Alemania", type: "Concesionario", city: "Stuttgart" },
  { id: "3", name: "Tesla Deutschland", country: "Alemania", type: "Distribuidor EV", city: "Berlin" },
  { id: "4", name: "Renault", country: "Francia", type: "Concesionario", city: "Paris" },
  { id: "5", name: "Peugeot", country: "Francia", type: "Concesionario", city: "Lyon" },
  { id: "6", name: "Nissan España", country: "España", type: "Distribuidor EV", city: "Madrid" },
  { id: "7", name: "Seat", country: "España", type: "Concesionario", city: "Barcelona" },
  { id: "8", name: "Fiat Italia", country: "Italia", type: "Concesionario", city: "Milan" },
  { id: "9", name: "Lamborghini", country: "Italia", type: "Concesionario", city: "Bologna" },
  { id: "10", name: "DAF Trucks", country: "Países Bajos", type: "Empresa de Movilidad", city: "Amsterdam" },
];

const countries = ["Todos", "Alemania", "Francia", "España", "Italia", "Países Bajos"];
const types = ["Todos", "Concesionario", "Distribuidor EV", "Empresa de Movilidad"];

export default function SearchScreen() {
  const router = useRouter();
  const colors = useColors();
  const [searchText, setSearchText] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("Todos");
  const [selectedType, setSelectedType] = useState("Todos");
  const [filteredCompanies, setFilteredCompanies] = useState(mockCompanies);

  const handleSearch = (text: string) => {
    setSearchText(text);
    filterCompanies(text, selectedCountry, selectedType);
  };

  const handleCountryFilter = (country: string) => {
    setSelectedCountry(country);
    filterCompanies(searchText, country, selectedType);
  };

  const handleTypeFilter = (type: string) => {
    setSelectedType(type);
    filterCompanies(searchText, selectedCountry, type);
  };

  const filterCompanies = (search: string, country: string, type: string) => {
    let filtered = mockCompanies;

    if (search) {
      filtered = filtered.filter((c) =>
        c.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (country !== "Todos") {
      filtered = filtered.filter((c) => c.country === country);
    }

    if (type !== "Todos") {
      filtered = filtered.filter((c) => c.type === type);
    }

    setFilteredCompanies(filtered);
  };

  const handleSelectCompany = async (company: Company) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({
      pathname: "/(tabs)/analysis",
      params: {
        companyId: company.id,
        companyName: company.name,
        country: company.country,
        type: company.type,
      },
    });
  };

  return (
    <ScreenContainer className="p-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View className="gap-4">
          {/* Header */}
          <View className="gap-2 mb-2">
            <Text className="text-2xl font-bold text-foreground">Buscar Empresas</Text>
            <Text className="text-sm text-muted">Encuentra tu empresa objetivo</Text>
          </View>

          {/* Search Input */}
          <View className="flex-row items-center bg-surface border border-border rounded-xl px-4 py-3 gap-2">
            <IconSymbol name="chevron.right" size={18} color={colors.muted} />
            <TextInput
              placeholder="Buscar por nombre..."
              placeholderTextColor={colors.muted}
              value={searchText}
              onChangeText={handleSearch}
              className="flex-1 text-foreground"
            />
          </View>

          {/* Country Filter */}
          <View className="gap-2">
            <Text className="text-sm font-semibold text-foreground">País</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="gap-2">
              <View className="flex-row gap-2">
                {countries.map((country) => (
                  <Pressable
                    key={country}
                    onPress={() => handleCountryFilter(country)}
                    style={({ pressed }) => ({
                      backgroundColor:
                        selectedCountry === country ? colors.primary : colors.surface,
                      opacity: pressed ? 0.8 : 1,
                    })}
                    className="px-4 py-2 rounded-full border border-border"
                  >
                    <Text
                      className={`text-sm font-medium ${
                        selectedCountry === country
                          ? "text-white"
                          : "text-foreground"
                      }`}
                    >
                      {country}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Type Filter */}
          <View className="gap-2">
            <Text className="text-sm font-semibold text-foreground">Tipo</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="gap-2">
              <View className="flex-row gap-2">
                {types.map((type) => (
                  <Pressable
                    key={type}
                    onPress={() => handleTypeFilter(type)}
                    style={({ pressed }) => ({
                      backgroundColor:
                        selectedType === type ? colors.primary : colors.surface,
                      opacity: pressed ? 0.8 : 1,
                    })}
                    className="px-4 py-2 rounded-full border border-border"
                  >
                    <Text
                      className={`text-sm font-medium ${
                        selectedType === type ? "text-white" : "text-foreground"
                      }`}
                    >
                      {type}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Results */}
          <View className="gap-2">
            <Text className="text-sm font-semibold text-foreground">
              {filteredCompanies.length} resultados
            </Text>

            <FlatList
              data={filteredCompanies}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => handleSelectCompany(item)}
                  style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
                  className="bg-surface rounded-xl p-4 border border-border mb-3"
                >
                  <View className="flex-row items-start justify-between">
                    <View className="flex-1">
                      <Text className="text-base font-semibold text-foreground">
                        {item.name}
                      </Text>
                      <Text className="text-xs text-muted mt-1">
                        {item.type} • {item.city}
                      </Text>
                    </View>
                    <View className="bg-primary/10 px-3 py-1 rounded-full">
                      <Text className="text-xs font-medium text-primary">
                        {item.country}
                      </Text>
                    </View>
                  </View>
                </Pressable>
              )}
            />

            {filteredCompanies.length === 0 && (
              <View className="items-center py-8">
                <Text className="text-sm text-muted">No se encontraron empresas</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
