import AsyncStorage from "@react-native-async-storage/async-storage";
import createContextHook from "@nkzw/create-context-hook";
import { useEffect, useState } from "react";

const ONBOARDING_COMPLETED_KEY = "@onboarding_completed";
const TERMS_ACCEPTED_KEY = "@terms_accepted";
const PERMISSIONS_REQUESTED_KEY = "@permissions_requested";

export const [OnboardingProvider, useOnboarding] = createContextHook(() => {
    const [isOnboardingCompleted, setIsOnboardingCompleted] = useState<boolean | null>(null);
    const [areTermsAccepted, setAreTermsAccepted] = useState<boolean | null>(null);
    const [arePermissionsRequested, setArePermissionsRequested] = useState<boolean | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadOnboardingStatus();
    }, []);

    const loadOnboardingStatus = async () => {
        try {
            const [onboardingStatus, termsStatus, permissionsStatus] = await Promise.all([
                AsyncStorage.getItem(ONBOARDING_COMPLETED_KEY),
                AsyncStorage.getItem(TERMS_ACCEPTED_KEY),
                AsyncStorage.getItem(PERMISSIONS_REQUESTED_KEY),
            ]);

            setIsOnboardingCompleted(onboardingStatus === "true");
            setAreTermsAccepted(termsStatus === "true");
            setArePermissionsRequested(permissionsStatus === "true");
        } catch (error) {
            console.error("Error loading onboarding status:", error);
            // Default to not completed on error
            setIsOnboardingCompleted(false);
            setAreTermsAccepted(false);
            setArePermissionsRequested(false);
        } finally {
            setIsLoading(false);
        }
    };

    const acceptTerms = async () => {
        try {
            await AsyncStorage.setItem(TERMS_ACCEPTED_KEY, "true");
            setAreTermsAccepted(true);
        } catch (error) {
            console.error("Error accepting terms:", error);
        }
    };

    const completeOnboarding = async () => {
        try {
            await AsyncStorage.setItem(ONBOARDING_COMPLETED_KEY, "true");
            setIsOnboardingCompleted(true);
        } catch (error) {
            console.error("Error completing onboarding:", error);
        }
    };

    const markPermissionsRequested = async () => {
        try {
            await AsyncStorage.setItem(PERMISSIONS_REQUESTED_KEY, "true");
            setArePermissionsRequested(true);
        } catch (error) {
            console.error("Error marking permissions as requested:", error);
        }
    };

    const resetOnboarding = async () => {
        try {
            await AsyncStorage.multiRemove([
                ONBOARDING_COMPLETED_KEY,
                TERMS_ACCEPTED_KEY,
                PERMISSIONS_REQUESTED_KEY
            ]);
            setIsOnboardingCompleted(false);
            setAreTermsAccepted(false);
            setArePermissionsRequested(false);
        } catch (error) {
            console.error("Error resetting onboarding:", error);
        }
    };

    return {
        isOnboardingCompleted,
        areTermsAccepted,
        arePermissionsRequested,
        isLoading,
        acceptTerms,
        completeOnboarding,
        markPermissionsRequested,
        resetOnboarding,
    };
});
