import React from 'react'
import { View, Text,FlatList,StyleSheet,TextInput,TouchableOpacity } from 'react-native'
import db from '../config';
import ScrollView from 'react-native-gesture-handler';

export default class SearchScreen extends React.Component{
    constructor(){
        super();
        this.state={
            allTransactions:[],
            lastVisibleTransaction:null,
        }
    }
    componentDidMount = async()=>{
        const query=await db.collection("transactions").get();
        query.docs.map((doc)=>{
            this.setState({
                allTransactions:[...this.state.allTransactions,doc.data()],
                lastVisibleTransaction:doc,
            })
        })

    }
    fetchMoreTransaction = async()=>{
        const query = await db.collection("transactions").startAfter(this.state.lastVisibleTransaction).limit(10).get()
        query.docs.map((doc)=>{
            this.setState({
                allTransactions:[...this.state.allTransactions,doc.data()],
                lastVisibleTransaction:doc,
            })
        })  
    }   
    render () {
        return(
           /* <ScrollView>
                {this.state.allTransactions.map((transaction)=>{
                    return(
                        <View key={index} style={{borderBottomWidth:3}}>
                            <Text>{"Book ID:"+transaction.bookID}</Text>
                            <Text>{"Student ID:"+transaction.studentID}</Text>
                            <Text>{"TransactionType:"+transaction.transactionType}</Text>
                        </View>

                    )
                })}
            </ScrollView>*/
     
            <View style={styles.container}>
                <View style={styles.searchBar}>
                    <TextInput 
                        style ={styles.bar}
                        placeholder = "Enter Book Id or Student Id"
                        onChangeText={(text)=>{this.setState({search:text})}}/>
                        <TouchableOpacity
                                style = {styles.searchButton}
                                onPress={()=>{this.searchTransactions(this.state.search)}}>
                                    <Text>Search</Text>
                        </TouchableOpacity>
                </View>

                <FlatList
                    data={this.state.allTransactions}
                    renderItem={({item})=>(
                    <View style={{borderBottomWidth: 2}}>
                            <Text>{"Book Id: " + item.bookId}</Text>
                            <Text>{"Student id: " + item.studentId}</Text>
                            <Text>{"Transaction Type: " + item.transactionType}</Text>
                    </View>
          )}
          keyExtractor= {(item, index)=> index.toString()}
          onEndReached ={this.fetchMoreTransactions}
          onEndReachedThreshold={0.7}
        /> 
            </View>

        )
    }
}
    const styles = StyleSheet.create({
        container: {
          flex: 1,
          marginTop: 20
        },
        searchBar:{
          flexDirection:'row',
          height:40,
          width:'auto',
          borderWidth:0.5,
          alignItems:'center',
          backgroundColor:'grey',
      
        },
        bar:{
          borderWidth:2,
          height:30,
          width:300,
          paddingLeft:10,
        },
        searchButton:{
          borderWidth:1,
          height:30,
          width:50,
          alignItems:'center',
          justifyContent:'center',
          backgroundColor:'green'
        }
      })
