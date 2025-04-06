// cart.jsx
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Title, Paragraph, Button, IconButton, Checkbox } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { useAsyncSQLiteContext } from '../../utils/asyncSQliteProvider';
import { colors, spacing, globalStyles } from '../../components/common/theme';
import { fetchCartItems, removeCartItem, updateCartItemQuantity } from '../../redux/actions/cartAction';
import { getUserCredentials } from '../../utils/userStorage';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import Toasthelper from '../../components/common/toasthelper';

const Cart = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const db = useAsyncSQLiteContext();
  const { items, loading, error } = useSelector((state) => state.cart);
  const [userId, setUserId] = useState(null);
  // localQuantities holds temporary quantity values for each productId
  const [localQuantities, setLocalQuantities] = useState({});
  // selectedItems holds the selection state (true/false) for each productId
  const [selectedItems, setSelectedItems] = useState({});

  // Fetch user credentials and then load cart items
  useEffect(() => {
    const fetchCartData = async () => {
      try {
        const user = await getUserCredentials();
        if (!user) {
          // console.error('User not found in AsyncStorage');
          Toasthelper.showError('User not found', 'Please log in again.');
          return;
        }
        setUserId(user._id);
        dispatch(fetchCartItems({ db, userId: user._id }));
      } catch (error) {
        console.error('Error fetching cart items', error);
      }
    };
    fetchCartData();
  }, [dispatch, db]);

  // When items update, initialize localQuantities and selectedItems if not set already
  useEffect(() => {
    if (items && items.length) {
      const initialQuantities = {};
      const initialSelected = {};
      items.forEach(item => {
        initialQuantities[item.productId] = item.quantity;
        // Default to selected
        initialSelected[item.productId] = true;
      });
      setLocalQuantities(initialQuantities);
      setSelectedItems(initialSelected);
    }
  }, [items]);

  const handleRemove = (item) => {
    if (!db) {
      console.error('Database instance is not ready');
      return;
    }
    Alert.alert(
      'Remove Item',
      'Are you sure you want to remove this item from your cart?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          onPress: () =>
            dispatch(
              removeCartItem({ db, user_id: item.user_id, productId: item.productId })
            ),
          style: 'destructive',
        },
      ]
    );
  };

  const handleDecrease = (item) => {
    const currentQty = localQuantities[item.productId] || item.quantity;
    if (currentQty > 1) {
      setLocalQuantities({
        ...localQuantities,
        [item.productId]: currentQty - 1,
      });
    }
  };

  const handleIncrease = (item) => {
    const currentQty = localQuantities[item.productId] || item.quantity;
    if (currentQty < 24) {
      setLocalQuantities({
        ...localQuantities,
        [item.productId]: currentQty + 1,
      });
    }
  };

  // Individual save function is no longer used

  const toggleSelectItem = (item) => {
    setSelectedItems({
      ...selectedItems,
      [item.productId]: !selectedItems[item.productId],
    });
  };

  const renderCartItem = ({ item }) => {
    // Use local quantity if available, otherwise fallback to the stored quantity
    const currentQuantity = localQuantities[item.productId] ?? item.quantity;
    
    return (
      <View style={styles.cartItem}>
        {/* Remove button in top right with a higher zIndex */}
        <IconButton
          icon="delete"
          size={16}
          color={colors.error}
          style={styles.removeButton}
          onPress={() => handleRemove(item)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        />
        {/* Touchable area for navigating to Details.
            Adding a right margin so it doesn't cover the IconButton */}
        <TouchableOpacity
          onPress={() => navigation.navigate('Details', { liquorId: item.productId })}
          activeOpacity={0.8}
          style={styles.itemDetailsContainer}
        >
          <Title style={styles.itemTitle}>{item.name}</Title>
          <Paragraph>Quantity: {currentQuantity}</Paragraph>
          <Paragraph>Price: ₱{item.price}</Paragraph>
        </TouchableOpacity>
        {/* Footer row with checkbox */}
        <View style={styles.itemFooter}>
          <Checkbox
            status={selectedItems[item.productId] ? 'checked' : 'unchecked'}
            onPress={() => toggleSelectItem(item)}
            color={colors.primary}
            style={styles.checkbox}
          />
        </View>
        {/* Quantity Buttons placed at the bottom center */}
        <View style={styles.quantityContainer}>
          <Button
            mode="contained"
            onPress={() => handleDecrease(item)}
            disabled={currentQuantity <= 1}
            style={[
              styles.qtyButton,
              currentQuantity <= 1 && styles.disabledQtyButton,
            ]}
            labelStyle={[
              styles.qtyButtonLabel,
              currentQuantity <= 1 && styles.disabledQtyButtonLabel,
            ]}
          >
            –
          </Button>
          <Button
            mode="contained"
            onPress={() => handleIncrease(item)}
            disabled={currentQuantity >= 24}
            style={styles.qtyButton}
            labelStyle={styles.qtyButtonLabel}
          >
            +
          </Button>
        </View>
      </View>
    );
  };
  

  // Check if any items have modified quantities
  const hasChanges = items && items.some(item => {
    const localQty = localQuantities[item.productId] ?? item.quantity;
    return localQty !== item.quantity;
  });

  // Universal Save All Changes handler
const handleSaveAllChanges = async () => {
    try {
      await db.withTransactionAsync(async () => {
        for (const item of items) {
          const localQty = localQuantities[item.productId] ?? item.quantity;
          if (localQty !== item.quantity) {
            await db.runAsync(
              "UPDATE cart SET quantity = ? WHERE user_id = ? AND productId = ?;",
              [localQty, item.user_id, item.productId]
            );
          }
        }
      });
      // Optionally, refresh the cart items after updating.
      dispatch(fetchCartItems({ db, userId }));
    } catch (error) {
      console.error("Error saving all changes", error);
    }
  };

  // Compute total price based on current quantities for selected items only
  const computeTotal = () => {
    return items.reduce((total, item) => {
      if (selectedItems[item.productId]) {
        const qty = localQuantities[item.productId] ?? item.quantity;
        return total + item.price * qty;
      }
      return total;
    }, 0).toFixed(2);
  };

  // Handle checkout by logging selected products
  const handleCheckout = () => {
    const selectedProducts = items.filter(item => selectedItems[item.productId]);
    console.log('Selected products for checkout:', selectedProducts);
    navigation.navigate('Checkout', { selectedProducts });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Paragraph>Error: {error}</Paragraph>
        <Button mode="contained" onPress={() => dispatch(fetchCartItems({ db, userId }))}>
          Retry
        </Button>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={globalStyles.container}>
      <FlatList
        data={items}
        keyExtractor={(item, index) => item.productId + index.toString()}
        renderItem={renderCartItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Paragraph>Your cart is empty.</Paragraph>
          </View>
        }
        // Universal Save button as a footer component
        ListFooterComponent={
          hasChanges && (
            <View style={styles.universalSaveContainer}>
              <Button
                mode="contained"
                onPress={handleSaveAllChanges}
                style={styles.universalSaveButton}
                labelStyle={styles.universalSaveButtonLabel}
              >
                Save All Changes
              </Button>
            </View>
          )
        }
      />
      {/* Footer Section */}
      <View style={styles.footerContainer}>
        <View style={styles.totalContainer}>
          <Title>Estimated Price:</Title>
          <Paragraph>₱{computeTotal()}</Paragraph>
        </View>
        <View style={styles.actionButtons}>
          <Button
            mode="outlined"
            onPress={() => navigation.navigate('Home')}
            style={styles.browseButton}
            labelStyle={styles.browseButtonLabel}
          >
            Browse Liquors
          </Button>
          <Button
            mode="contained"
            onPress={handleCheckout}
            style={styles.checkoutButton}
            labelStyle={styles.checkoutButtonLabel}
          >
            Checkout
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.medium,
  },
  listContent: {
    padding: spacing.medium,
    paddingBottom: 180, // leave space for the footer container
  },
  cartItem: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: spacing.medium,
    marginBottom: spacing.medium,
    elevation: 2,
    position: 'relative',
    flexDirection: 'column',
  },
  itemTitle: {
    marginBottom: spacing.small,
    color: colors.primary,
  },
  removeButton: {
    position: 'absolute',
    top: spacing.small / 2,
    right: spacing.small / 2,
    padding: 4,
    zIndex: 10,
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginTop: spacing.medium,
  },
  checkbox: {
    // additional styling if needed
  },
  itemDetailsContainer: {
    // Add right margin so it doesn't extend over the remove button
    marginRight: spacing.large, 
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityContainer: {
    position: 'absolute',
    bottom: spacing.medium,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyButton: {
    backgroundColor: colors.bronzeShade1,
    marginHorizontal: spacing.small,
  },
  qtyButtonLabel: {
    color: '#ffffff',
  },
  disabledQtyButton: {
    backgroundColor: 'transparent',
  },
  disabledQtyButtonLabel: {
    color: colors.placeholder,
  },
  universalSaveContainer: {
    marginTop: spacing.medium,
    padding: spacing.small,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.placeholder,
  },
  universalSaveButton: {
    backgroundColor: colors.bronzeShade1,
    width: '60%',
  },
  universalSaveButtonLabel: {
    color: '#ffffff',
  },
  footerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    padding: spacing.medium,
    borderTopWidth: 1,
    borderTopColor: colors.placeholder,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.medium,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  checkoutButton: {
    flex: 1,
    marginLeft: spacing.small,
    backgroundColor: colors.bronzeShade1,
  },
  checkoutButtonLabel: {
    color: '#ffffff',
  },
  browseButton: {
    flex: 1,
    marginRight: spacing.small,
    borderColor: colors.bronzeShade1,
  },
  browseButtonLabel: {
    color: colors.bronzeShade1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.large,
  },
});

export default Cart;
