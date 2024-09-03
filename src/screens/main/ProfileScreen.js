/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { Avatar } from '../../components/Avatar';
import { AvatarGroup } from '../../components/AvatarGroup';
import {
  fontRegular, fontSemiBold
} from '../../styles/customFont'
import { FlatList } from 'react-native-gesture-handler';

const ProfileScreen = props => {
  const route = useRoute();

  return (
    <View style={{flex: 1}}>
      <View
        style={styles.particiContainer}>
        {route.params.item.participants?.length ? (
          <AvatarGroup
            sources={route.params.item.participants?.map(({ image }) => ({ uri: image }))}
            style={styles.avatarGroup}
          />
        ) : (
          <Avatar source={{ uri: route.params.item.image }} style={styles.avatarGroup} />
        )}
        <Text style={styles.green}> {route.params.item.name} </Text>
      </View>

      <FlatList 
        data={[...(route.params.item?.participants?.map(({email}) => email) ?? []), route.params?.item?.email].filter((email) => email !== undefined)}
        renderItem={({item}) => (
          <View style={styles.card}>
            <View style={styles.number}>
              <View style={styles.paddingHorizontal}>
                <Text style={styles.text}>{item}</Text>
                <Text style={styles.subText}>Email</Text>
              </View>
            </View>
          </View>
        )}
      />
    </View>
  );
};
export default ProfileScreen;

const styles = StyleSheet.create({
  header: {
    height: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    color: '#fff',
    ...fontSemiBold,
    marginTop: 270,
    padding: 20,
  },
  card: {
    marginTop: 10,
  },
  row: {
    height: 50,
    padding: 10,
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderColor: '#f5f5f5',
    backgroundColor: '#fff',
  },
  encrypt: {
    height: 50,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#f5f5f5',
    backgroundColor: '#fff',
  },
  number: {
    height: 50,
    paddingHorizontal: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#f5f5f5',
    backgroundColor: '#fff',
  },
  text: {
    fontSize: 14,
    color: '#333',
    ...fontRegular,
  },
  subText: {
    fontSize: 10,
    color: '#555',
    ...fontRegular
  },
  green: {
    color: '#075e54',
    ...fontSemiBold,
    fontSize: 18,
    marginTop: 20,
  },
  particiContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 300,
    backgroundColor: '#fff',
  },
  avatarGroup: {
    height: 150, width: 150, borderRadius: 75, marginTop: 20
  },
  paddingHorizontal: {
    paddingHorizontal: 5
  }
});
