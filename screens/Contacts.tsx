import * as React from 'react';
import { StyleSheet,FlatList } from 'react-native';
import ContactListItem from '../components/ContactListItem';
import {API,graphqlOperation} from 'aws-amplify';
import { Text, View } from '../components/Themed';
import { listUsers } from '../graphql/queries';

export default function Contacts() {
  const [users,setUsers] = React.useState([]);
  React.useEffect(()=>{
    const fetchUsers = async()=>{
      try{
        const usersData = await API.graphql(graphqlOperation(listUsers))
        setUsers(usersData.data.listUsers.items);
      }
      catch(e){
        console.log(e);
      }
    }
    fetchUsers();
  },[])


  return (
    <View style={styles.container}>
      <FlatList data={users}
      style={{width:'100%'}}
        renderItem={({item})=> <ContactListItem user={item}/>}
        keyExtractor={(item)=>item.id}
      />
      
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
