import React from 'react'
import {TouchableOpacity,View,Text,TextInput,Image,KeyboardAvoidingView,StyleSheet} from 'react-native';

export default class LoginScreen extends React.Component{
    constructor(){
        super();
        this.state={
            emailId:'',
            password:''
        }
    }
    login=async(email, password)=> {
        if(email && password){
            try{
                const response = await firebase.auth().signInWithEmailAndPassword(email, password)
                if(response){
                    this.props.navigation.navigate('Transaction')
                }
            }
            catch(error){
                switch(error.code){
                    case 'auth/user-not-found':
                        Alert.alert("User does not exist");
                        console.log("USer doesnt exist");
                        break;
                        case 'auth/invalid-email':
                            Alert.alert("Incorrect email or password");
                            console.log("incorrect email or password");
                            break;
                }
            }
        }
        else{
            Alert.alert("Please enter Email and password");
            console.log("Please enter email and password")
        }
    }
    render(){
        return(
            <KeyboardAvoidingView style={styles.container} behavior="padding" enabled>
              <View>
                   <Image source={require("../assets/booklogo.jpg")} style={{width:200, height: 200,alignSelf:'center'}}/>
                   <Text style={{alignSelf:'center'}}> Willy </Text>
              </View>
              <TextInput onChangeText={(text)=>{
                  this.setState({
                      emailId:text,
                  })
              }}
                        style={styles.loginBox}
                        placeholder="abc@example.com"
                        keyboardType="email-address"/>
              <TextInput onChangeText={(text)=>{
                  this.setState({
                      password:text,
                  })
              }}
                        style={styles.loginBox}
                        placeholder="Password"
                        secureTextEntry={true}/>
              <TouchableOpacity 
              onPress={()=>this.login(this.state.emailId,this.state.password)}
              style={{height:30,width:90,borderWidth:1,marginTop:20,paddingTop:5,borderRadius:20,alignSelf:'center'}}>
                        <Text>Login</Text>
                </TouchableOpacity>
            </KeyboardAvoidingView>
        )

    }
}

const styles=StyleSheet.create({
    loginBox:{
        width:300,
        height:40,
        borderWidth:2,
        fontSize:20,
        margin:10,
        PaddingLeft:10,
        alignSelf:'center'
    },
})