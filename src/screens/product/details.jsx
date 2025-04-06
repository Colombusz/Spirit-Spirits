// Details.jsx
import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  ActivityIndicator,
  Image,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { Title, Paragraph, Button, Badge, Text, IconButton } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { useRoute, useNavigation } from '@react-navigation/native';
import { fetchLiquorById, clearCurrentLiquor } from '../../redux/actions/liquorAction';
import { addToCart } from '../../redux/actions/cartAction';
import { getUserCredentials } from '../../utils/userStorage';
import { useAsyncSQLiteContext } from '../../utils/asyncSQliteProvider';
import { colors, spacing, globalStyles } from '../../components/common/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Toasthelper } from '../../components/common/toasthelper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { view } from 'drizzle-orm/sqlite-core';

const { width } = Dimensions.get('window');
const imageWidth = width - 40; // Full width minus some padding

const Details = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const route = useRoute();
  const { liquorId } = route.params;
  const db = useAsyncSQLiteContext();

  const { currentLiquor, loading, error } = useSelector((state) => state.liquor);
  const [selectedStar, setSelectedStar] = useState(0); // 0 means "All" ratings
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const handlepress = () => {
    Toasthelper.showSuccess('Added to cart successfully!');
  };

  useEffect(() => {
    dispatch(fetchLiquorById(liquorId));
    return () => {
      dispatch(clearCurrentLiquor());
    };
  }, [dispatch, liquorId]);

  const handleAddToCart = async () => {
    try {
      const user = await getUserCredentials();
      if (!user) {
        console.error('User not found in AsyncStorage');
        Toasthelper.showError('Please log in to add items to your cart.');
        navigation.navigate('Login');
        return;
      }
      const userId = user._id;
      console.log('User ID:', userId);
      dispatch(addToCart({ db, userId, liquor: currentLiquor }));
      handlepress();
    } catch (error) {
      console.error('Error adding to cart', error);
    }
  };

  const handleViewCart = async () => {
    try {
      const user = await getUserCredentials();
      if (!user) {
        console.error('User not found in AsyncStorage');
        Toasthelper.showError('Please log in to view your cart.');
        navigation.navigate('Login');
        return;
      }
      navigation.navigate('Cart');
    } catch (error) {
      console.error('Error fetching user credentials', error);
    }
  };

  if (loading || !currentLiquor) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
        <Text style={styles.loaderText}>Loading product details...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="alert-circle-outline" size={60} color={colors.error} />
        <Paragraph style={styles.errorText}>Error: {error}</Paragraph>
        <Button
          mode="contained"
          onPress={() => dispatch(fetchLiquorById(liquorId))}
          buttonColor={colors.primary}
          style={styles.retryButton}
        >
          Retry
        </Button>
      </View>
    );
  }

  // Filter reviews based on selected star rating (0 means show all)
  const filteredReviews = currentLiquor.reviews
    ? currentLiquor.reviews.filter(review =>
        selectedStar === 0 ? true : review.rating === selectedStar
      )
    : [];

  // Generate star display for ratings
  const renderStars = (rating) => {
    const stars = [];
    for(let i = 0; i < 5; i++) {
      stars.push(
        <Icon 
          key={i} 
          name={i < rating ? 'star' : 'star-outline'} 
          size={16} 
          color={colors.starYellow} 
          style={{marginRight: 2}}
        />
      );
    }
    return <View style={styles.starsContainer}>{stars}</View>;
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={styles.rootContainer}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Image Gallery */}
          <View style={styles.imageGalleryContainer}>
            {currentLiquor.images && currentLiquor.images.length > 0 ? (
              <>
                <ScrollView
                  horizontal
                  pagingEnabled
                  showsHorizontalScrollIndicator={false}
                  onMomentumScrollEnd={(e) => {
                    const newIndex = Math.round(e.nativeEvent.contentOffset.x / imageWidth);
                    setActiveImageIndex(newIndex);
                  }}
                  contentContainerStyle={styles.imageScrollContent}
                  style={styles.imageScroll}
                >
                  {currentLiquor.images.map((img, index) => (
                    <View key={index.toString()} style={styles.imageWrapper}>
                      <Image
                        source={{ uri: img.url }}
                        style={styles.imageItem}
                        resizeMode="contain"
                      />
                    </View>
                  ))}
                </ScrollView>
                {/* Image dots indicator */}
                {currentLiquor.images.length > 1 && (
                  <View style={styles.imageDotContainer}>
                    {currentLiquor.images.map((_, index) => (
                      <View 
                        key={index} 
                        style={[
                          styles.imageDot, 
                          activeImageIndex === index && styles.activeImageDot
                        ]}
                      />
                    ))}
                  </View>
                )}
              </>
            ) : (
              <View style={styles.noImageContainer}>
                <Icon name="image-off" size={60} color={colors.placeholder} />
                <Text style={styles.noImageText}>No images available</Text>
              </View>
            )}
          </View>

          {/* Product Info Card */}
          <View style={styles.productInfoCard}>
            <View style={styles.productHeaderRow}>
              <View style={styles.productTitleContainer}>
                <Title style={styles.productName}>{currentLiquor.name}</Title>
                <Paragraph style={styles.brandText}>{currentLiquor.brand}</Paragraph>
              </View>
              <View style={styles.priceContainer}>
                <Text style={styles.price}>${currentLiquor.price}</Text>
              </View>
            </View>

            <View style={styles.ratingContainer}>
              {renderStars(currentLiquor.rating || 0)}
              <Text style={styles.reviewCount}>
                ({currentLiquor.numReviews || 0} {currentLiquor.numReviews === 1 ? 'Review' : 'Reviews'})
              </Text>
            </View>

            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{currentLiquor.category}</Text>
            </View>

            {/* Promotional Info */}
            <View style={styles.promoContainer}>
              <View style={styles.promoItem}>
                <Icon name="check-decagram" size={16} color={colors.primary} />
                <Text style={styles.promoText}>100% Authentic</Text>
              </View>
              <View style={styles.promoItem}>
                <Icon name="truck-fast" size={16} color={colors.primary} />
                <Text style={styles.promoText}>3-Day Shipping</Text>
              </View>
              <View style={styles.promoItem}>
                <Icon name="shield-check" size={16} color={colors.primary} />
                <Text style={styles.promoText}>No Damages</Text>
              </View>
              <View style={styles.promoItem}>
                <Icon name="store" size={16} color={colors.primary} />
                <Text style={styles.promoText}>Legitimate Seller</Text>
              </View>
            </View>
          </View>

          {/* Description Card */}
          <View style={styles.detailCard}>
            <Title style={styles.sectionHeader}>Description</Title>
            <Paragraph style={styles.detailText}>{currentLiquor.description}</Paragraph>
          </View>

          {/* Ratings & Reviews Section */}
          <View style={styles.reviewsCard}>
            <View style={styles.reviewsHeaderContainer}>
              <Title style={styles.sectionHeader}>Ratings & Reviews</Title>
            </View>

            {/* Filter Controls */}
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterContainer}
            >
              {[0, 5, 4, 3, 2, 1].map((star) => (
                <TouchableOpacity
                  key={star}
                  style={[
                    styles.filterButton,
                    selectedStar === star && styles.filterButtonActive
                  ]}
                  onPress={() => setSelectedStar(star)}
                >
                  <Text 
                    style={[
                      styles.filterButtonText,
                      selectedStar === star && styles.filterButtonTextActive
                    ]}
                  >
                    {star === 0 ? 'All' : `${star} ★`}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Reviews List */}
            {filteredReviews && filteredReviews.length > 0 ? (
              filteredReviews.map((review, index) => (
                <View key={index} style={styles.reviewItem}>
                  <View style={styles.reviewHeader}>
                    {renderStars(review.rating)}
                    {review.createdAt && (
                      <Text style={styles.reviewDate}>
                        {new Date(review.createdAt).toLocaleDateString()}
                      </Text>
                    )}
                  </View>
                  <Paragraph style={styles.reviewComment}>
                    {review.comment}
                  </Paragraph>
                  {review.user && (
                    <Text style={styles.reviewUser}>
                      By: {review.user.username || review.user.name || 'Anonymous'}
                    </Text>
                  )}
                </View>
              ))
            ) : (
              <View style={styles.noReviewsContainer}>
                <Icon name="comment-off-outline" size={40} color={colors.placeholder} />
                <Paragraph style={styles.noReviewsText}>No reviews yet.</Paragraph>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Sticky Footer with buttons */}
        <View style={styles.stickyFooter}>
          <Button
            mode="contained"
            icon={({size, color}) => <Icon name="cart-plus" size={size} color={color} />}
            buttonColor={colors.primary}
            contentStyle={styles.footerContent}
            labelStyle={styles.footerLabel}
            style={styles.footerButton}
            onPress={handleAddToCart}
          >
            Add to Cart
          </Button>
          <Button
            mode="contained"
            icon={({size, color}) => <Icon name="cart-outline" size={size} color={color} />}
            buttonColor={colors.secondary}
            contentStyle={styles.footerContent}
            labelStyle={styles.footerLabel}
            style={styles.footerButton}
            onPress={handleViewCart}
          >
            View Cart
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Details;

const styles = StyleSheet.create({
  rootContainer: {
    ...globalStyles.container,
    padding: 0,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.medium,
    paddingBottom: 140, // extra bottom padding for sticky footer
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loader: {
    marginBottom: spacing.medium,
  },
  loaderText: {
    color: colors.bronzeShade6,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.medium,
    backgroundColor: colors.background,
  },
  errorText: {
    color: colors.error,
    fontSize: 16,
    textAlign: 'center',
    marginVertical: spacing.medium,
  },
  retryButton: {
    marginTop: spacing.medium,
    borderRadius: 8,
  },
  
  // Image Gallery
  imageGalleryContainer: {
    marginBottom: spacing.medium,
    backgroundColor: colors.surface,
    borderRadius: 12,
    overflow: 'hidden',
    padding: spacing.small,
    elevation: 2,
    shadowColor: colors.bronzeShade9,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  imageScroll: {
    width: imageWidth,
  },
  imageScrollContent: {
    flexDirection: 'row',
  },
  imageWrapper: {
    width: imageWidth,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.small,
  },
  imageItem: {
    width: imageWidth - spacing.medium,
    height: width - 60,
    borderRadius: 8,
  },
  imageDotContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.small,
  },
  imageDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.bronzeShade3 + '60', // with transparency
    marginHorizontal: 4,
  },
  activeImageDot: {
    backgroundColor: colors.primary,
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  noImageContainer: {
    height: 300,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noImageText: {
    color: colors.placeholder,
    marginTop: spacing.small,
  },
  
  // Product Info Card
  productInfoCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.medium,
    marginBottom: spacing.medium,
    elevation: 2,
    shadowColor: colors.bronzeShade9,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  productHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.small,
  },
  productTitleContainer: {
    flex: 1,
    marginRight: spacing.small,
  },
  productName: {
    fontSize: 26,
    fontWeight: 'bold',
    color: colors.bronzeShade6,
    marginBottom: 4,
  },
  brandText: {
    fontSize: 18,
    color: colors.bronzeShade5,
    marginBottom: 0,
  },
  priceContainer: {
    backgroundColor: colors.ivory5,
    paddingHorizontal: spacing.medium,
    paddingVertical: spacing.small / 2,
    borderRadius: 16,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.bronzeShade2 + '30', // with transparency
  },
  price: {
    fontSize: 22,
    color: colors.bronzeShade5,
    fontWeight: 'bold',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.small,
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewCount: {
    marginLeft: spacing.small,
    color: colors.bronzeShade5,
    fontSize: 14,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primary + '20', // with transparency
    paddingHorizontal: spacing.medium,
    paddingVertical: 4,
    borderRadius: 16,
    marginBottom: spacing.medium,
  },
  categoryText: {
    color: colors.bronzeShade6,
    fontWeight: 'bold',
  },
  promoContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.ivory3,
    paddingTop: spacing.small,
    marginTop: spacing.small,
  },
  promoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
    marginBottom: spacing.small,
  },
  promoText: {
    fontSize: 12,
    color: colors.bronzeShade5,
    marginLeft: 4,
  },
  
  // Description Card
  detailCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.medium,
    marginBottom: spacing.medium,
    elevation: 2,
    shadowColor: colors.bronzeShade9,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  detailText: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
    textAlign: 'left',
  },
  
  // Reviews Section
  reviewsCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.medium,
    marginBottom: spacing.medium,
    elevation: 2,
    shadowColor: colors.bronzeShade9,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  reviewsHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.medium,
  },
  averageRatingContainer: {
    alignItems: 'center',
  },
  averageRatingText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.bronzeShade5,
    marginBottom: 4,
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.bronzeShade6,
    marginBottom: 0,
  },
  filterContainer: {
    paddingBottom: spacing.medium,
    marginBottom: spacing.medium,
    borderBottomWidth: 1,
    borderBottomColor: colors.ivory3,
  },
  filterButton: {
    backgroundColor: colors.ivory2,
    paddingHorizontal: spacing.medium,
    paddingVertical: spacing.small / 2,
    borderRadius: 20,
    marginRight: spacing.small,
    borderWidth: 1,
    borderColor: colors.ivory3,
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterButtonText: {
    color: colors.bronzeShade6,
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: colors.ivory1,
  },
  reviewItem: {
    marginVertical: spacing.small,
    padding: spacing.medium,
    backgroundColor: colors.ivory2,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.small,
  },
  reviewComment: {
    fontSize: 15,
    color: colors.text,
    marginBottom: spacing.small,
    lineHeight: 22,
  },
  reviewUser: {
    fontSize: 13,
    color: colors.bronzeShade5,
    fontStyle: 'italic',
  },
  reviewDate: {
    fontSize: 12,
    color: colors.bronzeShade4,
  },
  noReviewsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.large,
  },
  noReviewsText: {
    color: colors.placeholder,
    marginTop: spacing.small,
    textAlign: 'center',
  },
  
  // Footer
  stickyFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: spacing.medium,
    paddingHorizontal: spacing.medium,
    borderTopWidth: 1,
    borderTopColor: colors.ivory3,
    elevation: 8,
    shadowColor: colors.bronzeShade9,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  footerButton: {
    flex: 1,
    marginHorizontal: spacing.small,
    borderRadius: 8,
  },
  footerContent: {
    height: 48,
  },
  footerLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
});