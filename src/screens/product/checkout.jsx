// Checkout.jsx
import React, { useState } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform, 
  Modal, 
  TouchableOpacity, 
  Alert, 
  ActivityIndicator,
  Text 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Title, Paragraph, Button, TextInput } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { globalStyles, spacing, colors } from '../../components/common/theme';
import { getUserCredentials } from '../../utils/userStorage';
import * as ImagePicker from 'expo-image-picker';
import { useDispatch } from 'react-redux';
import { createOrder } from '../../redux/actions/orderAction';
import Toast from 'react-native-toast-message';
import { useAsyncSQLiteContext } from '../../utils/asyncSQliteProvider';

const Checkout = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { params } = useRoute();
  const db = useAsyncSQLiteContext();
  const [shippingAddress, setShippingAddress] = useState({
    street: '',
    city: '',
    postalCode: '',
    country: '',
  });
  const [paymentMethod, setPaymentMethod] = useState('');
  const [proofOfPayment, setProofOfPayment] = useState(null);
  const [proofModalVisible, setProofModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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

  // Open the proof of payment modal
  const handleUploadPhoto = () => {
    setProofModalVisible(true);
  };

  // Use ImagePicker to launch the gallery for proof upload
  const pickProofFromGallery = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert("Permission Denied", "You need to allow access to your gallery.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setProofOfPayment(uri);
      setProofModalVisible(false);
    }
  };

  // Use ImagePicker to launch the camera for proof upload
  const takeProofPhotoWithCamera = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert("Permission Denied", "You need to allow access to your camera.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setProofOfPayment(uri);
      setProofModalVisible(false);
    }
  };

  const handlePlaceOrder = async () => {
    try {
      setIsLoading(true);
      const user = await getUserCredentials();
      console.log('User:', user);
  
      if (!user || !user._id) {
        Alert.alert('Error', 'User information is missing. Please log in again.');
        setIsLoading(false);
        return;
      }
  
      const orderDetails = {
        userId: user._id, 
        shippingAddress,
        paymentMethod,
        selectedProducts,
        subtotal,
        vat,
        shippingFee,
        total,
        ...(paymentMethod === 'GCash' && { proofOfPayment }), // Include proofOfPayment only if paymentMethod is GCash
      };
  
      console.log('Placing Order');
      console.log('Order Details:', orderDetails);
  
      dispatch(createOrder({ orderDetails, db }))
        .unwrap()
        .then((order) => {
          console.log('Order placed successfully:', order);
          Toast.show({
            type: 'success',
            text1: 'Order placed successfully!',
            text2: 'Thank you for your order.',
          });
          navigation.navigate('Home');
        })
        .catch((error) => {
          Alert.alert('Order failed', error.message || 'An error occurred while placing the order 001.');
        })
        .finally(() => {
          setIsLoading(false);
        });
    } catch (error) {
      console.error('Error placing order:', error);
      Alert.alert('Error', 'An error occurred while placing the order 002.');
      setIsLoading(false);
    }
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
            onPress={handlePlaceOrder}
            style={[styles.payButton, styles.checkoutButton]}
            labelStyle={styles.payButtonLabel}
            disabled={isLoading}
          >
            {isLoading ? 'Placing Order...' : 'Place Order'}
          </Button>
        </View>

        {/* Loader */}
        {isLoading && (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        )}

        {/* Modal for Proof of Payment Image Picker */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={proofModalVisible}
          onRequestClose={() => setProofModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Upload Proof of Payment</Text>
              <TouchableOpacity style={styles.modalButton} onPress={takeProofPhotoWithCamera}>
                <Text style={styles.modalButtonText}>Take Photo</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalButton} onPress={pickProofFromGallery}>
                <Text style={styles.modalButtonText}>Choose from Gallery</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalCancelButton} onPress={() => setProofModalVisible(false)}>
                <Text style={styles.modalCancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
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
  // Modal styles
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 20,
    borderRadius: 10,
  },
  loaderContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
    zIndex: 10,
  },
  modalTitle: {
    fontSize: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  modalButton: {
    backgroundColor: colors.secondary,
    padding: 10,
    borderRadius: 5,
    marginVertical: 5,
  },
  modalButtonText: {
    color: '#fff',
    textAlign: 'center',
  },
  modalCancelButton: {
    padding: 10,
    borderRadius: 5,
    marginVertical: 5,
  },
  modalCancelButtonText: {
    color: colors.primary,
    textAlign: 'center',
  },
});

export default Checkout;
