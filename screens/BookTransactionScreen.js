import React from 'react';
import { Text, View, TouchableOpacity, StyleSheet,TextInput, Image, Alert, KeyboardAvoidingView, ToastAndroid} from 'react-native';
import * as Permissions from 'expo-permissions';
import { BarCodeScanner } from 'expo-barcode-scanner';
import firebase from 'firebase';
import db from '../config';

export default class TransactionScreen extends React.Component {
    constructor(){
      super();
      this.state = {
        hasCameraPermissions: null,
        scanned: false,
        buttonState: 'normal',
        scanBookID: '',
        scanStudentID: '',
        transactionMessage:'',
      }
    }

    getCameraPermissions = async (id) =>{
      const {status} = await Permissions.askAsync(Permissions.CAMERA);
      
      this.setState({
        hasCameraPermissions: status === "granted",
        buttonState: id,
        scanned: false,
      });
    }

    handleBarCodeScanned = async({data})=>{
      const {buttonState}=this.state;
      if(buttonState==="BookId"){
        this.setState({
          scanned: true,
          scanBookID: data,
          buttonState: 'normal'
        });
      }
      else
      if(buttonState==="StudentId"){
        this.setState({
          scanned: true,
          scanStudentID: data,
          buttonState: 'normal'
        });
      }
      
    }

    checkStudentEligibilityForBookIssue= async()=>{
      const studentRef= await db.collection("students").where("studentId","==",this.state.scanStudentID).get();
      var isStudentEligible=""
      if(studentRef.docs.length===0){
        Alert.alert("the student id doesnt exist in the database");
        this.setState({
          scanBookID:'',
          scanStudentID:''
        })
        isStudentEligible=false;
      }
      else{
          studentRef.docs.map((doc)=>{
            var student= doc.data();
            if(student.booksIssued<2){
              isStudentEligible=true;
            }
            else{
              isStudentEligible=false;
              Alert.alert("The student has already issued 2 books!")
              this.setState({
                scanBookID:'',
                scanStudentID:''
              })
            }
          })
      }
      return isStudentEligible;
    }

    checkStudentEligibilityForBookReturn = async()=>{
      const transactionRef = await db.collection("transactions").where("bookID","==",this.state.scanBookID).limit(1).get()
      var isStudentEligible = ""
      transactionRef.docs.map((doc)=>{
        var lastBookTransaction =  doc.data()
        if(lastBookTransaction.studentID===this.state.scanStudentID){
          isStudentEligible = true
        }
        else{
          Alert.alert("The book wasn't issued by this student")
          isStudentEligible =  false
          this.setState({
            scanBookID:'',
            scanStudentID:''
          })
        }
      })
      return isStudentEligible
    }

    checkBookEligibilty =async()=>{
      const bookRef = await db. collection("books").where("bookID","==",this.state.scanBookID).get()
      var transcationType="";
      if(bookRef.docs.length===0){
        transactionType=false;
      }
      else{
        bookRef.docs.map((doc)=>{
          var book=doc.data();
          if(book.bookAvail){
            transactionType="Issue"
          }
          else{
            transactionType="Return"
          }
        })
      }
      return transactionType;
    }

    handleTransaction=async()=>{

      // check if student is eligible for issue or return ===>done
      //  check if student id is there in the database ==>done
      // check if no of book issued to a student < 2 ==>done
      // check if the book is available or not  == done
      //check book is issued by some other student ==>done

      var transactionType= await this.checkBookEligibilty(); //will create later -->done
      if(!transactionType){ // check for false part
        Alert.alert("The book dosen't exist in the library database");
        this.setState({
          scanBookID:'',
          scanStudentID:''
        })
      }
      else if(transactionType==="Issue"){
        var isStudentEligible= await this.checkStudentEligibilityForBookIssue(); // will create later --->done
        if(isStudentEligible){
          this.initiateBookIssue();
          Alert.alert("Book issued to the student");
        }
        else{
          var isStudentEligible = await this.checkStudentEligibilityForBookReturn(); // will create later --->done   
          if(isStudentEligible) {
            this.initiateBookReturn()
            Alert.alert("Book returned to the library")
          }
        }
      }

    }

