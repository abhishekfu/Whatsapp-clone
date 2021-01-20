import React, {useState, useEffect } from 'react'
import {FlatList,ImageBackground,KeyboardAvoidingView,Platform} from 'react-native'
import {useRoute} from '@react-navigation/native';
import {onCreateMessage} from '../graphql/subscriptions'
import ChatMessage from '../components/ChatMessage';
import BG from '../assets/images/BG.png';
import {messagesByChatRoom} from '../graphql/queries'
import {API,Auth,graphqlOperation} from 'aws-amplify'
import InputBox from '../components/InputBox';
const ChatRoomScreen = ()=>{
    const route = useRoute();
    const [messages,setMessages] = useState([]);
    const [myId,setMyId] = useState(null);
    const fetchMessages = async()=>{
        const messagesData = await API.graphql(graphqlOperation(messagesByChatRoom,{
            chatRoomID:route.params.id,
            sortDirection:"DESC"
        }))
        setMessages(messagesData.data.messagesByChatRoom.items)
    }
    //console.log(route.params.id);
    useEffect(()=>{
        
        fetchMessages();
    },[])
    useEffect(()=>{
        const getMyId = async () => {
            const userInfo = await Auth.currentAuthenticatedUser();
            setMyId(userInfo.attributes.sub)
        }
        getMyId();
    },[])
    useEffect(() => {
        const subscription = API.graphql(
          graphqlOperation(onCreateMessage)
        ).subscribe({
          next: (data) => {
            const newMessage = data.value.data.onCreateMessage;
            console.log(data)
            if (newMessage.chatRoomID !== route.params.id) {
              console.log("Message is in another room!")
              return;
            }
    
            fetchMessages();
            // setMessages([newMessage, ...messages]);
          }
        });
    
        return () => subscription.unsubscribe();
      }, [])
    
    return(
       <ImageBackground style={{width:'100%',height:'100%'}} source={BG}>
        <FlatList
         data={messages}
         renderItem={({item})=><ChatMessage myId={myId} message={item}/>}
         inverted
         />
          <InputBox chatRoomID={route.params.id}/>
         </ImageBackground>
         
    )
}

export default ChatRoomScreen