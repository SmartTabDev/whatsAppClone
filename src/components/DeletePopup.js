import {View, TouchableOpacity, Text} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {routeStyles} from '../styles/routeStyle';

export const DeletePopup = props => {
  const {onCancel, onDelete} = props;

  return (
    <View style={routeStyles.contactsPopup}>
      <TouchableOpacity onPress={onCancel} style={routeStyles.contactsPopupBtn}>
        <Text style={routeStyles.cancelBtn}>Cancel</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={onDelete} style={routeStyles.contactsPopupBtn}>
        <MaterialCommunityIcons name="delete" size={27} color="red" />
      </TouchableOpacity>
    </View>
  );
};
