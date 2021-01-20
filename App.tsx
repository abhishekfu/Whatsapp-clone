import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {AppLoading} from 'expo';
import useCachedResources from './hooks/useCachedResources';
import useColorScheme from './hooks/useColorScheme';
import Navigation from './navigation';
import * as Font from 'expo-font';
import {withAuthenticator} from 'aws-amplify-react-native';
import Amplify from 'aws-amplify';
import config from './aws-exports';
import {Auth,API,graphqlOperation} from 'aws-amplify';
import {getUser} from './graphql/queries';
import {createUser} from './graphql/mutations';
Amplify.configure(config);


const randomImages = [
  'https://images.unsplash.com/photo-1607062151621-16b216a2bba1?ixid=MXwxMjA3fDB8MHx0b3BpYy1mZWVkfDV8dG93SlpGc2twR2d8fGVufDB8fHw%3D&ixlib=rb-1.2.1',
  'https://images.unsplash.com/photo-1607107893608-7f0b8f32858b?ixid=MXwxMjA3fDB8MHx0b3BpYy1mZWVkfDIyfHRvd0paRnNrcEdnfHxlbnwwfHx8&ixlib=rb-1.2.1',
  'https://images.unsplash.com/photo-1606876547464-29fbdca8be67?ixid=MXwxMjA3fDB8MHx0b3BpYy1mZWVkfDI1fHRvd0paRnNrcEdnfHxlbnwwfHx8&ixlib=rb-1.2.1',
  'https://images.unsplash.com/photo-1583214225227-f1adc91f0d22?ixid=MXwxMjA3fDB8MHx0b3BpYy1mZWVkfDI4fHRvd0paRnNrcEdnfHxlbnwwfHx8&ixlib=rb-1.2.1'
]

function App() {
  const getFonts = () =>  Font.loadAsync({
    'space-mono':require('./assets/fonts/SpaceMono-Regular.ttf'),
    'material-community':require('./node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/MaterialCommunityIcons.ttf'),
    'Fontisto':require('./node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/Fontisto.ttf'),
    'FontAwesome5Free-Regular':require('./node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/FontAwesome5_Regular.ttf'),
  })

  const [fontsLoaded, setFontsLoaded] = useState(false);
  const isLoadingComplete = useCachedResources();
  const colorScheme = useColorScheme();
  const getRandomImage = ()=>{
    return randomImages[Math.floor(Math.random()*randomImages.length)]
  }
  useEffect(()=>{
    const fetchUser = async()=>{
      //get Authenticated user from auth
      const userInfo = await Auth.currentAuthenticatedUser({bypassCache:true});
      
      if(userInfo){
          //get the user from backend with the user id from Auth
          const userData = await API.graphql(graphqlOperation(getUser,{id:userInfo.attributes.sub}))
          //if there is no user in DB with the id, then create one
          if(userData.data.getUser){
            console.log("User is already registered in database");
            return;
          }
          const newUser = {
            id:userInfo.attributes.sub,
            name:userInfo.username,
            imageUri:getRandomImage(),
            status:'Hey, I am using WhatsApp'
          }
          await API.graphql(
            graphqlOperation(
              createUser,{input:newUser}
            )
          )
      }
    
      
    };
    fetchUser();
  },[])

  if (fontsLoaded) {
    if (!isLoadingComplete) {
      return null;
    } else {
      return (
        <SafeAreaProvider>
          <Navigation colorScheme={colorScheme} />
          <StatusBar />
        </SafeAreaProvider>
      );
    }
  }else{
    return(
      <AppLoading
      startAsync={getFonts}
      onFinish={()=>setFontsLoaded(true)}
      />
    )
  }
}
export default withAuthenticator(App);