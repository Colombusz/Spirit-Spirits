// UserOrders.jsx
import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Alert,
  ActivityIndicator,
  Image,
  ScrollView
} from 'react-native';
import {
  Appbar,
  Card,
  Text,
  Button,
  Divider,
  Chip,
  Portal,
  Dialog,
  TextInput
} from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrders, updateOrderStatus } from '../../redux/actions/orderAction';
import { createReview, updateReview } from '../../redux/actions/reviewAction';
import Toast from 'react-native-toast-message';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, spacing } from '../../components/common/theme.js';
import { getUserCredentials } from '../../utils/userStorage';

const OrderStatusBadge = ({ status }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'Pending':
        return { bg: colors.bronzeShade3, text: colors.ivory1 };
      case 'Processing':
        return { bg: colors.bronzeShade5, text: colors.ivory1 };
      case 'Shipped':
        return { bg: colors.bronzeShade7, text: colors.ivory1 };
      case 'Delivered':
        return { bg: colors.bronzeShade8, text: colors.ivory1 };
      case 'Cancelled':
        return { bg: colors.error, text: colors.ivory1 };
      default:
        return { bg: colors.bronzeShade2, text: colors.ivory1 };
    }
  };

  const { bg, text } = getStatusColor();

  return (
    <Chip style={[styles.statusChip, { backgroundColor: bg }]} textStyle={{ color: text, fontWeight: '600' }}>
      {status}
    </Chip>
  );
};

