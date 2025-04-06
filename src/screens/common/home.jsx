import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Text,
  Image,
  StatusBar,
} from 'react-native';
import { Card, Title, Paragraph, IconButton } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchLiquors } from '../../redux/actions/liquorAction';
import { useAsyncSQLiteContext } from '../../utils/asyncSQliteProvider';
import { colors, spacing, globalStyles, fonts } from '../../components/common/theme';
import Toast from 'react-native-toast-message';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const categories = [
  { label: 'All', value: '', icon: 'glass-cocktail' },
  { label: 'Vodka', value: 'Vodka', icon: 'bottle-wine' },
  { label: 'Rum', value: 'Rum', icon: 'glass-mug-variant' },
  { label: 'Tequila', value: 'Tequila', icon: 'glass-tulip' },
  { label: 'Whiskey', value: 'Whiskey', icon: 'bottle-tonic' },
  { label: 'Gin', value: 'Gin', icon: 'bottle-tonic-outline' },
  { label: 'Brandy', value: 'Brandy', icon: 'glass-wine' },
  { label: 'Liqueur', value: 'Liqueur', icon: 'glass-flute' },
  { label: 'Beer', value: 'Beer', icon: 'beer' },
  { label: 'Wine', value: 'Wine', icon: 'wine' },
  { label: 'Champagne', value: 'Champagne', icon: 'glass-champagne' },
  { label: 'Sake', value: 'Sake', icon: 'cup' },
  { label: 'Soju', value: 'Soju', icon: 'bottle-wine-outline' },
  { label: 'Baijiu', value: 'Baijiu', icon: 'decanter' },
  { label: 'Whisky', value: 'Whisky', icon: 'bottle-tonic-skull' },
  { label: 'Other', value: 'Other', icon: 'dots-horizontal' },
];

