// AdminOrders.jsx
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, Alert, ActivityIndicator, Image, ScrollView } from 'react-native';
import { Appbar, Card, Title, Paragraph, Button, Menu, Divider, Chip, Text, Portal, Dialog } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrders, updateOrderStatus } from '../../redux/actions/orderAction';
import Toast from 'react-native-toast-message';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, spacing } from '../../components/common/theme.js';

const OrderStatusBadge = ({ status }) => {
  const getStatusColor = () => {
    switch(status) {
      case 'Pending': return { bg: colors.bronzeShade3, text: colors.ivory1 };
      case 'Processing': return { bg: colors.bronzeShade5, text: colors.ivory1 };
      case 'Shipped': return { bg: colors.bronzeShade7, text: colors.ivory1 };
      case 'Delivered': return { bg: colors.bronzeShade8, text: colors.ivory1 };
      default: return { bg: colors.bronzeShade2, text: colors.ivory1 };
    }
  };

  const { bg, text } = getStatusColor();
  
  return (
    <Chip 
      style={[styles.statusChip, { backgroundColor: bg }]}
      textStyle={{ color: text, fontWeight: '600' }}
    >
      {status}
    </Chip>
  );
};

const AdminOrders = () => {
  const dispatch = useDispatch();
  const { orders, loading, error } = useSelector((state) => state.order);
  const [menuVisible, setMenuVisible] = useState({});
  const [refreshing, setRefreshing] = useState(false);
  // For viewing order details
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailsVisible, setDetailsVisible] = useState(false);

  useEffect(() => {
    loadOrders();
  }, [dispatch]);

  const loadOrders = () => {
    dispatch(fetchOrders());
  };

  const handleRefresh = () => {
    setRefreshing(true);
    dispatch(fetchOrders())
      .finally(() => setRefreshing(false));
  };

  const toggleMenu = (orderId) => {
    setMenuVisible((prev) => ({ ...prev, [orderId]: !prev[orderId] }));
  };

  const handleStatusUpdate = (orderId, newStatus) => {
    dispatch(updateOrderStatus({ orderId, newStatus }))
      .unwrap()
      .then((updatedOrder) => {
        Toast.show({
          type: 'success',
          text1: 'Order Status Updated',
          text2: `Order #${updatedOrder._id.slice(-6)} → ${newStatus}`,
          visibilityTime: 3000,
          position: 'bottom',
        });
      })
      .catch((err) => {
        Alert.alert("Update Failed", err.message || "Couldn't update the order status");
      });
    toggleMenu(orderId);
  };

  // Allowed status transitions
  const allowedNextStatus = {
    Pending: ['Processing'],
    Processing: ['Shipped'],
    Shipped: ['Delivered'],
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'Pending': return 'clock-outline';
      case 'Processing': return 'progress-check';
      case 'Shipped': return 'truck-delivery-outline';
      case 'Delivered': return 'check-circle-outline';
      default: return 'help-circle-outline';
    }
  };

  // Open order details modal
  const viewOrderDetails = (order) => {
    setSelectedOrder(order);
    setDetailsVisible(true);
  };

  // Render individual order card
  const renderOrder = ({ item }) => {
    const availableStatuses = allowedNextStatus[item.status] || [];
    const truncatedId = item._id.slice(-6); // Show only last 6 characters of ID
    const formattedDate = new Date(item.createdAt).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
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
            <Icon name="account" size={18} color={colors.bronzeShade6} style={styles.infoIcon} />
            <Text style={styles.infoText}>{item.user}</Text>
          </View>
          
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
            labelStyle={{color: colors.bronzeShade5}}
            onPress={() => viewOrderDetails(item)}
          >
            View Details
          </Button>
          
          <Menu
            visible={menuVisible[item._id]}
            onDismiss={() => toggleMenu(item._id)}
            contentStyle={styles.menuContent}
            anchor={
              <Button 
                onPress={() => toggleMenu(item._id)} 
                mode="contained"
                disabled={availableStatuses.length === 0}
                icon={availableStatuses.length > 0 ? "chevron-up" : "lock"}
                style={[
                  styles.updateButton, 
                  { backgroundColor: availableStatuses.length > 0 ? colors.bronzeShade4 : colors.placeholder }
                ]}
                labelStyle={{ color: colors.ivory1 }}
              >
                {availableStatuses.length > 0 ? "Update Status" : "No Updates Available"}
              </Button>
            }
          >
            {availableStatuses.map((status) => (
              <Menu.Item
                key={status}
                onPress={() => handleStatusUpdate(item._id, status)}
                title={status}
                titleStyle={styles.menuItem}
                icon={() => <Icon name={getStatusIcon(status)} size={20} color={colors.bronzeShade5} />}
              />
            ))}
          </Menu>
        </Card.Actions>
      </Card>
    );
  };

  // Render modal with order details
  const renderOrderDetailsModal = () => (
    <Portal>
      <Dialog 
        visible={detailsVisible} 
        onDismiss={() => setDetailsVisible(false)}
        style={styles.dialog}
      >
        <Dialog.Title style={styles.dialogTitle}>
          <Icon name="clipboard-text-outline" size={20} color={colors.bronzeShade6} style={{marginRight: 8}} />
          Order Details
        </Dialog.Title>
        
        <Dialog.ScrollArea style={styles.scrollArea}>
          {selectedOrder ? (
            <ScrollView 
              contentContainerStyle={styles.modalScrollContent}
              showsVerticalScrollIndicator={true}
            >
              <View style={styles.detailSection}>
                <Text style={styles.sectionTitle}>Order Information</Text>
                
                <View style={styles.detailRow}>
                  <Text style={styles.modalLabel}>Order ID:</Text>
                  <Text style={styles.modalValue}>{selectedOrder._id}</Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Text style={styles.modalLabel}>Placed On:</Text>
                  <Text style={styles.modalValue}>
                    {new Date(selectedOrder.createdAt).toLocaleDateString('en-US', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Text style={styles.modalLabel}>User:</Text>
                  <Text style={styles.modalValue}>{selectedOrder.user}</Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Text style={styles.modalLabel}>Status:</Text>
                  <OrderStatusBadge status={selectedOrder.status} />
                </View>
                
                <View style={styles.detailRow}>
                  <Text style={styles.modalLabel}>Total Price:</Text>
                  <Text style={[styles.modalValue, styles.priceHighlight]}>
                    ₱{selectedOrder.totalPrice.toFixed(2)}
                  </Text>
                </View>
              </View>
              
              <Divider style={styles.modalDivider} />
              
              <View style={styles.detailSection}>
                <Text style={styles.sectionTitle}>Shipping Details</Text>
                
                <View style={styles.addressCard}>
                  <Icon name="map-marker" size={20} color={colors.bronzeShade6} />
                  <View style={styles.addressContent}>
                    <Text style={styles.modalValue}>
                      {selectedOrder.shippingAddress.street}
                    </Text>
                    <Text style={styles.modalValue}>
                      {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.postalCode}
                    </Text>
                    <Text style={styles.modalValue}>
                      {selectedOrder.shippingAddress.country}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.detailRow}>
                  <Text style={styles.modalLabel}>Payment Method:</Text>
                  <Text style={styles.modalValue}>{selectedOrder.paymentMethod}</Text>
                </View>
              </View>
              
              {selectedOrder.proofOfPayment && selectedOrder.proofOfPayment.url && (
                <>
                  <Divider style={styles.modalDivider} />
                  
                  <View style={styles.detailSection}>
                    <Text style={styles.sectionTitle}>Proof of Payment</Text>
                    <Image 
                      source={{ uri: selectedOrder.proofOfPayment.url }} 
                      style={styles.proofImage} 
                      resizeMode="contain"
                    />
                  </View>
                </>
              )}
              
              <Divider style={styles.modalDivider} />
              
              <View style={styles.detailSection}>
                <Text style={styles.sectionTitle}>Order Items</Text>
                
                {selectedOrder.orderItems.map((item, index) => (
                  <View key={index} style={styles.itemContainer}>
                    <View style={styles.itemHeader}>
                      <Text style={styles.itemName}>{item.name}</Text>
                      <Text style={styles.itemQty}>x{item.qty}</Text>
                    </View>
                    
                    <Text style={styles.itemPrice}>₱{item.price.toFixed(2)}</Text>
                    
                    {item.liquorDetails && (
                      <View style={styles.itemDetails}>
                        <Icon name="information-outline" size={14} color={colors.bronzeShade5} />
                        <Text style={styles.itemSubText}>
                          {item.liquorDetails.description || 'No additional details'}
                        </Text>
                      </View>
                    )}
                    
                    {/* User review section with improved styling */}
                    {item.review ? (
                      <View style={styles.reviewContainer}>
                        <Icon name="star" size={14} color={colors.bronzeShade4} />
                        <Text style={styles.itemReview}>"{item.review}"</Text>
                      </View>
                    ) : (
                      <View style={styles.reviewContainer}>
                        <Icon name="star-outline" size={14} color={colors.bronzeShade3} />
                        <Text style={styles.noReview}>No review available</Text>
                      </View>
                    )}
                  </View>
                ))}
              </View>
            </ScrollView>
          ) : (
            <ActivityIndicator size="large" color={colors.primary} />
          )}
        </Dialog.ScrollArea>
        
        <Dialog.Actions>
          <Button 
            mode="contained" 
            onPress={() => setDetailsVisible(false)}
            style={styles.closeButton}
            labelStyle={{color: colors.ivory1}}
          >
            Close
          </Button>
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
          <Button 
            mode="contained" 
            onPress={loadOrders}
            style={styles.retryButton}
            labelStyle={{color: colors.ivory1}}
          >
            Retry
          </Button>
        </View>
      );
    }
    
    return (
      <FlatList
        data={orders}
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
          title="Orders Management" 
          titleStyle={styles.appbarTitle} 
          subtitle={orders?.length > 0 ? `${orders.length} orders found` : undefined}
          subtitleStyle={styles.appbarSubtitle}
        />
        <Appbar.Action icon="refresh" onPress={handleRefresh} color={colors.ivory1} />
      </Appbar.Header>
      
      {renderContent()}
      {renderOrderDetailsModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  appbar: {
    backgroundColor: colors.primary,
    elevation: 4,
  },
  appbarTitle: {
    color: colors.ivory1,
    fontWeight: 'bold',
  },
  appbarSubtitle: {
    color: colors.ivory2,
  },
  listContent: {
    padding: spacing.medium,
    paddingBottom: spacing.large,
  },
  card: {
    marginBottom: spacing.medium,
    backgroundColor: colors.ivory4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.medium,
    backgroundColor: colors.ivory3,
  },
  orderIdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    marginRight: spacing.small,
  },
  orderId: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.bronzeShade8,
  },
  divider: {
    backgroundColor: colors.bronzeShade2,
    height: 2,
    opacity: 0.2,
  },
  statusChip: {
    height: 35,
  },
  cardContent: {
    paddingVertical: spacing.medium,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.small,
  },
  infoIcon: {
    marginRight: spacing.small,
    width: 24,
  },
  infoText: {
    fontSize: 15,
    color: colors.bronzeShade7,
  },
  priceText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.bronzeShade6,
  },
  cardActions: {
    justifyContent: 'space-between',
    paddingHorizontal: spacing.medium,
    paddingBottom: spacing.medium,
    backgroundColor: colors.ivory5,
  },
  viewButton: {
    borderColor: colors.bronzeShade3,
  },
  updateButton: {
    borderRadius: 8,
  },
  menuContent: {
    backgroundColor: colors.ivory2,
  },
  menuItem: {
    color: colors.bronzeShade7,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.large,
  },
  loadingText: {
    marginTop: spacing.medium,
    color: colors.bronzeShade6,
    fontSize: 16,
  },
  errorText: {
    marginTop: spacing.small,
    color: colors.error,
    textAlign: 'center',
    marginBottom: spacing.medium,
  },
  emptyText: {
    marginTop: spacing.medium,
    color: colors.bronzeShade5,
    fontSize: 16,
  },
  retryButton: {
    marginTop: spacing.medium,
    backgroundColor: colors.bronzeShade4,
  },
  // Styles for modal order details
  modalLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: spacing.small,
    color: colors.bronzeShade7,
  },
  modalValue: {
    fontSize: 14,
    marginBottom: spacing.small,
    color: colors.bronzeShade8,
  },
  proofImage: {
    width: '100%',
    height: 200,
    marginVertical: spacing.medium,
  },
  itemRow: {
    marginBottom: spacing.small,
    borderBottomWidth: 1,
    borderBottomColor: colors.bronzeShade2,
    paddingBottom: spacing.small,
  },
  itemText: {
    fontSize: 14,
    color: colors.bronzeShade8,
  },
  itemSubText: {
    fontSize: 12,
    color: colors.bronzeShade6,
    marginLeft: spacing.small,
  },
  itemReview: {
    fontSize: 12,
    color: colors.bronzeShade5,
    marginLeft: spacing.small,
    fontStyle: 'italic',
  },
  // Add these styles to your StyleSheet

