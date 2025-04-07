import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ScrollView, SafeAreaView, TouchableOpacity, Modal } from 'react-native';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchLiquors } from '../../redux/actions/liquorAction';
import { fetchOrders } from '../../redux/actions/orderAction';
import { getAllPromos } from '../../redux/actions/promoAction';
import CardItem from '../../components/admin/admincard';
import { Searchbar, FAB, Chip, Menu, Button, Divider } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { deleteLiquor } from '../../redux/actions/liquorAction';
import { useAsyncSQLiteContext } from '../../utils/asyncSQliteProvider';
import { Alert } from 'react-native';
import { colors } from '../../components/common/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function HomeIndex() {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const db = useAsyncSQLiteContext();

  // Existing liquors state and filtering
  const { liquors, loading, error } = useSelector((state) => state.liquor);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredLiquors, setFilteredLiquors] = useState([]);
  
  // Dashboard states from orders and promos
  const { orders } = useSelector((state) => state.order);
  const { promos } = useSelector((state) => state.promo);

  // Filter states for liquors
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [categoryMenuVisible, setCategoryMenuVisible] = useState(false);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 });
  const [priceMenuVisible, setPriceMenuVisible] = useState(false);
  const [stockFilter, setStockFilter] = useState('All');
  const [stockMenuVisible, setStockMenuVisible] = useState(false);
  const [activeFilters, setActiveFilters] = useState([]);

  // Modal visibility states
  const [metricsModalVisible, setMetricsModalVisible] = useState(false);
  const [orderStatusModalVisible, setOrderStatusModalVisible] = useState(false);
  const [inventoryStatusModalVisible, setInventoryStatusModalVisible] = useState(false);

  // Categories, price ranges and stock options
  const categories = [
    'All',
    'Vodka',
    'Rum',
    'Tequila',
    'Whiskey',
    'Gin',
    'Brandy',
    'Liqueur',
    'Beer',
    'Wine',
    'Champagne',
    'Sake',
    'Soju',
    'Baijiu',
    'Whisky',
    'Other',
  ];
  const priceRanges = [
    { label: 'All Prices', min: 0, max: 10000 },
    { label: 'Under ₱1000', min: 0, max: 1000 },
    { label: '₱1000 - ₱2000', min: 1000, max: 2000 },
    { label: '₱2000 - ₱5000', min: 2000, max: 5000 },
    { label: 'Over ₱5000', min: 5000, max: 10000 },
  ];
  const stockOptions = [
    { label: 'All', value: 'All' },
    { label: 'In Stock', value: 'InStock' },
    { label: 'Low Stock (≤ 10)', value: 'LowStock' },
    { label: 'Out of Stock', value: 'OutOfStock' },
  ];

  // Fetch liquors, orders and promos when component mounts or screen is focused
  useEffect(() => {
    dispatch(fetchLiquors());
    dispatch(fetchOrders({ db }));
    dispatch(getAllPromos());
  }, [dispatch]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      console.log('Screen is focused, refreshing data...');
      dispatch(fetchLiquors());
      dispatch(fetchOrders({ db }));
      dispatch(getAllPromos());
    });
    return unsubscribe;
  }, [navigation, dispatch, db]);

  // Apply filters and search on liquors
  useEffect(() => {
    if (liquors && liquors.length > 0) {
      let filtered = [...liquors];
      if (searchQuery.trim() !== '') {
        filtered = filtered.filter((liquor) =>
          liquor.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (liquor.name && liquor.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (liquor.description && liquor.description.toLowerCase().includes(searchQuery.toLowerCase()))
        );
      }
      if (categoryFilter !== 'All') {
        filtered = filtered.filter((liquor) => liquor.category === categoryFilter);
      }
      filtered = filtered.filter((liquor) => 
        liquor.price >= priceRange.min && liquor.price <= priceRange.max
      );
      if (stockFilter !== 'All') {
        if (stockFilter === 'InStock') {
          filtered = filtered.filter((liquor) => liquor.stock > 0);
        } else if (stockFilter === 'LowStock') {
          filtered = filtered.filter((liquor) => liquor.stock > 0 && liquor.stock <= 10);
        } else if (stockFilter === 'OutOfStock') {
          filtered = filtered.filter((liquor) => liquor.stock === 0);
        }
      }
      setFilteredLiquors(filtered);
    } else {
      setFilteredLiquors([]);
    }
    updateActiveFilters();
  }, [searchQuery, liquors, categoryFilter, priceRange, stockFilter]);

  // Update active filters for display
  const updateActiveFilters = () => {
    const filters = [];
    if (categoryFilter !== 'All') {
      filters.push({ key: 'category', label: categoryFilter });
    }
    const selectedPriceRange = priceRanges.find(
      range => range.min === priceRange.min && range.max === priceRange.max
    );
    if (selectedPriceRange && selectedPriceRange.label !== 'All Prices') {
      filters.push({ key: 'price', label: selectedPriceRange.label });
    }
    if (stockFilter !== 'All') {
      const stockOption = stockOptions.find(option => option.value === stockFilter);
      if (stockOption) {
        filters.push({ key: 'stock', label: stockOption.label });
      }
    }
    setActiveFilters(filters);
  };

  const onChangeSearch = (query) => setSearchQuery(query);

  const handleAddNewLiquor = () => {
    navigation.navigate('CreateLiquor');
  };

  const handleDeleteLiquor = (id) => {
    Alert.alert(
      "Confirm Deletion",
      "Are you sure you want to delete this liquor?",
      [
        { text: "Cancel", onPress: () => console.log("Deletion canceled"), style: "cancel" },
        {
          text: "Delete",
          onPress: async () => {
            try {
              await dispatch(deleteLiquor({ liquorId: id, db }));
              setFilteredLiquors((prevLiquors) =>
                prevLiquors.filter((liquor) => liquor._id !== id)
              );
              await dispatch(fetchLiquors());
            } catch (error) {
              console.error("Error during deletion:", error);
            }
          }
        }
      ],
      { cancelable: true }
    );
  };

  const resetAllFilters = () => {
    setCategoryFilter('All');
    setPriceRange({ min: 0, max: 10000 });
    setStockFilter('All');
    setSearchQuery('');
  };

  const removeFilter = (key) => {
    if (key === 'category') setCategoryFilter('All');
    else if (key === 'price') setPriceRange({ min: 0, max: 10000 });
    else if (key === 'stock') setStockFilter('All');
  };

  // Count orders by status (ensure status strings match your API's data)
  const pendingCount = orders?.filter(order => order.status?.toLowerCase() === 'pending').length || 0;
  const shippingCount = orders?.filter(order => order.status?.toLowerCase() === 'shipping').length || 0;
  const shippedCount = orders?.filter(order => order.status?.toLowerCase() === 'shipped').length || 0;
  const cancelledCount = orders?.filter(order => order.status?.toLowerCase() === 'cancelled').length || 0;
  const deliveredCount = orders?.filter(order => order.status?.toLowerCase() === 'delivered').length || 0;

  // Count promos
  const promosCount = promos?.length || 0;
  
  // Calculate total sales (from delivered orders)
  const deliveredOrders = orders?.filter(order => order.status?.toLowerCase() === 'delivered') || [];
  const totalSales = deliveredOrders.reduce((total, order) => {
    return total + (order.total || 0);
  }, 0);
  
  // Calculate total inventory value
  const totalInventoryValue = liquors?.reduce((total, liquor) => {
    return total + (liquor.price * liquor.stock || 0);
  }, 0) || 0;
  
  // Calculate low stock items
  const lowStockCount = liquors?.filter(liquor => liquor.stock > 0 && liquor.stock <= 10).length || 0;
  const outOfStockCount = liquors?.filter(liquor => liquor.stock === 0).length || 0;

  // Render Metrics Modal
  const renderMetricsModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={metricsModalVisible}
      onRequestClose={() => setMetricsModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Metrics Dashboard</Text>
            <TouchableOpacity onPress={() => setMetricsModalVisible(false)}>
              <MaterialCommunityIcons name="close" size={24} color={colors.bronzeShade7} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalScrollView}>
            <View style={styles.metricsContainer}>
              {/* Sales Card */}
              <View style={styles.metricModalCard}>
                <View style={styles.metricIconContainer}>
                  <MaterialCommunityIcons name="cash-register" size={24} color={colors.ivory1} />
                </View>
                <View style={styles.metricContent}>
                  <Text style={styles.metricLabel}>Total Sales</Text>
                  <Text style={styles.metricValue}>₱{totalSales.toLocaleString()}</Text>
                </View>
              </View>

              {/* Inventory Value Card */}
              <View style={styles.metricModalCard}>
                <View style={styles.metricIconContainer}>
                  <MaterialCommunityIcons name="package-variant" size={24} color={colors.ivory1} />
                </View>
                <View style={styles.metricContent}>
                  <Text style={styles.metricLabel}>Inventory Value</Text>
                  <Text style={styles.metricValue}>₱{totalInventoryValue.toLocaleString()}</Text>
                </View>
              </View>

              {/* Orders Card */}
              <View style={styles.metricModalCard}>
                <View style={styles.metricIconContainer}>
                  <MaterialCommunityIcons name="truck-delivery" size={24} color={colors.ivory1} />
                </View>
                <View style={styles.metricContent}>
                  <Text style={styles.metricLabel}>Delivered Orders</Text>
                  <Text style={styles.metricValue}>{deliveredCount}</Text>
                </View>
              </View>

              {/* Active Promos Card */}
              <View style={styles.metricModalCard}>
                <View style={styles.metricIconContainer}>
                  <MaterialCommunityIcons name="tag-multiple" size={24} color={colors.ivory1} />
                </View>
                <View style={styles.metricContent}>
                  <Text style={styles.metricLabel}>Active Promos</Text>
                  <Text style={styles.metricValue}>{promosCount}</Text>
                </View>
              </View>
            </View>
          </ScrollView>
          
          <Button
            mode="contained"
            onPress={() => setMetricsModalVisible(false)}
            style={styles.modalCloseButton}
            labelStyle={styles.modalCloseButtonText}
          >
            Close
          </Button>
        </View>
      </View>
    </Modal>
  );

  // Render Order Status Modal
  const renderOrderStatusModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={orderStatusModalVisible}
      onRequestClose={() => setOrderStatusModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Order Status Overview</Text>
            <TouchableOpacity onPress={() => setOrderStatusModalVisible(false)}>
              <MaterialCommunityIcons name="close" size={24} color={colors.bronzeShade7} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.modalScrollView}>
            <View style={styles.orderStatusGrid}>
              <View style={styles.statusItem}>
                <View style={[styles.statusIndicator, styles.pendingIndicator]} />
                <Text style={styles.statusLabel}>Pending</Text>
                <Text style={styles.statusValue}>{pendingCount}</Text>
              </View>
              <View style={styles.statusItem}>
                <View style={[styles.statusIndicator, styles.shippingIndicator]} />
                <Text style={styles.statusLabel}>Shipping</Text>
                <Text style={styles.statusValue}>{shippingCount}</Text>
              </View>
              <View style={styles.statusItem}>
                <View style={[styles.statusIndicator, styles.shippedIndicator]} />
                <Text style={styles.statusLabel}>Shipped</Text>
                <Text style={styles.statusValue}>{shippedCount}</Text>
              </View>
              <View style={styles.statusItem}>
                <View style={[styles.statusIndicator, styles.deliveredIndicator]} />
                <Text style={styles.statusLabel}>Delivered</Text>
                <Text style={styles.statusValue}>{deliveredCount}</Text>
              </View>
              <View style={styles.statusItem}>
                <View style={[styles.statusIndicator, styles.cancelledIndicator]} />
                <Text style={styles.statusLabel}>Cancelled</Text>
                <Text style={styles.statusValue}>{cancelledCount}</Text>
              </View>
            </View>
            
            <View style={styles.orderDetailsSection}>
              <Text style={styles.sectionSubHeader}>Order Overview</Text>
              <View style={styles.orderDetailsItem}>
                <Text style={styles.orderDetailsLabel}>Total Orders</Text>
                <Text style={styles.orderDetailsValue}>{orders?.length || 0}</Text>
              </View>
              <View style={styles.orderDetailsItem}>
                <Text style={styles.orderDetailsLabel}>Average Order Value</Text>
                <Text style={styles.orderDetailsValue}>
                  ₱{orders?.length ? (totalSales / deliveredCount).toFixed(2) : '0'}
                </Text>
              </View>
              <View style={styles.orderDetailsItem}>
                <Text style={styles.orderDetailsLabel}>Cancellation Rate</Text>
                <Text style={styles.orderDetailsValue}>
                  {orders?.length ? ((cancelledCount / orders.length) * 100).toFixed(1) : '0'}%
                </Text>
              </View>
            </View>
          </View>
          
          <Button
            mode="contained"
            onPress={() => setOrderStatusModalVisible(false)}
            style={styles.modalCloseButton}
            labelStyle={styles.modalCloseButtonText}
          >
            Close
          </Button>
        </View>
      </View>
    </Modal>
  );

  // Render Inventory Status Modal
  const renderInventoryStatusModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={inventoryStatusModalVisible}
      onRequestClose={() => setInventoryStatusModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Inventory Status</Text>
            <TouchableOpacity onPress={() => setInventoryStatusModalVisible(false)}>
              <MaterialCommunityIcons name="close" size={24} color={colors.bronzeShade7} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.modalScrollView}>
            <View style={styles.inventoryStatusGrid}>
              <View style={styles.inventoryModalItem}>
                <Text style={styles.inventoryStatusLabel}>Total Products</Text>
                <Text style={styles.inventoryStatusValue}>{liquors?.length || 0}</Text>
              </View>
              <View style={styles.inventoryModalItem}>
                <Text style={styles.inventoryStatusLabel}>Low Stock</Text>
                <Text style={[styles.inventoryStatusValue, lowStockCount > 0 ? styles.warningText : null]}>
                  {lowStockCount}
                </Text>
              </View>
              <View style={styles.inventoryModalItem}>
                <Text style={styles.inventoryStatusLabel}>Out of Stock</Text>
                <Text style={[styles.inventoryStatusValue, outOfStockCount > 0 ? styles.errorText : null]}>
                  {outOfStockCount}
                </Text>
              </View>
            </View>
            
            <View style={styles.inventoryDetailsSection}>
              <Text style={styles.sectionSubHeader}>Inventory Details</Text>
              <View style={styles.inventoryDetailsItem}>
                <Text style={styles.inventoryDetailsLabel}>Total Inventory Value</Text>
                <Text style={styles.inventoryDetailsValue}>₱{totalInventoryValue.toLocaleString()}</Text>
              </View>
              <View style={styles.inventoryDetailsItem}>
                <Text style={styles.inventoryDetailsLabel}>Avg. Product Price</Text>
                <Text style={styles.inventoryDetailsValue}>
                  ₱{liquors?.length ? (liquors.reduce((sum, item) => sum + item.price, 0) / liquors.length).toFixed(2) : '0'}
                </Text>
              </View>
              <View style={styles.inventoryDetailsItem}>
                <Text style={styles.inventoryDetailsLabel}>Stock Health</Text>
                <Text style={styles.inventoryDetailsValue}>
                  {liquors?.length ? 
                    (((liquors.length - lowStockCount - outOfStockCount) / liquors.length) * 100).toFixed(1) : '0'}%
                </Text>
              </View>
            </View>
            
            {lowStockCount > 0 && (
              <View style={styles.inventoryAlertSection}>
                <Text style={styles.inventoryAlertTitle}>
                  <MaterialCommunityIcons name="alert" size={18} color="#FF9800" /> Low Stock Alert
                </Text>
                <Text style={styles.inventoryAlertText}>
                  {lowStockCount} {lowStockCount === 1 ? 'product is' : 'products are'} running low on stock.
                </Text>
              </View>
            )}
            
            {outOfStockCount > 0 && (
              <View style={[styles.inventoryAlertSection, styles.outOfStockAlert]}>
                <Text style={styles.inventoryAlertTitle}>
                  <MaterialCommunityIcons name="alert-circle" size={18} color={colors.error} /> Out of Stock Alert
                </Text>
                <Text style={styles.inventoryAlertText}>
                  {outOfStockCount} {outOfStockCount === 1 ? 'product is' : 'products are'} out of stock.
                </Text>
              </View>
            )}
          </View>
          
          <Button
            mode="contained"
            onPress={() => setInventoryStatusModalVisible(false)}
            style={styles.modalCloseButton}
            labelStyle={styles.modalCloseButtonText}
          >
            Close
          </Button>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      
      {/* Dashboard Header */}
      <View style={styles.dashboardHeader}>
        <Text style={styles.mainHeaderText}>Liquor Store Admin Dashboard</Text>
      </View>
      
      {/* Dashboard Quick Action Buttons */}
      <View style={styles.quickActionsContainer}>
        <TouchableOpacity 
          style={styles.quickActionButton} 
          onPress={() => setMetricsModalVisible(true)}
        >
          <View style={styles.quickActionIcon}>
            <MaterialCommunityIcons name="chart-bar" size={22} color={colors.ivory1} />
          </View>
          <Text style={styles.quickActionText}>Metrics</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.quickActionButton} 
          onPress={() => setOrderStatusModalVisible(true)}
        >
          <View style={styles.quickActionIcon}>
            <MaterialCommunityIcons name="clipboard-list" size={22} color={colors.ivory1} />
          </View>
          <Text style={styles.quickActionText}>Order Status</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.quickActionButton} 
          onPress={() => setInventoryStatusModalVisible(true)}
        >
          <View style={styles.quickActionIcon}>
            <MaterialCommunityIcons name="bottle-wine" size={22} color={colors.ivory1} />
          </View>
          <Text style={styles.quickActionText}>Inventory</Text>
        </TouchableOpacity>
      </View>
      
      {/* Render Modals */}
      {renderMetricsModal()}
      {renderOrderStatusModal()}
      {renderInventoryStatusModal()}
      
      {/* Liquor Inventory Section */}
      <View style={styles.inventoryListHeader}>
        <View style={styles.sectionHeader}>
          <MaterialCommunityIcons name="flask-outline" size={22} color={colors.bronzeShade1} />
          <Text style={styles.sectionHeaderText}>Liquor Inventory</Text>
        </View>
        <Searchbar
          placeholder="Search liquors..."
          onChangeText={onChangeSearch}
          value={searchQuery}
          style={styles.searchBar}
          inputStyle={styles.searchInput}
          iconColor={colors.bronzeShade7}
        />
      </View>
      
      <View style={styles.filtersContainer}>
        <View style={styles.filterButtons}>
          <Menu
            visible={categoryMenuVisible}
            onDismiss={() => setCategoryMenuVisible(false)}
            anchor={
              <TouchableOpacity 
                style={[styles.filterButton, categoryFilter !== 'All' && styles.activeFilterButton]} 
                onPress={() => setCategoryMenuVisible(true)}
              >
                <MaterialCommunityIcons name="filter-variant" size={18} color={categoryFilter !== 'All' ? colors.ivory1 : colors.bronzeShade7} />
                <Text style={[styles.filterButtonText, categoryFilter !== 'All' && styles.activeFilterButtonText]}>Category</Text>
              </TouchableOpacity>
            }
          >
            <View style={styles.menuContent}>
              {categories.map((category) => (
                <Menu.Item
                  key={category}
                  onPress={() => {
                    setCategoryFilter(category);
                    setCategoryMenuVisible(false);
                  }}
                  title={category}
                  style={categoryFilter === category ? styles.selectedMenuItem : null}
                  titleStyle={categoryFilter === category ? styles.selectedMenuItemText : null}
                />
              ))}
            </View>
          </Menu>
          
          <Menu
            visible={priceMenuVisible}
            onDismiss={() => setPriceMenuVisible(false)}
            anchor={
              <TouchableOpacity 
                style={[styles.filterButton, (priceRange.max !== 10000 || priceRange.min !== 0) && styles.activeFilterButton]} 
                onPress={() => setPriceMenuVisible(true)}
              >
                <MaterialCommunityIcons 
                  name="cash" 
                  size={18} 
                  color={(priceRange.max !== 10000 || priceRange.min !== 0) ? colors.ivory1 : colors.bronzeShade7} 
                />
                <Text style={[
                  styles.filterButtonText, 
                  (priceRange.max !== 10000 || priceRange.min !== 0) && styles.activeFilterButtonText
                ]}>Price</Text>
              </TouchableOpacity>
            }
          >
            <View style={styles.menuContent}>
              {priceRanges.map((range) => (
                <Menu.Item
                  key={range.label}
                  onPress={() => {
                    setPriceRange({ min: range.min, max: range.max });
                    setPriceMenuVisible(false);
                  }}
                  title={range.label}
                  style={priceRange.min === range.min && priceRange.max === range.max ? styles.selectedMenuItem : null}
                  titleStyle={priceRange.min === range.min && priceRange.max === range.max ? styles.selectedMenuItemText : null}
                />
              ))}
            </View>
          </Menu>
          
          <Menu
            visible={stockMenuVisible}
            onDismiss={() => setStockMenuVisible(false)}
            anchor={
              <TouchableOpacity 
                style={[styles.filterButton, stockFilter !== 'All' && styles.activeFilterButton]} 
                onPress={() => setStockMenuVisible(true)}
              >
                <MaterialCommunityIcons 
                  name="package-variant" 
                  size={18} 
                  color={stockFilter !== 'All' ? colors.ivory1 : colors.bronzeShade7} 
                />
                <Text style={[styles.filterButtonText, stockFilter !== 'All' && styles.activeFilterButtonText]}>Stock</Text>
              </TouchableOpacity>
            }
          >
            <View style={styles.menuContent}>
              {stockOptions.map((option) => (
                <Menu.Item
                  key={option.value}
                  onPress={() => {
                    setStockFilter(option.value);
                    setStockMenuVisible(false);
                  }}
                  title={option.label}
                  style={stockFilter === option.value ? styles.selectedMenuItem : null}
                  titleStyle={stockFilter === option.value ? styles.selectedMenuItemText : null}
                />
              ))}
            </View>
          </Menu>
          
          {activeFilters.length > 0 && (
            <TouchableOpacity style={styles.resetButton} onPress={resetAllFilters}>
              <MaterialCommunityIcons name="restart" size={18} color={colors.ivory1} />
              <Text style={styles.resetButtonText}>Reset</Text>
            </TouchableOpacity>
          )}
        </View>
        
        {activeFilters.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.activeFiltersContainer}>
            {activeFilters.map((filter) => (
              <Chip 
                key={filter.key} 
                onClose={() => removeFilter(filter.key)}
                style={styles.filterChip}
                textStyle={styles.filterChipText}
              >
                {filter.label}
              </Chip>
            ))}
          </ScrollView>
        )}
        
        <View style={styles.resultsCountContainer}>
          <Text style={styles.resultsCount}>
            {filteredLiquors.length} {filteredLiquors.length === 1 ? 'item' : 'items'} found
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <MaterialCommunityIcons name="bottle-wine-outline" size={40} color={colors.bronzeShade3} />
            <Text style={styles.statusText}>Loading liquors...</Text>
          </View>
        ) : error ? (
          <Text style={styles.errorText}>Error: {error}</Text>
        ) : filteredLiquors && filteredLiquors.length > 0 ? (
          filteredLiquors.map((liquor, index) => (
            <CardItem
              key={liquor._id || index}
              liquor={liquor}
              onDelete={() => handleDeleteLiquor(liquor._id)}
            />
          ))
        ) : (
          <View style={styles.noResultsContainer}>
            <MaterialCommunityIcons name="flask-empty-outline" size={64} color={colors.bronzeShade4} />
            <Text style={styles.statusText}>
              {searchQuery.trim() !== '' || activeFilters.length > 0 ? 'No results match your filters' : 'No liquors found'}
            </Text>
            {(searchQuery.trim() !== '' || activeFilters.length > 0) && (
              <Button 
                mode="contained" 
                onPress={resetAllFilters}
                style={styles.clearFiltersButton}
                labelStyle={styles.clearFiltersButtonText}
              >
                Clear Filters
              </Button>
            )}
          </View>
        )}
      </ScrollView>

      <View style={styles.fabContainer}>
        <FAB
          style={styles.fab}
          icon="glass-wine"
          onPress={handleAddNewLiquor}
          color={colors.ivory1}
          label="Add Liquor"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 80,
  },
  dashboardHeader: {
    backgroundColor: colors.bronzeShade3,
    padding: 16,
    paddingTop: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.bronzeShade4,
  },
  mainHeaderText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.ivory1,
    textAlign: 'center',
  },
  quickActionsContainer: {
    flexDirection: 'row',
    backgroundColor: colors.bronzeShade2,
    paddingVertical: 12,
    paddingHorizontal: 16,
    justifyContent: 'space-around',
    borderBottomWidth: 1,
    borderBottomColor: colors.bronzeShade4,
  },
  quickActionButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  quickActionIcon: {
    backgroundColor: colors.bronzeShade5,
    padding: 8,
    borderRadius: 8,
    marginBottom: 4,
  },
  quickActionText: {
    color: colors.ivory1,
    fontSize: 12,
    fontWeight: '600',
  },
  inventoryListHeader: {
    padding: 16,
    backgroundColor: colors.ivory3,
    borderBottomWidth: 1,
    borderBottomColor: colors.bronzeShade2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionHeaderText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.bronzeShade7,
    marginLeft: 8,
  },
  searchBar: {
    backgroundColor: colors.ivory1,
    borderWidth: 1,
    borderColor: colors.bronzeShade2,
    elevation: 0,
    height: 42,
  },
  searchInput: {
    fontSize: 14,
    color: colors.bronzeShade8,
  },
  filtersContainer: {
    backgroundColor: colors.ivory4,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.bronzeShade2,
  },
  filterButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.ivory2,
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.bronzeShade2,
  },
  activeFilterButton: {
    backgroundColor: colors.bronzeShade3,
    borderColor: colors.bronzeShade5,
  },
  filterButtonText: {
    fontSize: 14,
    color: colors.bronzeShade7,
    marginLeft: 4,
    fontWeight: '500',
  },
  activeFilterButtonText: {
    color: colors.ivory1,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bronzeShade5,
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  resetButtonText: {
    fontSize: 14,
    color: colors.ivory1,
    marginLeft: 4,
    fontWeight: '500',
  },
  activeFiltersContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  filterChip: {
    backgroundColor: colors.bronzeShade1,
    marginRight: 8,
  },
  filterChipText: {
    color: colors.ivory1,
    fontSize: 12,
  },
  resultsCountContainer: {
    alignItems: 'flex-end',
    marginTop: 4,
  },
  resultsCount: {
    fontSize: 12,
    color: colors.bronzeShade6,
    fontStyle: 'italic',
  },
  menuContent: {
    backgroundColor: colors.ivory1,
    borderRadius: 4,
    paddingVertical: 4,
  },
  selectedMenuItem: {
    backgroundColor: colors.bronzeShade1,
  },
  selectedMenuItemText: {
    color: colors.ivory1,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  errorText: {
    color: colors.error,
    textAlign: 'center',
    marginVertical: 20,
    fontSize: 16,
  },
  warningText: {
    color: '#FF9800',
  },
  statusText: {
    color: colors.bronzeShade6,
    fontSize: 16,
    marginTop: 12,
    textAlign: 'center',
  },
  noResultsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  clearFiltersButton: {
    backgroundColor: colors.bronzeShade3,
    marginTop: 16,
  },
  clearFiltersButtonText: {
    color: colors.ivory1,
  },
  fabContainer: {
    position: 'absolute',
    right: 16,
    bottom: 16,
  },
  fab: {
    backgroundColor: colors.bronzeShade2,
  },
  
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: colors.ivory1,
    borderRadius: 12,
    width: '100%',
    maxWidth: 500,
    padding: 0,
    overflow: 'hidden',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.bronzeShade2,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.ivory1,
  },
  modalScrollView: {
    padding: 25,
    maxHeight: '80%',
  },
  modalCloseButton: {
    backgroundColor: colors.bronzeShade3,
    borderRadius: 0,
    marginTop: 10,
  },
  modalCloseButtonText: {
    color: colors.ivory1,
    fontWeight: '600',
  },
  
  // Metrics Modal
  metricsContainer: {
    marginBottom: 16,
  },
  metricModalCard: {
    backgroundColor: colors.bronzeShade2,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  metricIconContainer: {
    backgroundColor: colors.bronzeShade5,
    padding: 10,
    borderRadius: 8,
    marginRight: 16,
  },
  metricContent: {
    flex: 1,
  },
  metricLabel: {
    fontSize: 14,
    color: colors.ivory2,
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.ivory1,
  },
  
  // Order Status Modal
  orderStatusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statusItem: {
    width: '30%',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: colors.ivory3,
    padding: 12,
    borderRadius: 8,
  },
  statusIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  pendingIndicator: {
    backgroundColor: '#1976D2', // Blue
  },
  shippingIndicator: {
    backgroundColor: '#FF9800', // Orange
  },
  shippedIndicator: {
    backgroundColor: '#9C27B0', // Purple
  },
  deliveredIndicator: {
    backgroundColor: '#4CAF50', // Green
  },
  cancelledIndicator: {
    backgroundColor: '#F44336', // Red
  },
  statusLabel: {
    fontSize: 12,
    color: colors.bronzeShade7,
    marginBottom: 4,
  },
  statusValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.bronzeShade7,
  },
  orderDetailsSection: {
    backgroundColor: colors.ivory4,
    padding: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  sectionSubHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.bronzeShade6,
    marginBottom: 12,
  },
  orderDetailsItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.ivory3,
  },
  orderDetailsLabel: {
    fontSize: 14,
    color: colors.bronzeShade7,
  },
  orderDetailsValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.bronzeShade7,
  },
  
  // Inventory Status Modal
  inventoryStatusGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  inventoryModalItem: {
    width: '30%',
    alignItems: 'center',
    padding: 12,
    backgroundColor: colors.ivory3,
    borderRadius: 8,
  },
  inventoryStatusLabel: {
    fontSize: 12,
    color: colors.bronzeShade7,
    marginBottom: 4,
    textAlign: 'center',
  },
  inventoryStatusValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.bronzeShade7,
  },
  inventoryDetailsSection: {
    backgroundColor: colors.ivory4,
    padding: 16,
    borderRadius: 8,
    marginTop: 8,
    marginBottom: 16,
  },
  inventoryDetailsItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.ivory3,
  },
  inventoryDetailsLabel: {
    fontSize: 14,
    color: colors.bronzeShade7,
  },
  inventoryDetailsValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.bronzeShade7,
  },
  inventoryAlertSection: {
    backgroundColor: '#FFF3E0',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
    marginBottom: 16,
  },
  outOfStockAlert: {
    backgroundColor: '#FFEBEE',
    borderLeftColor: colors.error,
  },
  inventoryAlertTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.bronzeShade7,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  inventoryAlertText: {
    fontSize: 14,
    color: colors.bronzeShade7,
  }
});