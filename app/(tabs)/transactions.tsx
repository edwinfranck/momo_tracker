import { useTheme } from "@/contexts/ThemeContext";
import { PeriodFilter, SortBy, useTransactions } from "@/contexts/TransactionsContext";
import { useSecurity } from "@/contexts/SecurityContext";
import {
    Transaction,
    TransactionCategories,
    TransactionType,
    TransactionTypeLabels,
} from "@/types/transaction";
import { Stack, useRouter } from "expo-router";
import {
    Filter,
    Search,
    SlidersHorizontal,
    Calendar,
    DollarSign,
    ArrowUpDown,
    X,
    FileText
} from "lucide-react-native";
import { generateTransactionPDF } from "@/utils/pdfGenerator";
import React, { useState, useRef } from "react";
import {
    FlatList,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    ScrollView,
    Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TransactionsScreen() {
    const { colors } = useTheme();
    const {
        filteredTransactions,
        searchQuery,
        setSearchQuery,
        filterType,
        setFilterType,
        // Advanced filters
        periodFilter,
        setPeriodFilter,
        minAmount,
        setMinAmount,
        maxAmount,
        setMaxAmount,
        sortBy,
        setSortBy,
    } = useTransactions();
    const { formatAmount, hideAmounts } = useSecurity();
    const router = useRouter();
    const [showFilters, setShowFilters] = useState(false);
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [showScrollToTop, setShowScrollToTop] = useState(false);
    const flatListRef = useRef<FlatList>(null);

    // Local state for amount filter inputs
    const [minAmountInput, setMinAmountInput] = useState("");
    const [maxAmountInput, setMaxAmountInput] = useState("");

    const formatCurrency = (amount: number) => {
        return formatAmount(amount);
    };

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat("fr-FR", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        }).format(date);
    };

    const getTransactionColor = (type: string) => {
        const categoryColors = colors.categoryColors as any;
        return categoryColors[type] || colors.info;
    };

    // Period filter options
    const periodFilterOptions: { value: PeriodFilter; label: string }[] = [
        { value: "all", label: "Tout" },
        { value: "today", label: "Aujourd'hui" },
        { value: "7days", label: "7 jours" },
        { value: "30days", label: "30 jours" },
        { value: "3months", label: "3 mois" },
        { value: "6months", label: "6 mois" },
        { value: "1year", label: "1 an" },
    ];

    // Sort options
    const sortOptions: { value: SortBy; label: string }[] = [
        { value: "date_desc", label: "Date (récent → ancien)" },
        { value: "date_asc", label: "Date (ancien → récent)" },
        { value: "amount_desc", label: "Montant (décroissant)" },
        { value: "amount_asc", label: "Montant (croissant)" },
    ];

    // Handle amount filter
    const applyAmountFilter = () => {
        const min = minAmountInput ? parseFloat(minAmountInput) : null;
        const max = maxAmountInput ? parseFloat(maxAmountInput) : null;
        setMinAmount(min);
        setMaxAmount(max);
    };

    // Reset all filters
    const resetFilters = () => {
        setFilterType("all");
        setPeriodFilter("all");
        setMinAmount(null);
        setMaxAmount(null);
        setMinAmountInput("");
        setMaxAmountInput("");
        setSortBy("date_desc");
        setSearchQuery("");
    };

    // Check if any advanced filter is active
    const hasActiveFilters = periodFilter !== "all" ||
        minAmount !== null ||
        maxAmount !== null ||
        sortBy !== "date_desc" ||
        filterType !== "all" ||
        searchQuery !== "";


    // Calculate totals based on filtered transactions
    const calculateTotals = () => {
        let totalReceived = 0;
        let totalSent = 0;
        let totalFees = 0;

        filteredTransactions.forEach((transaction) => {
            const isIncome =
                transaction.type === "transfer_received" ||
                transaction.type === "deposit" ||
                transaction.type === "uemoa_received";

            if (isIncome) {
                totalReceived += transaction.amount;
            } else {
                totalSent += transaction.amount;
            }
            totalFees += transaction.fee;
        });

        return {
            totalReceived,
            totalSent,
            totalFees,
            netBalance: totalReceived - totalSent - totalFees,
        };
    };

    const totals = calculateTotals();

    const renderTransaction = ({ item }: { item: Transaction }) => {
        const isIncome =
            item.type === "transfer_received" ||
            item.type === "deposit" ||
            item.type === "uemoa_received";

        return (
            <TouchableOpacity
                style={[styles.transactionItem, { backgroundColor: colors.cardBackground }]}
                onPress={() => router.push(`/transaction/${item.id}` as any)}
            >
                <View
                    style={[
                        styles.transactionIcon,
                        {
                            backgroundColor: `${getTransactionColor(item.type)}20`,
                        },
                    ]}
                >
                    <View
                        style={{
                            width: 10,
                            height: 10,
                            borderRadius: 8,
                            backgroundColor: getTransactionColor(item.type),
                        }}
                    />
                </View>
                <View style={styles.transactionContent}>
                    <Text style={[styles.transactionType, { color: colors.text }]}>
                        {TransactionTypeLabels[item.type]}
                    </Text>
                    <Text style={[styles.transactionCounterparty, { color: colors.textSecondary }]}>
                        {hideAmounts ? "••••••" : item.counterparty}
                    </Text>
                    <Text style={[styles.transactionDate, { color: colors.textSecondary }]}>{formatDate(item.date)}</Text>
                </View>
                <View style={styles.transactionAmountContainer}>
                    <Text
                        style={[
                            styles.transactionAmount,
                            {
                                color: isIncome ? colors.income : colors.expense,
                            },
                        ]}
                    >
                        {isIncome ? "+" : "-"}
                        {formatCurrency(item.amount)}
                    </Text>

                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.cardBackground }]} edges={["bottom"]}>
            <Stack.Screen
                options={{
                    headerShown: true,
                    title: "Transactions",
                    headerStyle: {
                        backgroundColor: colors.cardBackground,
                    },
                    headerTintColor: colors.text,
                    headerShadowVisible: false,
                }}
            />
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                <View style={[styles.searchContainer, { backgroundColor: colors.cardBackground }]}>
                    <View style={[styles.searchInputContainer, { backgroundColor: colors.background }]}>
                        <Search size={20} color={colors.textSecondary} />
                        <TextInput
                            style={[styles.searchInput, { color: colors.text }]}
                            placeholder="Rechercher..."
                            placeholderTextColor={colors.textSecondary}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                    </View>
                    <TouchableOpacity
                        style={[
                            styles.filterButton,
                            { backgroundColor: colors.background },
                            showFilters && { backgroundColor: colors.tint },
                        ]}
                        onPress={() => setShowFilters(!showFilters)}
                    >
                        <Filter
                            size={20}
                            color={
                                showFilters ? colors.cardBackground : colors.text
                            }
                        />
                    </TouchableOpacity>
                </View>

                {showFilters && (
                    <View style={[styles.filtersContainer, { backgroundColor: colors.cardBackground }]}>
                        <FlatList
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            data={TransactionCategories}
                            keyExtractor={(item) => item.value}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[
                                        styles.filterChip,
                                        { backgroundColor: colors.background },
                                        filterType === item.value && { backgroundColor: colors.tint },
                                    ]}
                                    onPress={() =>
                                        setFilterType(item.value as TransactionType | "all")
                                    }
                                >
                                    <Text
                                        style={[
                                            styles.filterChipText,
                                            { color: colors.text },
                                            filterType === item.value && { color: colors.text, fontWeight: "600" },
                                        ]}
                                    >
                                        {item.label}
                                    </Text>
                                </TouchableOpacity>
                            )}
                            contentContainerStyle={styles.filtersContent}
                        />
                    </View>
                )}

                {/* Advanced Filters Button */}
                <View style={[styles.advancedFiltersButtonContainer, { backgroundColor: colors.cardBackground, borderBottomColor: colors.border }]}>
                    <TouchableOpacity
                        style={[
                            styles.advancedFiltersButton,
                            { backgroundColor: colors.background },
                            showAdvancedFilters && { backgroundColor: `${colors.tint}20`, borderColor: colors.tint, borderWidth: 1 },
                        ]}
                        onPress={() => setShowAdvancedFilters(!showAdvancedFilters)}
                    >
                        <SlidersHorizontal size={18} color={colors.text} />
                        <Text style={[styles.advancedFiltersButtonText, { color: colors.text }]}>
                            Filtres avancés
                        </Text>
                        {hasActiveFilters && <View style={[styles.activeFilterDot, { backgroundColor: colors.tint }]} />}
                    </TouchableOpacity>
                    {hasActiveFilters && (
                        <TouchableOpacity
                            style={[styles.resetFiltersButton, { backgroundColor: `${colors.error}15` }]}
                            onPress={resetFilters}
                        >
                            <X size={16} color={colors.error} />
                            <Text style={[styles.resetFiltersText, { color: colors.error }]}>Réinitialiser</Text>
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity
                        style={[styles.exportButton, { backgroundColor: colors.background }]}
                        onPress={async () => {
                            try {
                                await generateTransactionPDF({
                                    transactions: filteredTransactions,
                                    filterType,
                                    startDate: undefined, // À améliorer si on a les dates exactes du filtre
                                    endDate: undefined
                                });
                            } catch (error) {
                                console.error("Erreur export PDF", error);
                                // Idéalement afficher un Toast ici
                            }
                        }}
                    >
                        <FileText size={18} color={colors.text} />
                    </TouchableOpacity>
                </View>

                {/* Advanced Filters Panel */}
                {showAdvancedFilters && (
                    <View style={[styles.advancedFiltersPanel, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            {/* Period Filter */}
                            <View style={[styles.filterSection, { borderBottomColor: colors.border }]}>
                                <View style={styles.filterSectionHeader}>
                                    <Calendar size={18} color={colors.tint} />
                                    <Text style={[styles.filterSectionTitle, { color: colors.text }]}>Période</Text>
                                </View>
                                <View style={styles.filterOptionsGrid}>
                                    {periodFilterOptions.map((option) => (
                                        <TouchableOpacity
                                            key={option.value}
                                            style={[
                                                styles.filterOptionChip,
                                                { backgroundColor: colors.cardBackground, borderColor: colors.border },
                                                periodFilter === option.value &&
                                                { backgroundColor: `${colors.tint}20`, borderColor: colors.tint },
                                            ]}
                                            onPress={() => setPeriodFilter(option.value)}
                                        >
                                            <Text
                                                style={[
                                                    styles.filterOptionChipText,
                                                    { color: colors.text },
                                                    periodFilter === option.value &&
                                                    { color: colors.tint, fontWeight: "600" },
                                                ]}
                                            >
                                                {option.label}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            {/* Amount Range Filter */}


                            {/* Sort Options */}

                        </ScrollView>
                    </View>
                )}

                <Text style={[styles.resultsCount, { color: colors.textSecondary }]}>
                    {filteredTransactions.length} transaction
                    {filteredTransactions.length !== 1 ? "s" : ""}
                </Text>

                {/* Summary Compact Horizontal */}
                {filteredTransactions.length > 0 && (
                    <View style={[styles.summaryCompact, { backgroundColor: colors.cardBackground }]}>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.summaryScrollContent}
                        >
                            {(filterType === "all" ||
                                filterType === "transfer_received" ||
                                filterType === "deposit" ||
                                filterType === "uemoa_received") && (
                                    <View style={[styles.summaryBadge, { backgroundColor: `${colors.income}15`, borderColor: colors.income }]}>
                                        <Text style={[styles.summaryBadgeLabel, { color: colors.income }]}>↓ Reçu</Text>
                                        <Text style={[styles.summaryBadgeValue, { color: colors.income }]}>
                                            {formatCurrency(totals.totalReceived)}
                                        </Text>
                                    </View>
                                )}
                            {(filterType === "all" ||
                                filterType === "transfer_sent" ||
                                filterType === "withdrawal" ||
                                filterType === "payment" ||
                                filterType === "uemoa_sent") && (
                                    <View style={[styles.summaryBadge, { backgroundColor: `${colors.expense}15`, borderColor: colors.expense }]}>
                                        <Text style={[styles.summaryBadgeLabel, { color: colors.expense }]}>↑ Envoyé</Text>
                                        <Text style={[styles.summaryBadgeValue, { color: colors.expense }]}>
                                            {formatCurrency(totals.totalSent)}
                                        </Text>
                                    </View>
                                )}
                            {totals.totalFees > 0 && (
                                <View style={[styles.summaryBadge, { backgroundColor: `${colors.warning}15`, borderColor: colors.warning }]}>
                                    <Text style={[styles.summaryBadgeLabel, { color: colors.warning }]}>Frais</Text>
                                    <Text style={[styles.summaryBadgeValue, { color: colors.warning }]}>
                                        {formatCurrency(totals.totalFees)}
                                    </Text>
                                </View>
                            )}
                            {filterType === "all" && (
                                <View style={[
                                    styles.summaryBadge,
                                    styles.summaryBadgeNet,
                                    {
                                        backgroundColor: totals.netBalance >= 0 ? `${colors.income}20` : `${colors.expense}20`,
                                        borderColor: totals.netBalance >= 0 ? colors.income : colors.expense,
                                        borderWidth: 2,
                                    }
                                ]}>
                                    <Text style={[
                                        styles.summaryBadgeLabel,
                                        { color: totals.netBalance >= 0 ? colors.income : colors.expense }
                                    ]}>
                                        Solde Net
                                    </Text>
                                    <Text style={[
                                        styles.summaryBadgeValue,
                                        styles.summaryNetValue,
                                        { color: totals.netBalance >= 0 ? colors.income : colors.expense }
                                    ]}>
                                        {totals.netBalance >= 0 ? "+" : ""}
                                        {formatCurrency(Math.abs(totals.netBalance))}
                                    </Text>
                                </View>
                            )}
                        </ScrollView>
                    </View>
                )}



                <FlatList
                    ref={flatListRef}
                    data={filteredTransactions}
                    renderItem={renderTransaction}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={true}
                    onScroll={(event) => {
                        const offsetY = event.nativeEvent.contentOffset.y;
                        setShowScrollToTop(offsetY > 500);
                    }}
                    scrollEventThrottle={16}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Text style={[styles.emptyStateText, { color: colors.text }]}>
                                Aucune transaction trouvée
                            </Text>
                            <Text style={[styles.emptyStateSubtext, { color: colors.textSecondary }]}>
                                {searchQuery || filterType !== "all"
                                    ? "Essayez de modifier vos filtres"
                                    : "Synchronisez vos SMS MTN MoMo pour commencer"}
                            </Text>
                        </View>
                    }
                />

                {/* Scroll to Top Button */}
                {showScrollToTop && (
                    <TouchableOpacity
                        style={[styles.scrollToTopButton, { backgroundColor: colors.tint }]}
                        onPress={() => {
                            flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
                        }}
                    >
                        <ArrowUpDown size={24} color={colors.cardBackground} style={{ transform: [{ rotate: '180deg' }] }} />
                    </TouchableOpacity>
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    container: {
        flex: 1,
    },
    searchContainer: {
        flexDirection: "row",
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 12,
        gap: 12,
    },
    searchInputContainer: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        borderRadius: 8,
        paddingHorizontal: 16,
        //paddingVertical: 1,
        gap: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
    },
    filterButton: {
        width: 48,
        height: 48,
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
    },
    filterButtonActive: {
        // backgroundColor set dynamically
    },
    filtersContainer: {
        paddingBottom: 12,
    },
    filtersContent: {
        paddingHorizontal: 16,
        gap: 8,
    },
    filterChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
        marginRight: 8,
    },
    filterChipActive: {
        // backgroundColor set dynamically
    },
    filterChipText: {
        fontSize: 14,
        fontWeight: "500" as const,
    },
    filterChipTextActive: {
        // color set dynamically
        fontWeight: "600" as const,
    },
    resultsCount: {
        fontSize: 14,
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    listContent: {
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    transactionItem: {
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
        borderRadius: 8,
        marginBottom: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    transactionIcon: {
        width: 44,
        height: 44,
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },
    transactionContent: {
        flex: 1,
    },
    transactionType: {
        fontSize: 15,
        fontWeight: "600" as const,
    },
    transactionCounterparty: {
        fontSize: 13,
        marginTop: 2,
    },
    transactionDate: {
        fontSize: 12,
        marginTop: 2,
    },
    transactionAmountContainer: {
        alignItems: "flex-end",
    },
    transactionAmount: {
        fontSize: 16,
        fontWeight: "700" as const,
    },
    transactionFee: {
        fontSize: 11,
        marginTop: 2,
    },
    emptyState: {
        alignItems: "center",
        paddingVertical: 64,
        paddingHorizontal: 32,
    },
    emptyStateText: {
        fontSize: 18,
        fontWeight: "600" as const,
    },
    emptyStateSubtext: {
        fontSize: 14,
        textAlign: "center",
        marginTop: 8,
    },
    scrollToTopButton: {
        position: "absolute",
        bottom: 24,
        right: 24,
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    // Summary Compact Styles
    summaryCompact: {
        marginHorizontal: 16,
        marginBottom: 8,
        borderRadius: 8,
        paddingVertical: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    summaryScrollContent: {
        paddingHorizontal: 12,
        gap: 8,
        alignItems: "center",
    },
    summaryBadge: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        borderWidth: 1,
        minWidth: 100,
        alignItems: "center",
    },
    summaryBadgeNet: {
        minWidth: 130,
    },
    summaryBadgeLabel: {
        fontSize: 11,
        fontWeight: "600" as const,
        textTransform: "uppercase" as const,
        marginBottom: 2,
    },
    summaryBadgeValue: {
        fontSize: 14,
        fontWeight: "700" as const,
    },
    summaryNetValue: {
        fontSize: 15,
    },
    // Advanced Filters Styles
    advancedFiltersButtonContainer: {
        flexDirection: "row",
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 12,
        borderBottomWidth: 1,
    },
    advancedFiltersButton: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        gap: 8,
    },
    advancedFiltersButtonActive: {
        // backgroundColor, borderColor, borderWidth set dynamically
    },
    advancedFiltersButtonText: {
        fontSize: 14,
        fontWeight: "600" as const,
    },
    activeFilterDot: {
        width: 8,
        height: 8,
        borderRadius: 8,
    },
    resetFiltersButton: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        gap: 6,
    },
    resetFiltersText: {
        fontSize: 13,
        fontWeight: "600" as const,
    },
    exportButton: {
        width: 44,
        height: 44,
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: "transparent", // ou colors.border si besoin
    },
    advancedFiltersPanel: {
        maxHeight: 400,
        borderBottomWidth: 1,
    },
    filterSection: {
        padding: 16,
        borderBottomWidth: 1,
    },
    filterSectionHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 12,
    },
    filterSectionTitle: {
        fontSize: 15,
        fontWeight: "600" as const,
    },
    filterOptionsGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
    filterOptionChip: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 8,
        borderWidth: 1,
    },
    filterOptionChipActive: {
        // backgroundColor, borderColor set dynamically
    },
    filterOptionChipText: {
        fontSize: 13,
        fontWeight: "500" as const,
    },
    filterOptionChipTextActive: {
        // color, fontWeight set dynamically
    },
    amountFilterContainer: {
        flexDirection: "row",
        alignItems: "flex-end",
        gap: 12,
    },
    amountInputWrapper: {
        flex: 1,
    },
    amountInputLabel: {
        fontSize: 12,
        fontWeight: "500" as const,
        marginBottom: 6,
    },
    amountInput: {
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 14,
    },
    amountSeparator: {
        fontSize: 16,
        fontWeight: "600" as const,
        paddingBottom: 10,
    },
    filterActiveText: {
        fontSize: 11,
        marginTop: 8,
        fontWeight: "500" as const,
    },
    sortOptionsContainer: {
        gap: 8,
    },
    sortOption: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
        paddingHorizontal: 12,
        borderRadius: 8,
        gap: 12,
    },
    sortOptionActive: {
        // backgroundColor, borderColor set dynamically
    },
    sortOptionRadio: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        alignItems: "center",
        justifyContent: "center",
    },
    sortOptionRadioActive: {
        // borderColor set dynamically
    },
    sortOptionRadioDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    sortOptionText: {
        flex: 1,
        fontSize: 14,
        fontWeight: "500" as const,
    },
    sortOptionTextActive: {
        // color, fontWeight set dynamically
    },
});
