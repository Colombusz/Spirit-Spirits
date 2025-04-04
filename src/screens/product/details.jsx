// Details.jsx
import React, { useEffect } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Title, Paragraph, Button } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { useRoute, useNavigation } from '@react-navigation/native';
import { fetchLiquorById, clearCurrentLiquor } from '../../redux/actions/liquorAction';
import { addToCart } from '../../redux/actions/cartAction';
import { getUserCredentials } from '../../utils/userStorage';
import { useAsyncSQLiteContext } from '../../utils/asyncSQliteProvider';
import { colors, spacing, globalStyles } from '../../components/common/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Toasthelper } from '../../components/common/toasthelper';

const Details = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const route = useRoute();
  const { liquorId } = route.params;
  const db = useAsyncSQLiteContext();

  const { currentLiquor, loading, error } = useSelector((state) => state.liquor);
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
        return;
      }
      const userId = user._id;
      console.log('User ID:', userId);

      // Dispatch addToCart action with db instance, userId, and liquor details
      dispatch(addToCart({ db, userId, liquor: currentLiquor }));
      handlepress();
    } catch (error) {
      console.error('Error adding to cart', error);
    }
  };
  

  if (loading || !currentLiquor) {
    return <ActivityIndicator size="large" style={styles.loader} />;
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Paragraph style={styles.errorText}>Error: {error}</Paragraph>
        <Button
          mode="contained"
          onPress={() => dispatch(fetchLiquorById(liquorId))}
          buttonColor={colors.primary}
        >
          Retry
        </Button>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface }}>
      <View style={styles.rootContainer}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Horizontal ScrollView for images */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.imageScrollContent}
            style={styles.imageScroll}
          >
            {currentLiquor.images &&
              currentLiquor.images.map((img, index) => (
                <Image
                  key={index.toString()}
                  source={{ uri: img.url }}
                  style={styles.imageItem}
                />
              ))}
          </ScrollView>

          {/* Promotional Info */}
          <Paragraph style={styles.infoText}>
            100% Authentic • Guaranteed 3-Day Shipping • No Damages • Legitimate Seller • Fast Shipping
          </Paragraph>

          {/* Product Name and Price */}
          <Paragraph style={styles.price}>${currentLiquor.price}</Paragraph>
          <Title style={styles.productName}>{currentLiquor.name}</Title>

          {/* Additional Details */}
          <Paragraph style={styles.detailText}>
            <Paragraph style={styles.detailLabel}>Brand:</Paragraph> {currentLiquor.brand}
          </Paragraph>
          <Paragraph style={styles.detailText}>
            <Paragraph style={styles.detailLabel}>Category:</Paragraph> {currentLiquor.category}
          </Paragraph>
          <Paragraph style={styles.detailText}>
            <Paragraph style={styles.detailLabel}>Description:</Paragraph> {currentLiquor.description}
          </Paragraph>

          {/* Ratings & Reviews Section */}
          <Title style={styles.sectionHeader}>Ratings & Reviews</Title>
          <Paragraph style={styles.reviewText}>
            Average Rating: {currentLiquor.rating || 0} ★ ({currentLiquor.numReviews || 0} Reviews)
          </Paragraph>

          {currentLiquor.reviews && currentLiquor.reviews.length > 0 ? (
            currentLiquor.reviews.map((review, index) => (
              <View key={index} style={styles.reviewItem}>
                <Paragraph style={styles.reviewRating}>Rating: {review.rating} ★</Paragraph>
                <Paragraph style={styles.reviewComment}>{review.comment}</Paragraph>
                {review.user && review.user.name && (
                  <Paragraph style={styles.reviewUser}>By: {review.user.name}</Paragraph>
                )}
              </View>
            ))
          ) : (
            <Paragraph style={styles.reviewComment}>No reviews yet.</Paragraph>
          )}

        </ScrollView>

        {/* Sticky Footer with buttons */}
        <View style={styles.stickyFooter}>
          <Button
            mode="contained"
            icon="cart-plus"
            buttonColor={colors.primary}
            contentStyle={styles.footerContent}
            labelStyle={styles.footerLabel}
            style={styles.footerButton}
            onPress={handleAddToCart}  // <-- Updated handler here
          >
            Add to Cart
          </Button>
          <Button
            mode="contained"
            icon="cart-outline"
            buttonColor={colors.secondary}
            contentStyle={styles.footerContent}
            labelStyle={styles.footerLabel}
            style={styles.footerButton}
            onPress={() => navigation.navigate('Cart')}
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
  },
  scrollContent: {
    padding: spacing.medium,
    paddingBottom: 140, // extra bottom padding for sticky footer
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.medium,
  },
  errorText: {
    color: colors.error,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: spacing.medium,
  },
  imageScroll: {
    marginBottom: spacing.medium,
  },
  imageScrollContent: {
    flexDirection: 'row',
  },
  imageItem: {
    width: 400,
    height: 400,
    marginRight: spacing.small,
    borderRadius: 8,
  },
  productName: {
    fontSize: 26,
    fontWeight: 'bold',
    color: colors.primary,
    textAlign: 'left',
    marginBottom: spacing.small,
  },
  price: {
    fontSize: 22,
    color: 'green',
    fontWeight: 'bold',
    marginTop: spacing.small,
    paddingTop: spacing.small,
    textAlign: 'left',
  },
  detailText: {
    fontSize: 16,
    color: colors.text,
    marginBottom: spacing.small,
    textAlign: 'left',
  },
  detailLabel: {
    fontWeight: 'bold',
  },
  infoText: {
    fontSize: 16,
    color: colors.text,
    marginBottom: spacing.large,
    textAlign: 'justify',
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.small,
    marginTop: spacing.large,
  },
  reviewText: {
    fontSize: 16,
    color: colors.placeholder,
    marginBottom: spacing.small,
  },
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
    borderTopColor: colors.placeholder,
  },
  footerButton: {
    flex: 1,
    marginHorizontal: spacing.small,
    borderRadius: 4, // makes the buttons flatter (less rounded)
    paddingVertical: 0, // remove vertical padding for a shorter button
  },
  footerContent: {
    height: 40, // shorter button height
  },
  footerLabel: {
    fontSize: 16, // adjust text size as needed
    fontWeight: 'bold',
  },
  reviewItem: {
    marginVertical: spacing.small,
    padding: spacing.small,
    backgroundColor: colors.ivory1,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  reviewRating: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
  },
  reviewComment: {
    fontSize: 14,
    color: colors.text,
    marginVertical: spacing.small,
  },
  reviewUser: {
    fontSize: 12,
    color: colors.placeholder,
    fontStyle: 'italic',
  },
});
