import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { useEffect } from 'react';
import { useDispatch,useSelector } from 'react-redux';
import { fetchLiquors, fetchLiquorById } from '../../redux/actions/liquorAction';
import CardItem from '../../components/admin/admincard';
export default function HomeIndex() {
   const dispatch = useDispatch();
    const { liquors, loading, error } = useSelector((state) => state.liquor);
     useEffect(() => {
        dispatch(fetchLiquors());
      }, [dispatch]);
  return (
    <View>
      <Text>"Admin Home"</Text>
      {liquors && liquors.map((liquors) => (
        <CardItem
          liqour={liquors}
        />
      ))}
    </View>
  );
}
