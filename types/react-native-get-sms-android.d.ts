declare module 'react-native-get-sms-android' {
    export interface SMSFilter {
        box?: string;
        indexFrom?: number;
        maxCount?: number;
        minDate?: number;
        maxDate?: number;
    }

    export interface SMSMessage {
        _id: string;
        address: string;
        body: string;
        date: number;
        date_sent: number;
        read: number;
        type: number;
        thread_id: number;
    }

    const SmsAndroid: {
        list(
            filter: string,
            fail: (error: string) => void,
            success: (count: number, smsList: string) => void
        ): void;

        autoSend(
            phoneNumber: string,
            message: string,
            fail: (error: string) => void,
            success: () => void
        ): void;
    };

    export default SmsAndroid;
}
