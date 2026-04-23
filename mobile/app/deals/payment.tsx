import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, Alert, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { colors, spacing, radius, typography } from '../../theme';
import { dealService } from '../../src/services/dealService';

export default function DealPaymentScreen() {
  const { dealId, amount } = useLocalSearchParams();
  const [dealTitle, setDealTitle] = useState('');
  const [dealStatus, setDealStatus] = useState('');
  const [paymentAmount, setPaymentAmount] = useState(amount as string || '');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDeal = async () => {
      if (!dealId) return;
      try {
        const deal = await dealService.getDeal(dealId as string);
        setDealTitle(deal.title);
        setDealStatus(deal.status);
        if (!paymentAmount) {
          setPaymentAmount(String(deal.amount));
        }
      } catch (_error) {
        setError('Failed to load deal summary');
      }
    };

    loadDeal();
  }, [dealId]);

  const formatAmount = (value: string) => {
    const num = parseFloat(value);
    if (isNaN(num)) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(num);
  };

  const handlePayment = () => {
    if (!cardNumber || !expiryDate || !cvv || !cardholderName) {
      setError('Please fill in all card details');
      return;
    }

    setError(null);
    setProcessing(true);

    Alert.alert(
      'Payment Processing',
      `Processing payment of ${formatAmount(paymentAmount)} for deal ${dealId}`,
      [
        { text: 'OK', onPress: () => handlePaymentSubmit() }
      ]
    );
  };

  const handlePaymentSubmit = async () => {
    try {
      const last4 = cardNumber.slice(-4) || 'card';
      await dealService.fundDeal(dealId as string, {
        amount: Number(paymentAmount),
        paymentMethodId: `pm_${last4}`,
      });
      setProcessing(false);
      Alert.alert('Payment Successful', 'Your payment has been processed successfully!', [{ text: 'OK' }]);
    } catch (_error) {
      setProcessing(false);
      setError('Failed to fund deal');
    }
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
        <Text style={styles.title}>Payment for Deal</Text>
        <Text style={styles.dealId}>Deal ID: {dealId as string}</Text>
        {dealTitle ? <Text style={styles.dealSummary}>{dealTitle}</Text> : null}
        {dealStatus ? <Text style={styles.dealSummary}>Status: {dealStatus}</Text> : null}
      </View>

      <View style={styles.amountSection}>
        <Text style={styles.amountLabel}>Amount to Pay</Text>
        <Text style={styles.amountValue}>{formatAmount(amount as string)}</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Card Number</Text>
          <TextInput
            style={styles.input}
            placeholder="1234 5678 9012 3456"
            value={cardNumber}
            onChangeText={setCardNumber}
            keyboardType="number-pad"
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.inputGroup, styles.flex1]}>
            <Text style={styles.label}>Expiry Date</Text>
            <TextInput
              style={styles.input}
              placeholder="MM/YY"
              value={expiryDate}
              onChangeText={setExpiryDate}
            />
          </View>
          <View style={[styles.inputGroup, styles.flex1, styles.ml2]}>
            <Text style={styles.label}>CVV</Text>
            <TextInput
              style={styles.input}
              placeholder="123"
              value={cvv}
              onChangeText={setCvv}
              keyboardType="number-pad"
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Cardholder Name</Text>
          <TextInput
            style={styles.input}
            placeholder="John Doe"
            value={cardholderName}
            onChangeText={setCardholderName}
          />
        </View>

        <TouchableOpacity style={styles.payButton} onPress={handlePayment}>
          {processing ? <ActivityIndicator color={colors.white} /> : <Text style={styles.payButtonText}>Process Payment</Text>}
        </TouchableOpacity>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: spacing.lg,
    backgroundColor: colors.card,
    marginBottom: spacing.md,
  },
  title: {
    ...typography.h1,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  dealId: {
    ...typography.body,
    color: colors.textSecondary,
  },
  dealSummary: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  amountSection: {
    backgroundColor: colors.card,
    padding: spacing.lg,
    margin: spacing.lg,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  amountLabel: {
    ...typography.h2,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  amountValue: {
    ...typography.h1,
    color: colors.text,
    fontWeight: 'bold',
  },
  form: {
    padding: spacing.lg,
  },
  inputGroup: {
    marginBottom: spacing.lg,
  },
  label: {
    ...typography.body,
    color: colors.text,
    fontWeight: '500',
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.md,
    color: colors.text,
    ...typography.body,
    borderWidth: 1,
    borderColor: colors.border,
  },
  row: {
    flexDirection: 'row',
  },
  flex1: {
    flex: 1,
  },
  ml2: {
    marginLeft: spacing.md,
  },
  payButton: {
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  payButtonText: {
    ...typography.body,
    color: colors.white,
    fontWeight: '600',
  },
  errorText: {
    ...typography.body,
    color: colors.error,
    marginTop: spacing.sm,
  },
});