const UserOrders = () => {
  const dispatch = useDispatch();
  const { orders, loading, error } = useSelector((state) => state.order);
  const [refreshing, setRefreshing] = useState(false);

  // For order details modal
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailsVisible, setDetailsVisible] = useState(false);

  // For review modal (for a specific order item)
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [reviewRating, setReviewRating] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [isEditingReview, setIsEditingReview] = useState(false);

  // Store the current user from AsyncStorage
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // Load orders
    loadOrders();
    // Load current user credentials
    async function loadUser() {
      const user = await getUserCredentials();
      setCurrentUser(user);
    }
    loadUser();
  }, [dispatch]);

  const loadOrders = () => {
    dispatch(fetchOrders());
  };

  const handleRefresh = () => {
    setRefreshing(true);
    dispatch(fetchOrders()).finally(() => setRefreshing(false));
  };

  // User-side order actions:
  // Cancel order if Pending; confirm delivery if Shipped.
  const handleUserAction = (orderId, action) => {
    let newStatus = '';
    if (action === 'cancel') {
      newStatus = 'Cancelled';
    } else if (action === 'confirm') {
      newStatus = 'Delivered';
    }
    if (!newStatus) return;
    dispatch(updateOrderStatus({ orderId, newStatus }))
      .unwrap()
      .then((updatedOrder) => {
        Toast.show({
          type: 'success',
          text1: 'Order Updated',
          text2: `Order #${updatedOrder._id.slice(-6)} is now ${newStatus}`,
          visibilityTime: 3000,
          position: 'bottom'
        });
      })
      .catch((err) => {
        Alert.alert("Update Failed", err.message || "Couldn't update order status");
      });
  };

  // Open order details modal
  const viewOrderDetails = (order) => {
    setSelectedOrder(order);
    setDetailsVisible(true);
  };

  // Open review modal for a specific order item
  const openReviewModal = (item) => {
    setSelectedItem(item);
    // Check if the item already has a review. If so, set editing mode.
    if (item.review) {
        setIsEditingReview(true);
        setReviewRating(String(item.review.rating));
        setReviewComment(item.review.comment);
    } else {
        setIsEditingReview(false);
        setReviewRating('');
        setReviewComment('');
    }
    setReviewModalVisible(true);
  };

  // Handle review submission (create or update)
  const handleSubmitReview = () => {
    if (!reviewRating || !reviewComment) {
      Alert.alert('Incomplete', 'Please enter both rating and comment.');
      return;
    }
    // Build review data payload.
    const reviewData = {
      rating: parseFloat(reviewRating),
      comment: reviewComment,
      user: currentUser._id,
      // Assuming the order item has a liquor field or liquorDetails with an _id
      liquor: selectedItem.liquor || (selectedItem.liquorDetails && selectedItem.liquorDetails._id),
      order: selectedOrder._id,
    };

    if (isEditingReview && selectedItem.review && selectedItem.review._id) {
      // Update existing review.
      dispatch(updateReview({ reviewId: selectedItem.review._id, reviewDetails: reviewData }))
        .unwrap()
        .then((updatedReview) => {
        Toast.show({
            type: 'success',
            text1: 'Review Updated',
            text2: `Review for ${selectedItem.name} has been updated.`,
            visibilityTime: 3000,
            position: 'bottom'
        });
        setReviewModalVisible(false);
        dispatch(fetchOrders());
        })
        .catch((err) => {
        Alert.alert("Update Failed", err.message || "Couldn't update review");
        });
    } else {
      // Create new review.
      dispatch(createReview({ reviewDetails: reviewData }))
        .unwrap()
        .then((newReview) => {
          Toast.show({
            type: 'success',
            text1: 'Review Submitted',
            text2: `Review for ${selectedItem.name} submitted.`,
            visibilityTime: 3000,
            position: 'bottom'
          });
          setReviewModalVisible(false);
          // Optionally refresh orders or update local state to reflect the new review.
        })
        .catch((err) => {
          Alert.alert("Submission Failed", err.message || "Couldn't submit review");
        });
    }
  };

  // Filter orders so that only orders belonging to the current user are shown.
  const filteredOrders = currentUser && orders
    ? orders.filter(order => {
        // order.user might be a string or an object
        if (typeof order.user === 'string') {
          return order.user === currentUser._id;
        } else if (order.user && order.user._id) {
          return order.user._id === currentUser._id;
        }
        return false;
      })
    : [];

  // Render each order card for the user
  const renderOrder = ({ item }) => {
    const truncatedId = item._id.slice(-6);
    const formattedDate = new Date(item.createdAt).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });

    return (
      <Card style={styles.card} elevation={2}>
        <View style={styles.cardHeader}>
          <View style={styles.orderIdContainer}>
            <Icon name="shopping" size={18} color={colors.bronzeShade6} style={styles.headerIcon} />
            <Text style={styles.orderId}>Order #{truncatedId}</Text>
          </View>
          <OrderStatusBadge status={item.status} />
        </View>

        <Divider style={styles.divider} />

        <Card.Content style={styles.cardContent}>
          <View style={styles.infoRow}>
            <Icon name="calendar" size={18} color={colors.bronzeShade6} style={styles.infoIcon} />
            <Text style={styles.infoText}>{formattedDate}</Text>
          </View>
          <View style={styles.infoRow}>
            <Icon name="cash" size={18} color={colors.bronzeShade6} style={styles.infoIcon} />
            <Text style={styles.priceText}>₱{item.totalPrice.toFixed(2)}</Text>
          </View>
        </Card.Content>

        <Card.Actions style={styles.cardActions}>
          <Button
            mode="text"
            icon="eye"
            style={styles.viewButton}
            labelStyle={{ color: colors.bronzeShade5 }}
            onPress={() => viewOrderDetails(item)}
          >
            View Details
          </Button>
          {item.status === 'Pending' && (
            <Button
              mode="contained"
              onPress={() => handleUserAction(item._id, 'cancel')}
              style={[styles.userActionButton, { backgroundColor: colors.error }]}
              labelStyle={{ color: colors.ivory1 }}
            >
              Cancel Order
            </Button>
          )}
          {item.status === 'Shipped' && (
            <Button
              mode="contained"
              onPress={() => handleUserAction(item._id, 'confirm')}
              style={[styles.userActionButton, { backgroundColor: colors.bronzeShade4 }]}
              labelStyle={{ color: colors.ivory1 }}
            >
              Confirm Delivery
            </Button>
          )}
        </Card.Actions>
      </Card>
    );
  };

  // Render order details modal
  const renderOrderDetailsModal = () => (
    <Portal>
      <Dialog visible={detailsVisible} onDismiss={() => setDetailsVisible(false)} style={styles.dialog}>
        <Dialog.Title style={styles.dialogTitle}>Order Details</Dialog.Title>
        <Dialog.ScrollArea style={styles.scrollArea}>
          {selectedOrder ? (
            <ScrollView contentContainerStyle={styles.modalScrollContent}>
              <Text style={styles.modalLabel}>Order ID:</Text>
              <Text style={styles.modalValue}>{selectedOrder._id}</Text>
              <Text style={styles.modalLabel}>Placed On:</Text>
              <Text style={styles.modalValue}>{new Date(selectedOrder.createdAt).toLocaleDateString()}</Text>
              <Text style={styles.modalLabel}>Total Price:</Text>
              <Text style={[styles.modalValue, styles.priceHighlight]}>₱{selectedOrder.totalPrice.toFixed(2)}</Text>
              <Text style={styles.modalLabel}>Shipping Address:</Text>
              <Text style={styles.modalValue}>
                {selectedOrder.shippingAddress.street}, {selectedOrder.shippingAddress.city},{' '}
                {selectedOrder.shippingAddress.postalCode}, {selectedOrder.shippingAddress.country}
              </Text>
              <Text style={styles.modalLabel}>Payment Method:</Text>
              <Text style={styles.modalValue}>{selectedOrder.paymentMethod}</Text>
              {selectedOrder.proofOfPayment && selectedOrder.proofOfPayment.url && (
                <>
                  <Text style={styles.modalLabel}>Proof of Payment:</Text>
                  <Image
                    source={{ uri: selectedOrder.proofOfPayment.url }}
                    style={styles.proofImage}
                    resizeMode="contain"
                  />
                </>
              )}
              <Divider style={styles.modalDivider} />
              <Text style={styles.sectionTitle}>Order Items</Text>
              {selectedOrder.orderItems.map((item, index) => (
                <View key={index} style={styles.itemContainer}>
                  <View style={styles.itemHeader}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemQty}>x{item.qty}</Text>
                  </View>
                  <Text style={styles.itemPrice}>₱{item.price.toFixed(2)}</Text>
                  {item.liquorDetails && (
                    <Text style={styles.itemSubText}>
                      {item.liquorDetails.description || 'No additional details'}
                    </Text>
                  )}
                  {selectedOrder.status === 'Delivered' && (
                    <View style={styles.reviewContainer}>
                      {item.review ? (
                        <>
                          <Text style={styles.itemReview}>Review: {item.review.comment} (Rating: {item.review.rating})</Text>
                          <Button
                            mode="outlined"
                            onPress={() => openReviewModal(item)}
                            style={[styles.reviewButton, { marginTop: spacing.small }]}
                            labelStyle={{ fontSize: 12 }}
                          >
                            Edit Review
                          </Button>
                        </>
                      ) : (
                        <Button
                          mode="outlined"
                          onPress={() => openReviewModal(item)}
                          style={styles.reviewButton}
                          labelStyle={{ fontSize: 12 }}
                        >
                          Add Review
                        </Button>
                      )}
                    </View>
                  )}
                </View>
              ))}
            </ScrollView>
          ) : (
            <ActivityIndicator size="large" color={colors.primary} />
          )}
        </Dialog.ScrollArea>
        <Dialog.Actions>
          <Button onPress={() => setDetailsVisible(false)} style={styles.closeButton} labelStyle={{ color: colors.ivory1 }}>
            Close
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );

  // Render review modal for adding or editing a review for an order item
  const renderReviewModal = () => (
    <Portal>
      <Dialog visible={reviewModalVisible} onDismiss={() => setReviewModalVisible(false)} style={styles.dialog}>
        <Dialog.Title style={styles.dialogTitle}>{isEditingReview ? 'Edit Review' : 'Add Review'}</Dialog.Title>
        <Dialog.Content>
          <TextInput
            label="Rating (1-5)"
            keyboardType="numeric"
            value={reviewRating}
            onChangeText={setReviewRating}
            style={styles.textInput}
          />
          <TextInput
            label="Comment"
            multiline
            value={reviewComment}
            onChangeText={setReviewComment}
            style={[styles.textInput, { height: 80 }]}
          />
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={() => setReviewModalVisible(false)}>Cancel</Button>
          <Button onPress={handleSubmitReview}>Submit</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading orders...</Text>
        </View>
      );
    }
    if (error) {
      return (
        <View style={styles.centerContainer}>
          <Icon name="alert-circle-outline" size={48} color={colors.error} />
          <Text style={styles.errorText}>Error: {error}</Text>
          <Button mode="contained" onPress={loadOrders} style={styles.retryButton} labelStyle={{ color: colors.ivory1 }}>
            Retry
          </Button>
        </View>
      );
    }
    return (
      <FlatList
        data={filteredOrders}
        keyExtractor={(order) => order._id}
        renderItem={renderOrder}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.centerContainer}>
            <Icon name="package-variant" size={48} color={colors.bronzeShade3} />
            <Text style={styles.emptyText}>No orders found</Text>
          </View>
        }
        onRefresh={handleRefresh}
        refreshing={refreshing}
      />
    );
  };

  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.appbar}>
        <Appbar.Content
          title="My Orders"
          titleStyle={styles.appbarTitle}
          subtitle={filteredOrders?.length > 0 ? `${filteredOrders.length} orders found` : undefined}
          subtitleStyle={styles.appbarSubtitle}
        />
        <Appbar.Action icon="refresh" onPress={handleRefresh} color={colors.ivory1} />
      </Appbar.Header>
      {renderContent()}
      {renderOrderDetailsModal()}
      {renderReviewModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  // ... (your existing styles)
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  appbar: {
    backgroundColor: colors.primary,
    elevation: 4
  },
  appbarTitle: {
    color: colors.ivory1,
    fontWeight: 'bold'
  },
  appbarSubtitle: {
    color: colors.ivory2
  },
  listContent: {
    padding: spacing.medium,
    paddingBottom: spacing.large
  },
  card: {
    marginBottom: spacing.medium,
    backgroundColor: colors.ivory4,
    borderRadius: 12,
    overflow: 'hidden'
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.medium,
    backgroundColor: colors.ivory3
  },
  orderIdContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  headerIcon: {
    marginRight: spacing.small
  },
  orderId: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.bronzeShade8
  },
  divider: {
    backgroundColor: colors.bronzeShade2,
    height: 2,
    opacity: 0.2
  },
  statusChip: {
    height: 35
  },
  cardContent: {
    paddingVertical: spacing.medium
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.small
  },
  infoIcon: {
    marginRight: spacing.small,
    width: 24
  },
  infoText: {
    fontSize: 15,
    color: colors.bronzeShade7
  },
  priceText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.bronzeShade6
  },
  cardActions: {
    justifyContent: 'space-between',
    paddingHorizontal: spacing.medium,
    paddingBottom: spacing.medium,
    backgroundColor: colors.ivory5
  },
  viewButton: {
    borderColor: colors.bronzeShade3
  },
  userActionButton: {
    borderRadius: 8,
    marginLeft: spacing.small
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.large
  },
  loadingText: {
    marginTop: spacing.medium,
    color: colors.bronzeShade6,
    fontSize: 16
  },
  errorText: {
    marginTop: spacing.small,
    color: colors.error,
    textAlign: 'center',
    marginBottom: spacing.medium
  },
  emptyText: {
    marginTop: spacing.medium,
    color: colors.bronzeShade5,
    fontSize: 16
  },
  retryButton: {
    marginTop: spacing.medium,
    backgroundColor: colors.bronzeShade4
  },
  dialog: {
    maxWidth: '90%',
    width: '90%',
    borderRadius: 12,
    backgroundColor: colors.ivory2
  },
  dialogTitle: {
    textAlign: 'center',
    color: colors.bronzeShade7,
    fontWeight: 'bold',
    fontSize: 18,
    paddingBottom: spacing.small
  },
  scrollArea: {
    maxHeight: '80%'
  },
  modalScrollContent: {
    paddingHorizontal: spacing.small,
    paddingBottom: spacing.medium
  },
  modalLabel: {
    fontSize: 14,
    color: colors.bronzeShade7,
    fontWeight: '600',
    marginTop: spacing.small
  },
  modalValue: {
    fontSize: 14,
    color: colors.bronzeShade8,
    marginBottom: spacing.small
  },
  priceHighlight: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.bronzeShade6
  },
  modalDivider: {
    backgroundColor: colors.bronzeShade3,
    height: 1,
    opacity: 0.3,
    marginVertical: spacing.small
  },
  proofImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginVertical: spacing.small
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.bronzeShade6,
    marginVertical: spacing.small,
    borderBottomWidth: 1,
    borderBottomColor: colors.bronzeShade2,
    paddingBottom: 4
  },
  itemContainer: {
    marginBottom: spacing.medium,
    backgroundColor: colors.ivory4,
    padding: spacing.small,
    borderRadius: 8
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  itemName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.bronzeShade8,
    flex: 1
  },
  itemQty: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.bronzeShade7,
    marginLeft: spacing.medium
  },
  itemPrice: {
    fontSize: 14,
    color: colors.bronzeShade6,
    fontWeight: '600',
    marginTop: 2
  },
  itemSubText: {
    fontSize: 13,
    color: colors.bronzeShade5,
    marginTop: 4
  },
  reviewContainer: {
    marginTop: spacing.small,
    alignItems: 'flex-start'
  },
  reviewButton: {
    marginTop: spacing.small,
    borderRadius: 6,
    borderColor: colors.primary
  },
  textInput: {
    backgroundColor: colors.ivory1,
    marginVertical: spacing.small
  },
  closeButton: {
    backgroundColor: colors.bronzeShade5,
    borderRadius: 8,
    paddingHorizontal: spacing.medium
  }
});

export default UserOrders;
