import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  Dimensions, 
  TouchableOpacity, 
  FlatList,
  ScrollView,
  ActivityIndicator,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { getAllPromos, deletePromo } from '../../redux/actions/promoAction';
// You'll need to import the delete action as well
// import { deletePromo } from '../../redux/actions/promoAction';

const COLORS = {
  primary: '#cd7f32',
  secondary: '#b9722d',
  tertiary: '#a46628',
  background: '#f5eccf',
  text: '#140d05',
  lightText: '#3e260f',
  cream: '#f6eed4',
  danger: '#d9534f',
};

const { width } = Dimensions.get('window');

const PromoCard = ({ promo, onDelete }) => {
  console.log("Promo Card Loaded:", promo.images); // Debugging log
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const imageCarouselRef = useRef(null);

  const handleImageScroll = (event) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / (width - 64));
    setActiveImageIndex(index);
  };

  const renderImageCarouselItem = ({ item }) => {
    console.log("Image Loaded:", item.url); // Debugging log
    return (
      <Image
        source={{ uri: item.url }}
        style={styles.promoImage}
        resizeMode="cover"
      />
    );
  };

  const renderImageDots = () => (
    <View style={styles.imageDots}>
      {promo.images.map((_, index) => (
        <View
          key={index}
          style={[styles.imageDot, index === activeImageIndex ? styles.activeImageDot : {}]}
        />
      ))}
    </View>
  );

  const handleDelete = () => {
    Alert.alert(
      "Delete Promotion",
      `Are you sure you want to delete "${promo.name}"?`,
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          onPress: () => onDelete(promo._id),
          style: "destructive"
        }
      ]
    );
  };

  return (
    <View style={styles.promoCard}>
      <TouchableOpacity 
        style={styles.trashIconContainer}
        onPress={handleDelete}
      >
        <TrashIcon size={20} color={COLORS.cream} />
      </TouchableOpacity>
      
      <View style={styles.imageCarouselContainer}>
        <FlatList
          ref={imageCarouselRef}
          data={promo.images}
          renderItem={renderImageCarouselItem}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleImageScroll}
          snapToAlignment="center"
          snapToInterval={width - 64}
          decelerationRate="fast"
          keyExtractor={(_, index) => `image-${promo._id}-${index}`}
        />
        {renderImageDots()}
        <View style={styles.discountBadge}>
          <Text style={styles.discountText}>{promo.discount}% OFF</Text>
        </View>
      </View>

      <View style={styles.promoInfo}>
        <Text style={styles.promoName}>{promo.name}</Text>
        <Text style={styles.promoCategory}>{promo.category}</Text>
      </View>
    </View>
  );
};

// Simple trash icon component
const TrashIcon = ({ size, color }) => {
  return (
    <View style={{ width: size, height: size }}>
      {/* Trash lid */}
      <View style={[{ 
        width: size, 
        height: size * 0.25, 
        borderTopLeftRadius: size * 0.1, 
        borderTopRightRadius: size * 0.1,
        backgroundColor: color 
      }]} />
      
      {/* Trash handle */}
      <View style={[{ 
        position: 'absolute',
        top: -size * 0.1,
        left: size * 0.35,
        width: size * 0.3, 
        height: size * 0.15, 
        borderTopLeftRadius: size * 0.05, 
        borderTopRightRadius: size * 0.05,
        backgroundColor: color 
      }]} />
      
      {/* Trash body */}
      <View style={[{ 
        marginTop: size * 0.05,
        width: size, 
        height: size * 0.7, 
        borderBottomLeftRadius: size * 0.1, 
        borderBottomRightRadius: size * 0.1,
        backgroundColor: color 
      }]}>
        {/* Trash lines */}
        <View style={[{ 
          position: 'absolute',
          top: size * 0.15,
          left: size * 0.25,
          width: size * 0.1, 
          height: size * 0.4, 
          backgroundColor: 'rgba(255,255,255,0.3)' 
        }]} />
        <View style={[{ 
          position: 'absolute',
          top: size * 0.15,
          left: size * 0.45,
          width: size * 0.1, 
          height: size * 0.4, 
          backgroundColor: 'rgba(255,255,255,0.3)' 
        }]} />
        <View style={[{ 
          position: 'absolute',
          top: size * 0.15,
          left: size * 0.65,
          width: size * 0.1, 
          height: size * 0.4, 
          backgroundColor: 'rgba(255,255,255,0.3)' 
        }]} />
      </View>
    </View>
  );
};

const FloatingActionButton = ({ onPress }) => (
  <TouchableOpacity style={styles.fab} onPress={onPress} activeOpacity={0.8}>
    <Text style={styles.fabIcon}>+</Text>
  </TouchableOpacity>
);

const PromosScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const { promos, loading, error } = useSelector((state) => state.promo);

  useEffect(() => {
    dispatch(getAllPromos());
    console.log("Promos Loaded:", promos); // Debugging log
  }, [dispatch]);

  console.log("Promos Loaded:", promos.data); // Debugging log
  
  const handleCreatePromo = () => {
    navigation.navigate('Promo');
  };

  const handleDeletePromo = (id) => {
    // Dispatch the delete promo action
    dispatch(deletePromo(id))
      .then(() => {
        // After successful delete, re-fetch the promos
        dispatch(getAllPromos());
      })
      .catch((error) => {
        console.log("Error deleting promo:", error);
      });
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.headerText}>Current Promotions</Text>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>Failed to load promotions.</Text>
        </View>
      ) : (
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {promos.data ? (
            promos.data.map((promo) => (
              <PromoCard 
                key={promo._id} 
                promo={promo} 
                onDelete={handleDeletePromo}
              />
            ))
          ) : (
            <Text style={styles.emptyText}>No promotions available.</Text>
          )}
        </ScrollView>
      )}
      
      <FloatingActionButton onPress={handleCreatePromo} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.tertiary,
    marginVertical: 16,
    marginHorizontal: 16,
  },
  promoCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: COLORS.cream,
    shadowColor: COLORS.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    overflow: 'hidden',
    position: 'relative', // needed for absolute positioning of the trash icon
  },
  trashIconContainer: {
    position: 'absolute',
    top: 12,
    left: 12,
    zIndex: 10,
    backgroundColor: COLORS.danger,
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  imageCarouselContainer: {
    height: 200,
    position: 'relative',
  },
  promoImage: {
    width: width - 64,
    height: 200,
  },
  imageDots: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.cream,
    marginHorizontal: 3,
    opacity: 0.6,
  },
  activeImageDot: {
    backgroundColor: COLORS.primary,
    opacity: 1,
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  discountBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    shadowColor: COLORS.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  discountText: {
    color: COLORS.cream,
    fontWeight: 'bold',
    fontSize: 16,
  },
  promoInfo: {
    padding: 16,
  },
  promoName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.tertiary,
    marginBottom: 4,
  },
  promoCategory: {
    fontSize: 16,
    color: COLORS.lightText,
  },
  fab: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    bottom: 30,
    right: 30,
    elevation: 5,
    shadowColor: COLORS.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  fabIcon: {
    fontSize: 30,
    color: COLORS.cream,
    fontWeight: 'bold',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    marginTop: 20,
    color: COLORS.lightText,
  }
});

export default PromosScreen;