// Home.jsx
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
} from 'react-native';
import { Card, Title, Paragraph } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchLiquors } from '../../redux/actions/liquorAction';
import { useAsyncSQLiteContext } from '../../utils/asyncSQliteProvider';
import { colors, spacing, globalStyles } from '../../components/common/theme';
import Toast from 'react-native-toast-message';

const categories = [
  { label: 'All', value: '' },
  { label: 'Vodka', value: 'Vodka' },
  { label: 'Rum', value: 'Rum' },
  { label: 'Tequila', value: 'Tequila' },
  { label: 'Whiskey', value: 'Whiskey' },
  { label: 'Gin', value: 'Gin' },
  { label: 'Brandy', value: 'Brandy' },
  { label: 'Liqueur', value: 'Liqueur' },
  { label: 'Beer', value: 'Beer' },
  { label: 'Wine', value: 'Wine' },
  { label: 'Champagne', value: 'Champagne' },
  { label: 'Sake', value: 'Sake' },
  { label: 'Soju', value: 'Soju' },
  { label: 'Baijiu', value: 'Baijiu' },
  { label: 'Whisky', value: 'Whisky' },
  { label: 'Other', value: 'Other' },
];

const Home = () => {
  const db = useAsyncSQLiteContext();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { liquors, loading, error } = useSelector((state) => state.liquor);

  // New state for search and filters
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
        <Card.Content>
          <Title style={styles.cardTitle}>{item.name}</Title>
          <Paragraph style={styles.price}>₱{item.price}</Paragraph>
        </Card.Content>
      </Card>
    );
  };

  return (
    <View style={[globalStyles.container, styles.containerOverride]}>
      <Title style={globalStyles.title}>Welcome to Spirit Spirits!</Title>
      <Paragraph style={styles.subtitle}>
        Your one-stop shop for all your spirit needs.
      </Paragraph>

      {/* Search Bar */}
      <TextInput
        style={styles.searchBar}
        placeholder="Search liquors..."
        value={searchQuery}
        onChangeText={handleSearchChange}
      />

      {/* Collapsible Category Filter */}
      <TouchableOpacity
        style={styles.collapsibleHeader}
        onPress={() => setShowCategory(!showCategory)}
      >
        <Text style={styles.collapsibleHeaderText}>Category Filter</Text>
        <Text style={styles.collapsibleHeaderText}>
          {showCategory ? '-' : '+'}
        </Text>
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
                onPress={() => setSelectedCategory(cat.value)}
              >
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

      {/* Collapsible Price Sorting Filter */}
      <TouchableOpacity
        style={styles.collapsibleHeader}
        onPress={() => setShowSort(!showSort)}
      >
        <Text style={styles.collapsibleHeaderText}>Sort by Price</Text>
        <Text style={styles.collapsibleHeaderText}>
          {showSort ? '-' : '+'}
        </Text>
      </TouchableOpacity>
      {showSort && (
        <View style={styles.filterSection}>
          <View style={styles.priceSortContainer}>
            <TouchableOpacity
              style={[
                styles.sortButton,
                priceSort === 'asc' && styles.activeButton,
              ]}
              onPress={() => setPriceSort('asc')}
            >
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
              onPress={() => setPriceSort('desc')}
            >
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

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
      ) : error ? (
        <Text style={styles.errorText}>Error: {error}</Text>
      ) : (
        <FlatList
          key={`flatlist-2`}
          data={liquors}
          keyExtractor={(item) => item._id}
          renderItem={renderLiquorItem}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
};

export default Home;

const styles = StyleSheet.create({
  containerOverride: {},
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: spacing.medium,
    color: colors.placeholder,
  },
  searchBar: {
    height: 40,
    borderColor: colors.placeholder,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: spacing.small,
    marginBottom: spacing.medium,
  },
  filterSection: {
    marginBottom: spacing.medium,
  },
  collapsibleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    paddingVertical: spacing.small,
    paddingHorizontal: spacing.medium,
    borderRadius: 8,
    marginBottom: spacing.small,
    borderWidth: 1,
    borderColor: colors.placeholder,
  },
  collapsibleHeaderText: {
    fontSize: 16,
    color: colors.primary,
  },
  filterButton: {
    paddingVertical: spacing.small / 2,
    paddingHorizontal: spacing.small,
    borderWidth: 1,
    borderColor: colors.placeholder,
    borderRadius: 20,
    marginRight: spacing.small / 2,
  },
  filterButtonText: {
    fontSize: 14,
    color: colors.placeholder,
  },
  priceSortContainer: {
    flexDirection: 'row',
  },
  sortButton: {
    flex: 1,
    paddingVertical: spacing.small / 2,
    marginRight: spacing.small / 2,
    borderWidth: 1,
    borderColor: colors.placeholder,
    borderRadius: 20,
    alignItems: 'center',
  },
  sortButtonText: {
    fontSize: 14,
    color: colors.placeholder,
  },
  activeButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  activeButtonText: {
    color: colors.surface,
  },
  loader: {
    marginVertical: spacing.medium,
  },
  list: {
    paddingBottom: spacing.large,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: spacing.medium,
  },
  card: {
    flex: 1,
    marginHorizontal: spacing.small,
    backgroundColor: colors.surface,
    borderRadius: 8,
    overflow: 'hidden',
  },
  cardCover: {
    height: 170,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
    marginTop: spacing.small,
  },
  price: {
    fontSize: 16,
    color: 'green',
    fontWeight: 'bold',
    marginTop: spacing.small,
  },
  errorText: {
    color: colors.error,
    fontSize: 16,
    textAlign: 'center',
  },
});