const Home = () => {
  const db = useAsyncSQLiteContext();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { liquors, loading, error } = useSelector((state) => state.liquor);

  // State for search and filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [priceSort, setPriceSort] = useState(''); // '' | 'asc' | 'desc'

  // States for collapsible sections
  const [showCategory, setShowCategory] = useState(false);
  const [showSort, setShowSort] = useState(false);

  // Fetch liquors when filters change
  useEffect(() => {
    dispatch(fetchLiquors({
      search: searchQuery,
      category: selectedCategory,
      sort: priceSort,
      db,
    }));
  }, [dispatch, searchQuery, selectedCategory, priceSort, db]);

  const handleSearchChange = (text) => {
    setSearchQuery(text);
  };

  const renderLiquorItem = ({ item }) => {
    const imageUrl =
      item.images && item.images.length > 0
        ? item.images[0].url
        : 'https://via.placeholder.com/150';
    return (
      <Card
        style={styles.card}
        onPress={() =>
          navigation.navigate('Details', { liquorId: item._id })
        }
      >
        <Card.Cover source={{ uri: imageUrl }} style={styles.cardCover} />
        <View style={styles.cardBadge}>
          <Text style={styles.cardBadgeText}>{item.category}</Text>
        </View>
        <Card.Content>
          <Title numberOfLines={1} style={styles.cardTitle}>{item.name}</Title>

          <Paragraph style={styles.price}>₱{item.price}</Paragraph>
        </Card.Content>
      </Card>
    );
  };

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Icon name="bottle-wine-outline" size={80} color={colors.bronzeShade3} />
      <Text style={styles.emptyText}>No spirits found</Text>
      <Text style={styles.emptySubtext}>Try adjusting your search or filters</Text>
    </View>
  );

  return (
    <View style={[globalStyles.container, styles.containerOverride]}>
      <StatusBar backgroundColor={colors.bronzeShade6} barStyle="light-content" />
      
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Title style={styles.appTitle}>Spirit & Spirits</Title>
          <Icon name="glass-wine" size={24} color={colors.primary} style={styles.titleIcon} />
        </View>
        <Paragraph style={styles.subtitle}>
          Fine liquors for refined tastes
        </Paragraph>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Icon name="magnify" size={20} color={colors.bronzeShade5} style={styles.searchIcon} />
        <TextInput
          style={styles.searchBar}
          placeholder="Search our collection..."
          placeholderTextColor={colors.placeholder}
          value={searchQuery}
          onChangeText={handleSearchChange}
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Icon name="close-circle" size={20} color={colors.bronzeShade5} />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Category Filter */}
      <TouchableOpacity
        style={styles.collapsibleHeader}
        onPress={() => setShowCategory(!showCategory)}
      >
        <View style={styles.filterHeaderContent}>
          <Icon name="filter-variant" size={20} color={colors.bronzeShade5} />
          <Text style={styles.collapsibleHeaderText}>Categories</Text>
        </View>
        <Icon 
          name={showCategory ? "chevron-up" : "chevron-down"} 
          size={20} 
          color={colors.bronzeShade5} 
        />
      </TouchableOpacity>
      
      {showCategory && (
        <View style={styles.filterSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.value}
                style={[
                  styles.filterButton,
                  selectedCategory === cat.value && styles.activeButton,
                ]}
                onPress={() => setSelectedCategory(cat.value === selectedCategory ? '' : cat.value)}
              >
                <Icon 
                  name={cat.icon} 
                  size={18} 
                  color={selectedCategory === cat.value ? colors.surface : colors.bronzeShade5} 
                  style={styles.categoryIcon}
                />
                <Text
                  style={[
                    styles.filterButtonText,
                    selectedCategory === cat.value && styles.activeButtonText,
                  ]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Price Sorting Filter */}
      <TouchableOpacity
        style={styles.collapsibleHeader}
        onPress={() => setShowSort(!showSort)}
      >
        <View style={styles.filterHeaderContent}>
          <Icon name="sort" size={20} color={colors.bronzeShade5} />
          <Text style={styles.collapsibleHeaderText}>Sort by Price</Text>
        </View>
        <Icon 
          name={showSort ? "chevron-up" : "chevron-down"} 
          size={20} 
          color={colors.bronzeShade5} 
        />
      </TouchableOpacity>
      
      {showSort && (
        <View style={styles.filterSection}>
          <View style={styles.priceSortContainer}>
            <TouchableOpacity
              style={[
                styles.sortButton,
                priceSort === 'asc' && styles.activeButton,
              ]}
              onPress={() => setPriceSort(priceSort === 'asc' ? '' : 'asc')}
            >
              <Icon 
                name="sort-ascending" 
                size={18} 
                color={priceSort === 'asc' ? colors.surface : colors.bronzeShade5} 
              />
              <Text
                style={[
                  styles.sortButtonText,
                  priceSort === 'asc' && styles.activeButtonText,
                ]}
              >
                Low to High
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.sortButton,
                priceSort === 'desc' && styles.activeButton,
              ]}
              onPress={() => setPriceSort(priceSort === 'desc' ? '' : 'desc')}
            >
              <Icon 
                name="sort-descending" 
                size={18} 
                color={priceSort === 'desc' ? colors.surface : colors.bronzeShade5} 
              />
              <Text
                style={[
                  styles.sortButtonText,
                  priceSort === 'desc' && styles.activeButtonText,
                ]}
              >
                High to Low
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Active Filters Display */}
      {(selectedCategory || priceSort) && (
        <View style={styles.activeFiltersContainer}>
          <Text style={styles.activeFiltersLabel}>Active Filters:</Text>
          <View style={styles.activeFiltersList}>
            {selectedCategory && (
              <View style={styles.activeFilterChip}>
                <Text style={styles.activeFilterText}>
                  {categories.find(c => c.value === selectedCategory)?.label}
                </Text>
                <TouchableOpacity onPress={() => setSelectedCategory('')}>
                  <Icon name="close-circle" size={16} color={colors.bronzeShade5} />
                </TouchableOpacity>
              </View>
            )}
            {priceSort && (
              <View style={styles.activeFilterChip}>
                <Text style={styles.activeFilterText}>
                  {priceSort === 'asc' ? 'Price: Low to High' : 'Price: High to Low'}
                </Text>
                <TouchableOpacity onPress={() => setPriceSort('')}>
                  <Icon name="close-circle" size={16} color={colors.bronzeShade5} />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      )}

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
          <Text style={styles.loaderText}>Finding the perfect spirits...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Icon name="alert-circle" size={60} color={colors.error} />
          <Text style={styles.errorText}>Oops! Something went wrong.</Text>
          <Text style={styles.errorSubtext}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => dispatch(fetchLiquors({ search: searchQuery, category: selectedCategory, sort: priceSort, db }))}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          key={`flatlist-2`}
          data={liquors}
          keyExtractor={(item) => item._id}
          renderItem={renderLiquorItem}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.list}
          ListEmptyComponent={renderEmptyList}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

export default Home;

const styles = StyleSheet.create({
  containerOverride: {
    backgroundColor: colors.background,
    padding: spacing.medium,
  },
  header: {
    marginBottom: spacing.large,
    alignItems: 'center',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  appTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.bronzeShade4,
    textAlign: 'center',
  },
  titleIcon: {
    marginLeft: spacing.small,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 4,
    color: colors.bronzeShade7,
    fontStyle: 'italic',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderColor: colors.bronzeShade3,
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: spacing.medium,
    marginBottom: spacing.large,
    backgroundColor: colors.ivory4,
  },
  searchIcon: {
    marginRight: spacing.small,
  },
  searchBar: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    height: '100%',
  },
  filterSection: {
    marginBottom: spacing.medium,
  },
  collapsibleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.ivory3,
    paddingVertical: spacing.small,
    paddingHorizontal: spacing.medium,
    borderRadius: 12,
    marginBottom: spacing.small,
    borderWidth: 1,
    borderColor: colors.bronzeShade2,
    height: 50,
  },
  filterHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  collapsibleHeaderText: {
    fontSize: 16,
    color: colors.bronzeShade7,
    fontWeight: '600',
    marginLeft: spacing.small,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.small,
    paddingHorizontal: spacing.medium,
    borderWidth: 1.5,
    borderColor: colors.bronzeShade3,
    borderRadius: 24,
    marginRight: spacing.small,
    marginBottom: spacing.small / 2,
    backgroundColor: colors.ivory5,
  },
  categoryIcon: {
    marginRight: 6,
  },
  filterButtonText: {
    fontSize: 14,
    color: colors.bronzeShade7,
    fontWeight: '500',
  },
  priceSortContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.small,
  },
  sortButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.small,
    marginHorizontal: spacing.small / 2,
    borderWidth: 1.5,
    borderColor: colors.bronzeShade3,
    borderRadius: 24,
    backgroundColor: colors.ivory5,
  },
  sortButtonText: {
    fontSize: 14,
    color: colors.bronzeShade7,
    fontWeight: '500',
    marginLeft: 6,
  },
  activeButton: {
    backgroundColor: colors.bronzeShade3,
    borderColor: colors.bronzeShade4,
  },
  activeButtonText: {
    color: colors.ivory1,
    fontWeight: '600',
  },
  activeFiltersContainer: {
    marginBottom: spacing.medium,
  },
  activeFiltersLabel: {
    fontSize: 14,
    color: colors.bronzeShade7,
    marginBottom: 4,
  },
  activeFiltersList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  activeFilterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.ivory3,
    borderWidth: 1,
    borderColor: colors.bronzeShade3,
    borderRadius: 16,
    paddingVertical: 4,
    paddingHorizontal: 10,
    marginRight: 8,
    marginBottom: 4,
  },
  activeFilterText: {
    fontSize: 12,
    color: colors.bronzeShade7,
    marginRight: 4,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loader: {
    marginBottom: spacing.small,
  },
  loaderText: {
    color: colors.bronzeShade5,
    fontSize: 16,
  },
  list: {
    paddingBottom: spacing.large * 2,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: spacing.medium,
  },
  card: {
    flex: 1,
    marginHorizontal: spacing.small / 2,
    backgroundColor: colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.bronzeShade2,
    marginBottom: spacing.medium,
  },
  cardCover: {
    height: 170,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  cardBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(205, 127, 50, 0.85)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  cardBadgeText: {
    color: colors.ivory1,
    fontSize: 10,
    fontWeight: 'bold',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.bronzeShade7,
    marginTop: spacing.small / 2,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  ratingText: {
    fontSize: 12,
    color: colors.bronzeShade6,
    marginLeft: 4,
  },
  price: {
    fontSize: 18,
    color: colors.bronzeShade4,
    fontWeight: 'bold',
    marginTop: 4,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.large,
  },
  errorText: {
    fontSize: 18,
    color: colors.error,
    fontWeight: 'bold',
    marginTop: spacing.medium,
  },
  errorSubtext: {
    fontSize: 14,
    color: colors.placeholder,
    textAlign: 'center',
    marginTop: spacing.small,
  },
  retryButton: {
    marginTop: spacing.large,
    backgroundColor: colors.primary,
    paddingVertical: spacing.small,
    paddingHorizontal: spacing.medium,
    borderRadius: 24,
  },
  retryButtonText: {
    color: colors.ivory1,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.large * 2,
  },
  emptyText: {
    fontSize: 18,
    color: colors.bronzeShade6,
    fontWeight: 'bold',
    marginTop: spacing.medium,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.bronzeShade5,
    textAlign: 'center',
    marginTop: spacing.small,
  },
});