import { useTheme } from "@/contexts/ThemeContext";
import { useNotifications } from "@/contexts/NotificationsContext";
import { Stack, useRouter } from "expo-router";
import { Bell, Trash2, Check, CheckCheck } from "lucide-react-native";
import React from "react";
import {
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function NotificationsScreen() {
    const { colors } = useTheme();
    const router = useRouter();
    const {
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAll,
    } = useNotifications();

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case "transaction":
                return "💰";
            case "sync":
                return "🔄";
            case "system":
                return "ℹ️";
            default:
                return "🔔";
        }
    };

    const formatTimestamp = (date: Date) => {
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return "À l'instant";
        if (minutes < 60) return `Il y a ${minutes} min`;
        if (hours < 24) return `Il y a ${hours}h`;
        if (days < 7) return `Il y a ${days}j`;

        return new Intl.DateTimeFormat("fr-FR", {
            day: "numeric",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
        }).format(date);
    };

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={["bottom"]}>
            <Stack.Screen
                options={{
                    headerShown: true,
                    title: "Notifications",
                    headerStyle: {
                        backgroundColor: colors.cardBackground,
                    },
                    headerTintColor: colors.text,
                    headerShadowVisible: false,
                    headerRight: () =>
                        notifications.length > 0 ? (
                            <TouchableOpacity
                                onPress={markAllAsRead}
                                style={styles.headerButton}
                            >
                                <CheckCheck size={20} color={colors.tint} />
                            </TouchableOpacity>
                        ) : null,
                }}
            />

            {notifications.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Bell size={64} color={colors.border} />
                    <Text style={[styles.emptyTitle, { color: colors.text }]}>Aucune notification</Text>
                    <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                        Vous recevrez une notification ici à chaque nouvelle transaction
                        détectée.
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={notifications}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContainer}
                    ItemSeparatorComponent={() => <View style={styles.separator} />}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={[
                                styles.notificationCard,
                                { backgroundColor: colors.cardBackground, borderColor: colors.border },
                                !item.read && { backgroundColor: `${colors.tint}08`, borderColor: colors.tint },
                            ]}
                            onPress={() => {
                                markAsRead(item.id);
                                if (item.transactionId && item.transaction) {
                                    router.push(`/transaction/${item.transactionId}` as any);
                                }
                            }}
                            activeOpacity={0.7}
                        >
                            <View style={styles.notificationHeader}>
                                <View style={styles.notificationTitleRow}>
                                    <Text style={styles.notificationIcon}>
                                        {getNotificationIcon(item.type)}
                                    </Text>
                                    <Text
                                        style={[
                                            styles.notificationTitle,
                                            { color: colors.text },
                                            !item.read && styles.notificationTitleUnread,
                                        ]}
                                    >
                                        {item.title}
                                    </Text>
                                    {!item.read && <View style={[styles.unreadBadge, { backgroundColor: colors.tint }]} />}
                                </View>
                                <TouchableOpacity
                                    onPress={() => deleteNotification(item.id)}
                                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                >
                                    <Trash2 size={16} color={colors.textSecondary} />
                                </TouchableOpacity>
                            </View>

                            <Text style={[styles.notificationMessage, { color: colors.textSecondary }]}>{item.message}</Text>

                            <Text style={[styles.notificationTime, { color: colors.textSecondary }]}>
                                {formatTimestamp(item.timestamp)}
                            </Text>
                        </TouchableOpacity>
                    )}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    headerButton: {
        marginRight: 16,
        padding: 8,
    },
    listContainer: {
        padding: 16,
    },
    separator: {
        height: 12,
    },
    notificationCard: {
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
    },
    notificationHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 8,
    },
    notificationTitleRow: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
        gap: 8,
    },
    notificationIcon: {
        fontSize: 20,
    },
    notificationTitle: {
        fontSize: 16,
        fontWeight: "600",
        flex: 1,
    },
    notificationTitleUnread: {
        fontWeight: "700",
    },
    unreadBadge: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    notificationMessage: {
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 8,
    },
    notificationTime: {
        fontSize: 12,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 32,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: "700",
        marginTop: 16,
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 14,
        textAlign: "center",
        lineHeight: 20,
    },
});
