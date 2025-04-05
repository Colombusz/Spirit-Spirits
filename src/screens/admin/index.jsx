import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ScrollView, SafeAreaView } from 'react-native';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchLiquors, fetchLiquorById } from '../../redux/actions/liquorAction';
import CardItem from '../../components/admin/admincard';
import { Searchbar, FAB } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

export default function HomeIndex() {
  const dispatch = useDispatch();
  const { liquors, loading, error } = useSelector((state) => state.liquor);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredLiquors, setFilteredLiquors] = useState([]);
  
  useEffect(() => {
    dispatch(fetchLiquors());
  }, [dispatch]);

  useEffect(() => {
    if (liquors) {
      if (searchQuery.trim() === '') {
        setFilteredLiquors(liquors);
      } else {
        const filtered = liquors.filter(liquor => 
          liquor.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (liquor.description && liquor.description.toLowerCase().includes(searchQuery.toLowerCase()))
        );
        setFilteredLiquors(filtered);
      }
    }
  }, [searchQuery, liquors]);

  const onChangeSearch = query => setSearchQuery(query);
  const navigation = useNavigation();
  const handleAddNewLiqour = () => {

    navigation.navigate('CreateLiquor');
  };
  // CreateLiquor
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>Admin Home</Text>
        <Searchbar
          placeholder="Search liquors..."
          onChangeText={onChangeSearch}
          value={searchQuery}
          style={styles.searchBar}
          inputStyle={styles.searchInput}
          iconColor="#555"
        />
      </View>
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <Text style={styles.statusText}>Loading liquors...</Text>
        ) : error ? (
          <Text style={styles.errorText}>Error: {error}</Text>
        ) : filteredLiquors && filteredLiquors.length > 0 ? (
          filteredLiquors.map((liquor, index) => (
            <CardItem
              key={liquor.id || index}
              liqour={liquor}
            />
          ))
        ) : (
          <Text style={styles.statusText}>
            {searchQuery.trim() !== '' ? 'No results found' : 'No liquors found'}
          </Text>
        )}
      </ScrollView>
      
      <View style={styles.fabContainer}>
        <FAB
          style={styles.fab}
          icon="glass-wine"
          onPress={handleAddNewLiqour}
          color="white"
          label="Add Liquor"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5eccf',
    paddingTop: 20,
  },
  headerContainer: {
    padding: 16,
    paddingTop: 24,
    backgroundColor: '#cd7f32',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    marginBottom: 8,
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  searchBar: {
    elevation: 0,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    height: 42,
  },
  searchInput: {
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 80, // Add padding to account for FAB
  },
  statusText: {
    padding: 20,
    textAlign: 'center',
    color: '#757575',
  },
  errorText: {
    padding: 20,
    textAlign: 'center',
    color: '#d32f2f',
  },
  fabContainer: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    alignItems: 'center',
  },
  fab: {
    backgroundColor: '#523314',
    borderRadius: 28, // Higher value creates the cylindrical/pill shape
    paddingHorizontal: 12, // Add padding for the pill shape effect
  }
});