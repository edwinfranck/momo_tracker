import Colors from "@/constants/colors";
import { useOnboarding } from "@/contexts/OnboardingContext";
import {
    Smartphone,
    TrendingUp,
    Lock,
    CheckCircle,
} from "lucide-react-native";
import React, { useRef, useState } from "react";
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

const slides: OnboardingSlide[] = [
    {
        id: "1",
        icon: <Smartphone size={80} color={Colors.light.tint} />,
        title: "Bienvenue sur MTN MoMo Tracker",
        description:
            "Suivez et gérez vos transactions Mobile Money facilement. Toutes vos données restent privées et sont stockées localement sur votre appareil.",
        color: Colors.light.tint,
    },
    {
        id: "2",
        icon: <TrendingUp size={80} color={Colors.light.income} />,
        title: "Analysez vos finances",
        description:
            "Visualisez vos dépenses et revenus avec des statistiques détaillées. Filtrez par période, montant ou type de transaction pour mieux comprendre vos habitudes financières.",
        color: Colors.light.income,
    },
    {
        id: "3",
        icon: <Lock size={80} color={Colors.light.warning} />,
        title: "Sécurité & Confidentialité",
        description:
            "Protégez vos données avec l'authentification biométrique ou code PIN. Masquez les montants pour plus de confidentialité. Vos SMS ne quittent jamais votre appareil.",
        color: Colors.light.warning,
    },
    {
        id: "4",
        icon: <CheckCircle size={80} color={Colors.light.success} />,
        title: "Tout est prêt !",
        description:
            "Synchronisez vos SMS MTN MoMo pour commencer. L'application lira uniquement les notifications de MTN Mobile Money, rien d'autre.",
        color: Colors.light.success,
    },
];

export default function OnboardingScreen() {
    const { completeOnboarding } = useOnboarding();
    const [currentIndex, setCurrentIndex] = useState(0);
    const flatListRef = useRef<FlatList>(null);

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
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.description}>{item.description}</Text>
        </View>
    );

    const renderDot = (index: number) => (
        <View
            key={index}
            style={[
                styles.dot,
                index === currentIndex && styles.activeDot,
                index === currentIndex && { backgroundColor: slides[currentIndex].color },
            ]}
        />
    );

    return (
        <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
            <View style={styles.header}>
                {currentIndex < slides.length - 1 && (
                    <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
                        <Text style={styles.skipText}>Passer</Text>
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
                    <Text style={styles.nextButtonText}>
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
        backgroundColor: Colors.light.background,
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
        color: Colors.light.textSecondary,
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
        color: Colors.light.text,
        textAlign: "center",
        marginBottom: 16,
    },
    description: {
        fontSize: 16,
        lineHeight: 26,
        color: Colors.light.textSecondary,
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
        backgroundColor: Colors.light.border,
    },
    activeDot: {
        width: 24,
    },
    nextButton: {
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: "center",
    },
    nextButtonText: {
        fontSize: 16,
        fontWeight: "600" as const,
        color: Colors.light.cardBackground,
    },
});
