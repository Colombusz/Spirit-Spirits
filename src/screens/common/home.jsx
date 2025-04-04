// Home.jsx
import React, { useEffect } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { Card, Title, Paragraph } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchLiquors, fetchLiquorById } from '../../redux/actions/liquorAction';
import { useAsyncSQLiteContext } from '../../utils/asyncSQliteProvider';
import { colors, spacing, globalStyles } from '../../components/common/theme';
import Toast from 'react-native-toast-message';

const Home = () => {
  const db = useAsyncSQLiteContext();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { liquors, loading, error } = useSelector((state) => state.liquor);

  useEffect(() => {
    dispatch(fetchLiquors());
  }, [dispatch]);

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

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
      ) : error ? (
        <Paragraph style={styles.errorText}>Error: {error}</Paragraph>
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
  containerOverride: {
    // Additional container styles if needed
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: spacing.medium,
    color: colors.placeholder,
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
    // Optional: add a subtle border or background color for the panel look
    backgroundColor: colors.surface,
    borderRadius: 8,
    overflow: 'hidden',
  },
  cardCover: {
    // Optionally adjust height
    height: 170,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
    marginTop: spacing.small,
  },
  cardSubtitle: {
    fontSize: 14,
    color: colors.secondary,
    marginVertical: spacing.small,
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
