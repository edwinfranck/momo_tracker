import { useTheme } from "@/contexts/ThemeContext";
import { useOnboarding } from "@/contexts/OnboardingContext";
import {
    Smartphone,
    TrendingUp,
    Lock,
    CheckCircle,
} from "lucide-react-native";
import React, { useRef, useState, useMemo } from "react";
import {
    Dimensions,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

interface OnboardingSlide {
    id: string;
    icon: React.ReactNode;
    title: string;
    description: string;
    color: string;
}

export default function OnboardingScreen() {
    const { colors } = useTheme();
    const { completeOnboarding } = useOnboarding();
    const [currentIndex, setCurrentIndex] = useState(0);
    const flatListRef = useRef<FlatList>(null);

    const slides: OnboardingSlide[] = useMemo(() => 
[
  {
    id: "1",
    icon: <Smartphone size={80} color={colors.tint} />,
    title: "Bienvenue dans ton DJAI Money Tracker",
    description:
      "Gère tes mouvements Mobile Money sans galère. Toutes tes données restent dans ton phone, y’a rien qui sort.",
    color: colors.tint,
  },
  {
    id: "2",
    icon: <TrendingUp size={80} color={colors.income} />,
    title: "Check ton Djai",
    description:
      "Vois comment tu dépenses et comment l'argent rentre. Tu peux filtrer par date, montant ou type de transaction pour mieux contrôler ton djai.",
    color: colors.income,
  },
  {
    id: "3",
    icon: <Lock size={80} color={colors.warning} />,
    title: "Sécurité béton",
    description:
      "Active ton empreinte ou ton code PIN pour verrouiller ton app. Tu peux cacher ton djai aussi. Tes SMS ne quittent jamais ton phone.",
    color: colors.warning,
  },
  {
    id: "4",
    icon: <CheckCircle size={80} color={colors.success} />,
    title: "C'est bon tu es chaud !",
    description:
      "Synchronise tes SMS MTN MoMo et on démarre. L'app lit seulement les messages Mobile Money, rien d'autre.",
    color: colors.success,
  },
],

    [colors]);

    const handleNext = () => {
        if (currentIndex < slides.length - 1) {
            const nextIndex = currentIndex + 1;
            flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
            setCurrentIndex(nextIndex);
        } else {
            completeOnboarding();
        }
    };

    const handleSkip = () => {
        completeOnboarding();
    };

    const renderSlide = ({ item }: { item: OnboardingSlide }) => (
        <View style={styles.slide}>
            <View style={[styles.iconContainer, { backgroundColor: `${item.color}15` }]}>
                {item.icon}
            </View>
            <Text style={[styles.title, { color: colors.text }]}>{item.title}</Text>
            <Text style={[styles.description, { color: colors.textSecondary }]}>{item.description}</Text>
        </View>
    );

    const renderDot = (index: number) => (
        <View
            key={index}
            style={[
                styles.dot,
                { backgroundColor: colors.border },
                index === currentIndex && styles.activeDot,
                index === currentIndex && { backgroundColor: slides[currentIndex].color },
            ]}
        />
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top", "bottom"]}>
            <View style={styles.header}>
                {currentIndex < slides.length - 1 && (
                    <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
                        <Text style={[styles.skipText, { color: colors.textSecondary }]}>Passer</Text>
                    </TouchableOpacity>
                )}
            </View>

            <FlatList
                ref={flatListRef}
                data={slides}
                renderItem={renderSlide}
                keyExtractor={(item) => item.id}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                scrollEnabled={true}
                onMomentumScrollEnd={(event) => {
                    const newIndex = Math.round(
                        event.nativeEvent.contentOffset.x / width
                    );
                    setCurrentIndex(newIndex);
                }}
            />

            <View style={styles.footer}>
                <View style={styles.pagination}>
                    {slides.map((_, index) => renderDot(index))}
                </View>

                <TouchableOpacity
                    style={[
                        styles.nextButton,
                        { backgroundColor: slides[currentIndex].color },
                    ]}
                    onPress={handleNext}
                >
                    <Text style={[styles.nextButtonText, { color: colors.cardBackground }]}>
                        {currentIndex === slides.length - 1 ? "Commencer" : "Suivant"}
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: "row",
        justifyContent: "flex-end",
        paddingHorizontal: 24,
        paddingVertical: 16,
    },
    skipButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
    },
    skipText: {
        fontSize: 16,
        fontWeight: "600" as const,
    },
    slide: {
        width,
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 40,
    },
    iconContainer: {
        width: 160,
        height: 160,
        borderRadius: 80,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 40,
    },
    title: {
        fontSize: 28,
        fontWeight: "700" as const,
        textAlign: "center",
        marginBottom: 16,
    },
    description: {
        fontSize: 16,
        lineHeight: 26,
        textAlign: "center",
    },
    footer: {
        paddingHorizontal: 24,
        paddingBottom: 32,
    },
    pagination: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 32,
        gap: 8,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    activeDot: {
        width: 24,
    },
    nextButton: {
        paddingVertical: 16,
        borderRadius: 8,
        alignItems: "center",
    },
    nextButtonText: {
        fontSize: 16,
        fontWeight: "600" as const,
    },
});
