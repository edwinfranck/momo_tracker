import TermsAndConditions from "@/components/TermsAndConditions";
import { useTheme } from "@/contexts/ThemeContext";
import { Stack } from "expo-router";
import React from "react";

export default function TermsScreen() {
    const { colors } = useTheme();

    return (
        <>
            <Stack.Screen
                options={{
                    title: "Conditions d'Utilisation",
                    headerStyle: {
                        backgroundColor: colors.cardBackground,
                    },
                    headerTintColor: colors.text,
                    headerShadowVisible: false,
                    presentation: "modal",
                }}
            />
            <TermsAndConditions showAcceptButton={false} />
        </>
    );
}