    initiateBookIssue=async()=>{
      db.collection("transactions").add({
        'studentID':this.state.scanStudentID,
        'bookID':this.state.scanBookID,
        'transcationType':'Issue',
        'date':firebase.firestore.Timestamp.now().toDate(),
      })

      db.collection("books").doc(this.state.scanBookID).update({
        bookAvail:false,
      })
      
      db.collection("books").doc(this.scanStudentID).update({
          'booksIssued':firebase.firestore.FieldValue.increment(1)
      })
      Alert.alert("Book ISsued!");

      this.setState({
        scanStudentID:'',
        scanBookID:'',
      })
      
        
    }
    initiateBookReturn=async()=>{
      db.collection("transactions").add({
        'studentID':this.state.scanStudentID,
        'bookID':this.state.scanBookID,
        'transactionType':'Return'
      })
      db.collection("books").doc(this.this.state.scanBookID).update({
        bookAvail:true,
      })
      db.collection("students").doc(this.scanStudentID).update({
        'booksIssued':firebase.firestore.FieldValue.increment(-1)
    })
    Alert.alert("Book Returned!");

    this.setState({
      scanBookID:'',
      scanBookID:'',
    })
  }

    render() {
      const hasCameraPermissions = this.state.hasCameraPermissions;
      const scanned = this.state.scanned;
      const buttonState = this.state.buttonState;

      if (buttonState !== "normal" && hasCameraPermissions){
        return(
          <BarCodeScanner
            onBarCodeScanned={scanned ? undefined : this.handleBarCodeScanned}
            style={StyleSheet.absoluteFillObject}
          />
        );
      }

      else if (buttonState === "normal"){
        return(
          <KeyboardAvoidingView style={styles.container} behavior="padding" enabled>
              <View>
                   <Image source={require("../assets/booklogo.jpg")} style={{width:200, height: 200}}/>
                   <Text> Willy </Text>
              </View>
              <View style={styles.inputView}>
                  <TextInput style={styles.inputBox} placeholder="BookID" value= {this.state.scanBookID} onChangeText={text=>this.setState({scanBookID: text})}/>
                  <TouchableOpacity
                      onPress={this.getCameraPermissions("BookId")}
                      style={styles.scanButton}>
                        <Text style={styles.buttonText}>Scan</Text>
                 </TouchableOpacity>
              </View>
              <View style={styles.inputView}>
                <TextInput style={styles.inputBox} placeholder="StudentID" value= {this.state.scanStudentID} onChangeText={text=>this.setState({scanStudentID: text})}/>            
                <TouchableOpacity
                    onPress={this.getCameraPermissions("StudentID")}
                    style={styles.scanButton}>
                    <Text style={styles.buttonText}>Scan</Text>
                </TouchableOpacity>
          
                <TouchableOpacity style={styles.submitButton} 
                                  onPress={async()=>{
                                            var transactionMessage=this.handleTransaction();
                                            this.setState=({
                                              scanBookID:'',
                                              scanStudentID:''
                                            })}}>
                  <Text style={styles.submitText}>Submit</Text>
               </TouchableOpacity>
              </View>
              </KeyboardAvoidingView>
        );
      }
    }
  }

  const styles = StyleSheet.create({
    submitButton:{
      backgroundColor:"#34fe78",
      width:100,
      height:50,
    },
    submitText:{
      padding: 10,
      textAlign: 'center',
      fontSize: 20,
      fontWeight: 'bold',
      color: 'white'
    },
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center'
    },
    displayText:{
      fontSize: 15,
      textDecorationLine: 'underline'
    },
    scanButton:{
      backgroundColor: '#2196F3',
      padding: 10,
      margin: 10
    },
    buttonText:{
      fontSize: 20,
    }
  }); 
