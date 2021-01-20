import React from 'react'
import { View, Text, Image,TouchableWithoutFeedback } from 'react-native';
import { User } from '../../types';
import styles from './style';
import {API,graphqlOperation,Auth} from 'aws-amplify';
import {createChatRoom,createChatRoomUser} from '../../graphql/mutations'
import { useNavigation } from '@react-navigation/native';
export type ContactListItemProps = {
    user: User;
}

const ContactListItem = (props: ContactListItemProps) => {
    const { user } = props;
    const navigation = useNavigation();
    const onClick = async ()=>{
        try{
            //Create a chat room
            const newChatRoomData = await API.graphql(
                graphqlOperation(createChatRoom,
                    {
                        input:{
                            lastMessageID:"b3d786cc-157c-4ae0-88bb-5c63d30cabef"
                        }
                    }
                    ));
            
            if(!newChatRoomData.data){
                console.log("Failed to create a chat room");
                return;
            }

            const newChatRoom = newChatRoomData.data.createChatRoom;
            console.log(newChatRoomData);
            //Add user to the chat room
            await API.graphql(graphqlOperation(
                createChatRoomUser,{
                    input:{
                        userID:user.id,
                        chatRoomID:newChatRoom.id
                    }
                    
                }
            ))
            //Add authenticated user to the chat room
            const userInfo = await Auth.currentAuthenticatedUser();
            await API.graphql(graphqlOperation(
                createChatRoomUser,{
                   input:{
                    userID:userInfo.attributes.sub,
                    chatRoomID:newChatRoom.id
                   }
                }
            ))
            navigation.navigate('ChatRoom',{id:newChatRoom.id,name:"hardcoded name"})
        }
        catch(e){
            console.log(e)
        }
    }
    
    return (
        <TouchableWithoutFeedback onPress={
            onClick
            }>
        <View style={styles.container}>
            <View style={styles.leftContainer}>
            <Image source={{ uri: user.imageUri }} style={styles.avatar} />
            <View style={styles.midContainer}>
                <Text style={styles.username}>{user.name}</Text>
        <Text numberOfLines={2} style={styles.status}>{user.status}</Text>
            </View>
            </View>
           
        </View>
        </TouchableWithoutFeedback>
    )
}

export default ContactListItem;