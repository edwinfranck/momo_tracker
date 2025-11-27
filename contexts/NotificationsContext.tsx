import createContextHook from "@nkzw/create-context-hook";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { Transaction } from "@/types/transaction";

const STORAGE_KEY = "@mtn_momo_notifications_history";

export interface AppNotification {
    id: string;
    type: "transaction" | "sync" | "system";
    title: string;
    message: string;
    timestamp: Date;
    read: boolean;
    transactionId?: string;
    transaction?: Transaction;
}

async function loadNotifications(): Promise<AppNotification[]> {
    try {
        const data = await AsyncStorage.getItem(STORAGE_KEY);
        if (data) {
            const parsed = JSON.parse(data);
            return parsed.map((n: any) => ({
                ...n,
                timestamp: new Date(n.timestamp),
            }));
        }
        return [];
    } catch (error) {
        console.error("Error loading notifications:", error);
        return [];
    }
}

async function saveNotifications(notifications: AppNotification[]): Promise<void> {
    try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
    } catch (error) {
        console.error("Error saving notifications:", error);
    }
}

export const [NotificationsProvider, useNotifications] = createContextHook(() => {
    const [notifications, setNotifications] = useState<AppNotification[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Charger les notifications au démarrage
    useEffect(() => {
        loadNotifications().then((loaded) => {
            setNotifications(loaded);
            setIsLoading(false);
        });
    }, []);

    const addNotification = (notification: Omit<AppNotification, "id" | "timestamp" | "read">) => {
        const newNotification: AppNotification = {
            ...notification,
            id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date(),
            read: false,
        };

        const updated = [newNotification, ...notifications];
        setNotifications(updated);
        saveNotifications(updated);
    };

    const markAsRead = (id: string) => {
        const updated = notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
        );
        setNotifications(updated);
        saveNotifications(updated);
    };

    const markAllAsRead = () => {
        const updated = notifications.map((n) => ({ ...n, read: true }));
        setNotifications(updated);
        saveNotifications(updated);
    };

    const deleteNotification = (id: string) => {
        const updated = notifications.filter((n) => n.id !== id);
        setNotifications(updated);
        saveNotifications(updated);
    };

    const clearAll = () => {
        setNotifications([]);
        saveNotifications([]);
    };

    const unreadCount = notifications.filter((n) => !n.read).length;

    return {
        notifications,
        unreadCount,
        isLoading,
        addNotification,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAll,
    };
});
