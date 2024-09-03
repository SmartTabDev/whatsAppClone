
import React from 'react';
import { View, Text } from 'react-native';
import { useSelector } from 'react-redux';
import { routeStyles } from '../styles/routeStyle';

const TypingPlaceholder = ({typingUsers, position}) => {
    const contacts = useSelector(state => state.contacts.contacts);
    const getUserName = (user) => {
        let index = null
        contacts.map((con, ind) => {
            con.emailAddresses.map(add => {
                if(add.email === user){
                    index = ind
                }
            })
        })
        if(index && contacts[index]?.displayName !== ''){
            return contacts[index].displayName
        }else {
            return user
        }
    }
    return (
        <View style={{position: position, bottom: position === 'absolute' ? 72 : 0, left: position === 'absolute' ? 20 : 0}}>
            {
                typingUsers.map((user, index) => 
                <Text key={index} style={routeStyles.message}> {/* {getUserName(user)}  is */} Typing...</Text>
                )
            }
        </View>
    )
}

export default TypingPlaceholder;