// Modal and dialog styles
dialog: {
    maxWidth: '90%',
    width: '90%',
    borderRadius: 12,
    backgroundColor: colors.ivory2,
  },
  dialogTitle: {
    textAlign: 'center',
    color: colors.bronzeShade7,
    fontWeight: 'bold',
    fontSize: 18,
    paddingBottom: spacing.small,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollArea: {
    maxHeight: '80%', // Limit height to ensure dialog actions are visible
  },
  modalScrollContent: {
    paddingHorizontal: spacing.small,
    paddingBottom: spacing.medium,
  },
  detailSection: {
    marginVertical: spacing.small,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.bronzeShade6,
    marginBottom: spacing.small,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.bronzeShade2,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  modalLabel: {
    fontSize: 14,
    color: colors.bronzeShade7,
    fontWeight: '600',
  },
  modalValue: {
    fontSize: 14,
    color: colors.bronzeShade8,
    flex: 1,
    textAlign: 'right',
  },
  priceHighlight: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.bronzeShade6,
  },
  modalDivider: {
    backgroundColor: colors.bronzeShade3,
    height: 1,
    opacity: 0.3,
    marginVertical: spacing.small,
  },
  addressCard: {
    flexDirection: 'row',
    backgroundColor: colors.ivory4,
    padding: spacing.small,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: colors.bronzeShade4,
    marginVertical: spacing.small,
  },
  addressContent: {
    marginLeft: spacing.small,
    flex: 1,
  },
  proofImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginVertical: spacing.small,
  },
  itemContainer: {
    marginBottom: spacing.medium,
    backgroundColor: colors.ivory4,
    padding: spacing.small,
    borderRadius: 8,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  itemName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.bronzeShade8,
    flex: 1,
  },
  itemQty: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.bronzeShade7,
    marginLeft: spacing.medium,
  },
  itemPrice: {
    fontSize: 14,
    color: colors.bronzeShade6,
    fontWeight: '600',
    marginTop: 2,
  },
  itemDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  itemSubText: {
    fontSize: 13,
    color: colors.bronzeShade5,
    marginLeft: 4,
    flex: 1,
  },
  reviewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: colors.bronzeShade2,
    opacity: 0.8,
  },
  itemReview: {
    fontSize: 13,
    color: colors.bronzeShade6,
    marginLeft: 4,
    fontStyle: 'italic',
    flex: 1,
  },
  noReview: {
    fontSize: 13,
    color: colors.bronzeShade4,
    marginLeft: 4,
    fontStyle: 'italic',
  },
  closeButton: {
    backgroundColor: colors.bronzeShade5,
    borderRadius: 8,
    paddingHorizontal: spacing.medium,
  },
});

export default AdminOrders;
