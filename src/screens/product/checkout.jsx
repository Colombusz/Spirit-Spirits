// checkout.jsx
import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Title, Paragraph, Button, TextInput } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { globalStyles, spacing, colors } from '../../components/common/theme';
import { getUserCredentials } from '../../utils/userStorage';

const Checkout = () => {
  const navigation = useNavigation();
  const { params } = useRoute();
  const [shippingAddress, setShippingAddress] = useState({
    street: '',
    city: '',
    postalCode: '',
    country: '',
  });
  const [paymentMethod, setPaymentMethod] = useState('');
  const [proofOfPayment, setProofOfPayment] = useState(null);

  // Function to fetch and set the saved address from AsyncStorage.
  const handleUseExistingAddress = async () => {
    try {
      const user = await getUserCredentials();
      if (user && user.address) {
        setShippingAddress({
          street: user.address.street || '',
          city: user.address.city || '',
          postalCode: user.address.postalCode || '',
          country: user.address.country || '',
        });
        console.log('Shipping address updated from AsyncStorage:', user.address);
      } else {
        console.log('No address found in AsyncStorage.');
      }
    } catch (error) {
      console.error('Error fetching saved address:', error);
    }
  };

  // Retrieve selected products from route parameters.
  const selectedProducts = params?.selectedProducts || [];

  // Compute subtotal, VAT, shipping fee and total
  const subtotal = selectedProducts.reduce((total, item) => {
    return total + item.price * item.quantity;
  }, 0);
  const vat = subtotal * 0.15;
  const shippingFee = 120;
  const total = subtotal + vat + shippingFee;

  const handleUploadPhoto = () => {
    console.log('Upload photo for proof of payment');
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <KeyboardAvoidingView
        style={styles.flexContainer}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* Summary Section */}
          <View style={styles.summaryContainer}>
            <Title style={styles.sectionTitle}>Summary</Title>
            {selectedProducts.map((item, index) => (
              <View key={index} style={styles.summaryItem}>
                <View style={styles.indicator} />
                <View style={styles.summaryContent}>
                  <Paragraph style={styles.summaryItemText}>{item.name}</Paragraph>
                  <Paragraph style={styles.summaryItemText}>Qty: {item.quantity}</Paragraph>
                  <Paragraph style={styles.summaryItemText}>Price: ₱{item.price.toFixed(2)}</Paragraph>
                  <Paragraph style={styles.summaryItemText}>
                    Total: ₱{(item.price * item.quantity).toFixed(2)}
                  </Paragraph>
                </View>
              </View>
            ))}
            <View style={styles.summaryDetails}>
              <Paragraph>Subtotal</Paragraph>
              <Paragraph>₱{subtotal.toFixed(2)}</Paragraph>
            </View>
            <View style={styles.summaryDetails}>
              <Paragraph>VAT (15%)</Paragraph>
              <Paragraph>₱{vat.toFixed(2)}</Paragraph>
            </View>
            <View style={styles.summaryDetails}>
              <Paragraph>Shipping Fee</Paragraph>
              <Paragraph>₱{shippingFee.toFixed(2)}</Paragraph>
            </View>
            <View style={styles.summaryTotal}>
              <Title>Total</Title>
              <Title>₱{total.toFixed(2)}</Title>
            </View>
          </View>

          {/* Address Section */}
          <View style={styles.addressContainer}>
            <Title style={styles.sectionTitle}>Shipping Address</Title>
            <Button 
              mode="outlined" 
              onPress={handleUseExistingAddress}
              style={styles.menuButton}
            >
              Use Existing Address
            </Button>
            <TextInput
              label="Street"
              value={shippingAddress.street}
              onChangeText={(text) => setShippingAddress({ ...shippingAddress, street: text })}
              style={styles.input}
            />
            <TextInput
              label="City"
              value={shippingAddress.city}
              onChangeText={(text) => setShippingAddress({ ...shippingAddress, city: text })}
              style={styles.input}
            />
            <TextInput
              label="Postal Code"
              value={shippingAddress.postalCode}
              onChangeText={(text) => setShippingAddress({ ...shippingAddress, postalCode: text })}
              style={styles.input}
            />
            <TextInput
              label="Country"
              value={shippingAddress.country}
              onChangeText={(text) => setShippingAddress({ ...shippingAddress, country: text })}
              style={styles.input}
            />
          </View>

          {/* Payment Method Section */}
          <View style={styles.paymentContainer}>
            <Title style={styles.sectionTitle}>Payment Method</Title>
            <Button
              mode={paymentMethod === 'GCash' ? 'contained' : 'outlined'}
              onPress={() => setPaymentMethod('GCash')}
              style={styles.paymentButton}
            >
              GCash
            </Button>
            <Button
              mode={paymentMethod === 'COD' ? 'contained' : 'outlined'}
              onPress={() => setPaymentMethod('COD')}
              style={styles.paymentButton}
            >
              Cash on Delivery
            </Button>
            {paymentMethod === 'GCash' && (
              <View style={styles.gcashContainer}>
                <Paragraph style={styles.gcashInstruction}>
                  Please upload a photo of your GCash payment receipt.
                </Paragraph>
                <Button mode="outlined" onPress={handleUploadPhoto} style={styles.uploadButton}>
                  Upload Photo
                </Button>
                {proofOfPayment && (
                  <Paragraph style={styles.proofText}>Photo uploaded successfully!</Paragraph>
                )}
              </View>
            )}
          </View>
        </ScrollView>

        {/* Footer Section */}
        <View style={styles.footerContainer}>
          <Button
            mode="outlined"
            onPress={() => navigation.goBack()}
            style={styles.browseButton}
          >
            Go to Cart
          </Button>
          <Button
            mode="contained"
            onPress={() => console.log('Proceed to payment')}
            style={[styles.payButton, styles.checkoutButton]}
            labelStyle={styles.payButtonLabel}
          >
            Place Order
          </Button>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flexContainer: {
    flex: 1,
  },
  scrollContainer: {
    padding: spacing.medium,
    paddingBottom: spacing.large,
  },
  summaryContainer: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: spacing.medium,
    marginBottom: spacing.medium,
    elevation: 2,
  },
  sectionTitle: {
    marginBottom: spacing.medium,
    fontWeight: 'bold',
    color: colors.primary,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 8,
    padding: spacing.small,
    marginBottom: spacing.small,
    backgroundColor: colors.background,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent,
    marginRight: spacing.small,
  },
  summaryContent: {
    flex: 1,
  },
  summaryItemText: {
    fontSize: 14,
    color: colors.text,
  },
  summaryDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.small,
  },
  summaryTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.medium,
    borderTopWidth: 1,
    borderTopColor: colors.placeholder,
    paddingTop: spacing.small,
  },
  addressContainer: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: spacing.medium,
    marginBottom: spacing.medium,
    elevation: 2,
  },
  menuButton: {
    marginBottom: spacing.small,
  },
  input: {
    marginBottom: spacing.small,
    backgroundColor: colors.surface,
  },
  paymentContainer: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: spacing.medium,
    marginBottom: spacing.medium,
    elevation: 2,
  },
  paymentButton: {
    marginBottom: spacing.small,
  },
  gcashContainer: {
    marginTop: spacing.medium,
    padding: spacing.medium,
    backgroundColor: colors.surface,
    borderRadius: 8,
  },
  gcashInstruction: {
    marginBottom: spacing.small,
    color: colors.text,
  },
  uploadButton: {
    marginBottom: spacing.small,
  },
  proofText: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: spacing.medium,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.placeholder,
  },
  payButton: {
    backgroundColor: colors.bronzeShade1,
    flex: 1,
    marginRight: spacing.small,
  },
  payButtonLabel: {
    color: '#ffffff',
  },
  checkoutButton: {
    flex: 1,
    marginLeft: spacing.small,
  },
  browseButton: {
    flex: 1,
  },
});

export default Checkout;
