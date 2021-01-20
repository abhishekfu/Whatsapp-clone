import * as React from 'react';
import { StyleSheet,FlatList } from 'react-native';
import ChatListItem from '../components/ChatListItem';
import {API,graphqlOperation,Auth} from 'aws-amplify'
import { Text, View } from '../components/Themed';
import NewMessageButton from '../components/NewMessageButton';
import {getUser} from './queries'
export default function ChatScreen() {
  const [ chatRooms,setChatRooms] = React.useState([]);
  React.useEffect(()=>{
    const fetchChatRooms = async()=>{
      try{
        const userInfo = await Auth.currentAuthenticatedUser();
        const userData = await API.graphql(
          graphqlOperation(
            getUser,{
                id:userInfo.attributes.sub
            }
          )
        )
        setChatRooms(userData.data.getUser.chatRoomUser.items)
        //console.log(userData)
      }
      catch(e){
        console.log(e)
      }
    }
    fetchChatRooms();
  },[])

  return (
    <View style={styles.container}>
      <FlatList data={chatRooms}
        renderItem={({item})=> <ChatListItem chatRoom={item.chatRoom}/>}
        keyExtractor={(item)=>item.id}
      />
      <NewMessageButton/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  }
});
