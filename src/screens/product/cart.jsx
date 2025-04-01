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
          console.error('User not found in AsyncStorage');
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

  // When the user presses "Save", update the quantity in SQLite via Redux
  const handleSaveQuantity = (item) => {
    if (!db) {
      console.error('Database instance is not ready');
      return;
    }
    const newQty = localQuantities[item.productId];
    // Only update if quantity has changed
    if (newQty !== item.quantity) {
      dispatch(
        updateCartItemQuantity({
          db,
          user_id: item.user_id,
          productId: item.productId,
          quantity: newQty,
        })
      );
    }
  };

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
      <TouchableOpacity 
        onPress={() => navigation.navigate('Details', { liquorId: item.productId })}
        activeOpacity={0.8}
      >
        <View style={styles.cartItem}>
          {/* Remove button in top right */}
          <IconButton
            icon="delete"
            size={20}
            color={colors.error}
            style={styles.removeButton}
            onPress={() => handleRemove(item)}
          />
          <Title style={styles.itemTitle}>{item.name}</Title>
          <Paragraph>Quantity: {currentQuantity}</Paragraph>
          <Paragraph>Price: ${item.price}</Paragraph>
          {/* Footer row with checkbox on lower left and quantity controls on lower right */}
          <View style={styles.itemFooter}>
            <Checkbox
              status={selectedItems[item.productId] ? 'checked' : 'unchecked'}
              onPress={() => toggleSelectItem(item)}
              color={colors.primary}
              style={styles.checkbox}
            />
            <View style={styles.quantityControl}>
              <Button
                mode="contained"
                onPress={() => handleDecrease(item)}
                disabled={currentQuantity <= 1}
                style={styles.qtyButton}
              >
                –
              </Button>
              <Button
                mode="contained"
                onPress={() => handleIncrease(item)}
                disabled={currentQuantity >= 24}
                style={styles.qtyButton}
              >
                +
              </Button>
              {/* Save button appears if local quantity differs from stored quantity */}
              {currentQuantity !== item.quantity && (
                <Button
                  mode="contained"
                  onPress={() => handleSaveQuantity(item)}
                  style={styles.saveButton}
                >
                  Save
                </Button>
              )}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
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
    // navigation.navigate('Checkout', { selectedProducts });
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
      />
      {/* Footer Section */}
      <View style={styles.footerContainer}>
        <View style={styles.totalContainer}>
          <Title>Estimated Price:</Title>
          <Paragraph>${computeTotal()}</Paragraph>
        </View>
        <View style={styles.actionButtons}>
          <Button
            mode="outlined"
            onPress={() => navigation.navigate('Home')}
            style={styles.browseButton}
          >
            Browse Liquors
          </Button>
          <Button
            mode="contained"
            onPress={handleCheckout}
            style={styles.checkoutButton}
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
    top: 0,
    right: 0,
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.medium,
  },
  checkbox: {
    // Positioned at the lower left inside the footer row
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  qtyButton: {
    marginRight: spacing.small,
  },
  saveButton: {
    marginLeft: spacing.small,
    backgroundColor: colors.primary,
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
  },
  browseButton: {
    flex: 1,
    marginRight: spacing.small,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.large,
  },
});

export default Cart;
