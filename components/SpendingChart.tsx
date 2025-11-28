import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import { useTheme } from '@/contexts/ThemeContext';
import { Transaction } from '@/types/transaction';
import { useSecurity } from '@/contexts/SecurityContext';

interface SpendingChartProps {
    transactions: Transaction[];
}

type ChartPeriod = 'week' | 'month';

export default function SpendingChart({ transactions }: SpendingChartProps) {
    const { colors } = useTheme();
    const { hideAmounts, formatAmount } = useSecurity();
    const [period, setPeriod] = useState<ChartPeriod>('week');
    const screenWidth = Dimensions.get('window').width;

    const chartData = useMemo(() => {
        const now = new Date();
        const data: { value: number; label: string; frontColor: string; topLabelComponent?: () => any }[] = [];

        if (period === 'week') {
            // 7 derniers jours
            for (let i = 6; i >= 0; i--) {
                const d = new Date(now);
                d.setDate(d.getDate() - i);
                const dateStr = d.toISOString().split('T')[0];
                const dayLabel = d.toLocaleDateString('fr-FR', { weekday: 'short' }).charAt(0).toUpperCase();

                // Filtrer les dépenses de ce jour
                const dayExpenses = transactions
                    .filter(t => {
                        const tDate = new Date(t.date).toISOString().split('T')[0];
                        const isExpense = ['transfer_sent', 'payment', 'withdrawal', 'uemoa_sent'].includes(t.type);
                        return tDate === dateStr && isExpense;
                    })
                    .reduce((sum, t) => sum + t.amount, 0);

                data.push({
                    value: dayExpenses,
                    label: dayLabel,
                    frontColor: dayExpenses > 0 ? colors.expense : colors.border,
                });
            }
        } else {
            // 6 derniers mois
            for (let i = 5; i >= 0; i--) {
                const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
                const monthKey = `${d.getFullYear()}-${d.getMonth()}`;
                const monthLabel = d.toLocaleDateString('fr-FR', { month: 'short' });

                const monthExpenses = transactions
                    .filter(t => {
                        const tDate = new Date(t.date);
                        const tMonthKey = `${tDate.getFullYear()}-${tDate.getMonth()}`;
                        const isExpense = ['transfer_sent', 'payment', 'withdrawal', 'uemoa_sent'].includes(t.type);
                        return tMonthKey === monthKey && isExpense;
                    })
                    .reduce((sum, t) => sum + t.amount, 0);

                data.push({
                    value: monthExpenses,
                    label: monthLabel,
                    frontColor: monthExpenses > 0 ? colors.expense : colors.border,
                });
            }
        }

        return data;
    }, [transactions, period, colors]);

    const maxValue = Math.max(...chartData.map(d => d.value), 1);

    return (
        <View style={[styles.container, { backgroundColor: colors.cardBackground }]}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: colors.text }]}>Évolution des dépenses</Text>
                <View style={[styles.periodSelector, { backgroundColor: colors.background }]}>
                    <TouchableOpacity
                        style={[
                            styles.periodButton,
                            period === 'week' && { backgroundColor: colors.tint }
                        ]}
                        onPress={() => setPeriod('week')}
                    >
                        <Text style={[
                            styles.periodText,
                            { color: period === 'week' ? colors.cardBackground : colors.textSecondary }
                        ]}>7J</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.periodButton,
                            period === 'month' && { backgroundColor: colors.tint }
                        ]}
                        onPress={() => setPeriod('month')}
                    >
                        <Text style={[
                            styles.periodText,
                            { color: period === 'month' ? colors.cardBackground : colors.textSecondary }
                        ]}>6M</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.chartContainer}>
                {hideAmounts ? (
                    <View style={styles.hiddenContainer}>
                        <Text style={{ color: colors.textSecondary }}>Graphique masqué (Mode Privé)</Text>
                    </View>
                ) : (
                    <BarChart
                        data={chartData}
                        barWidth={period === 'week' ? 24 : 32}
                        noOfSections={3}
                        barBorderRadius={4}
                        frontColor={colors.expense}
                        yAxisThickness={0}
                        xAxisThickness={0}
                        hideRules
                        hideYAxisText
                        width={screenWidth - 80}
                        height={180}
                        isAnimated
                        renderTooltip={(item: any) => {
                            return (
                                <View style={{
                                    marginBottom: 20,
                                    marginLeft: -6,
                                    backgroundColor: '#333',
                                    paddingHorizontal: 6,
                                    paddingVertical: 4,
                                    borderRadius: 4,
                                }}>
                                    <Text style={{ color: '#fff', fontSize: 10 }}>{formatAmount(item.value)}</Text>
                                </View>
                            );
                        }}
                    />
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginHorizontal: 16,
        marginBottom: 16,
        borderRadius: 12,
        padding: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
    },
    periodSelector: {
        flexDirection: 'row',
        borderRadius: 8,
        padding: 2,
    },
    periodButton: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 6,
    },
    periodText: {
        fontSize: 12,
        fontWeight: '600',
    },
    chartContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        height: 200,
    },
    hiddenContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        backgroundColor: 'rgba(0,0,0,0.02)',
        borderRadius: 8,
    },
});
