import Colors from "@/constants/colors";
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
        <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
            <Stack.Screen
                options={{
                    headerShown: true,
                    title: "Notifications",
                    headerStyle: {
                        backgroundColor: Colors.light.cardBackground,
                    },
                    headerShadowVisible: false,
                    headerRight: () =>
                        notifications.length > 0 ? (
                            <TouchableOpacity
                                onPress={markAllAsRead}
                                style={styles.headerButton}
                            >
                                <CheckCheck size={20} color={Colors.light.tint} />
                            </TouchableOpacity>
                        ) : null,
                }}
            />

            {notifications.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Bell size={64} color={Colors.light.border} />
                    <Text style={styles.emptyTitle}>Aucune notification</Text>
                    <Text style={styles.emptyText}>
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
                                !item.read && styles.notificationCardUnread,
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
                                            !item.read && styles.notificationTitleUnread,
                                        ]}
                                    >
                                        {item.title}
                                    </Text>
                                    {!item.read && <View style={styles.unreadBadge} />}
                                </View>
                                <TouchableOpacity
                                    onPress={() => deleteNotification(item.id)}
                                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                >
                                    <Trash2 size={16} color={Colors.light.textSecondary} />
                                </TouchableOpacity>
                            </View>

                            <Text style={styles.notificationMessage}>{item.message}</Text>

                            <Text style={styles.notificationTime}>
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
        backgroundColor: Colors.light.cardBackground,
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
        backgroundColor: Colors.light.cardBackground,
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: Colors.light.border,
    },
    notificationCardUnread: {
        backgroundColor: `${Colors.light.tint}08`,
        borderColor: Colors.light.tint,
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
        color: Colors.light.text,
        flex: 1,
    },
    notificationTitleUnread: {
        fontWeight: "700",
    },
    unreadBadge: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: Colors.light.tint,
    },
    notificationMessage: {
        fontSize: 14,
        color: Colors.light.textSecondary,
        lineHeight: 20,
        marginBottom: 8,
    },
    notificationTime: {
        fontSize: 12,
        color: Colors.light.textSecondary,
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
        color: Colors.light.text,
        marginTop: 16,
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 14,
        color: Colors.light.textSecondary,
        textAlign: "center",
        lineHeight: 20,
    },
});
