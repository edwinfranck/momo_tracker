import TermsAndConditions from "@/components/TermsAndConditions";
import Colors from "@/constants/colors";
import { Stack } from "expo-router";
import React from "react";

export default function TermsScreen() {
    return (
        <>
            <Stack.Screen
                options={{
                    title: "Conditions d'Utilisation",
                    headerStyle: {
                        backgroundColor: Colors.light.cardBackground,
                    },
                    headerShadowVisible: false,
                    presentation: "modal",
                }}
            />
            <TermsAndConditions showAcceptButton={false} />
        </>
    );
}
