// cart.jsx
import React, { useEffect } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Title, Paragraph, Button } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { useAsyncSQLiteContext } from '../../utils/asyncSQliteProvider';
import { colors, spacing, globalStyles } from '../../components/common/theme';
import { fetchCartItems } from '../../redux/actions/cartAction'; 

const Cart = () => {
  const dispatch = useDispatch();
  const db = useAsyncSQLiteContext();
  const { items, loading, error } = useSelector((state) => state.cart);

  // Fetch cart items from SQLite when the component mounts
  useEffect(() => {
    dispatch(fetchCartItems({ db }));
  }, [dispatch, db]);

  const renderCartItem = ({ item }) => (
    <View style={styles.cartItem}>
      <Title style={styles.itemTitle}>{item.name}</Title>
      <Paragraph>Quantity: {item.quantity}</Paragraph>
      <Paragraph>Price: ${item.price}</Paragraph>
    </View>
  );

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
        <Button mode="contained" onPress={() => dispatch(fetchCartItems({ db }))}>
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
  },
  cartItem: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: spacing.medium,
    marginBottom: spacing.medium,
    elevation: 2,
  },
  itemTitle: {
    marginBottom: spacing.small,
    color: colors.primary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.large,
  },
});

export default Cart;
