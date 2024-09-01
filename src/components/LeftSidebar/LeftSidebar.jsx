import React, { useContext, useState } from 'react'
import './LeftSidebar.css'
import assets from '../../assets/assets'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../../context/AppContext'
import { arrayUnion, collection, setDoc, doc, getDocs, query, where, serverTimestamp, updateDoc } from '@firebase/firestore'
import { db } from '../../config/firebase'
import { toast } from 'react-toastify'





const LeftSidebar = () => {
  const navigate = useNavigate();
  const { userData,chatData,chatUser,setChatUser,setMessagesId,messagesId} = useContext(AppContext);
  const [user, setUser] = useState(null);
  const [showsearch, setShowSearch] = useState(false);

  const inputHandler = async (e) => {
    try {
      const input = e.target.value;
      if (input) {
        setShowSearch(true);
        const userRef = collection(db, 'users');
        const q = query(userRef, where('username', '==', input));
        const querySnap = await getDocs(q);
        if (!querySnap.empty && querySnap.docs[0].data().id !== userData.id) {
          let userExist = false;
          chatData.map((user) => {
            if (user.rId === querySnap.docs[0].data().id) {
              userExist = true;
            }
          });
          if (!userExist) {
          setUser(querySnap.docs[0].data());
          }
        }
        else {
          setUser(null);
        }
      }
      else {
        setShowSearch(false);
      }

    } catch (error) {

    }
  }

  const addChat = async () => {
    const messegeRef = collection(db, "messeges");
    const chatRef = collection(db, "chats");
    try {

      const newMessegeRef = doc(messegeRef);
      await setDoc(newMessegeRef, { createAt: serverTimestamp(), messages: [] });

      await updateDoc(doc(chatRef, user.id), {
        chatsData: arrayUnion({
          messegeId: newMessegeRef.id,
          lastMessage: "",
          rId: userData.id,
          updateAt: Date.now(),
          messageSeen: true
        })
      });

      await updateDoc(doc(chatRef, userData.id), {
        chatsData: arrayUnion({
          messegeId: newMessegeRef.id,
          lastMessage: "",
          rId: user.id,
          updateAt: Date.now(),
          messageSeen: true
        })
      });
    } catch (error) {
      toast.error(error.message);
      console.error(error);
    }
  }

  const setChat = async(item)=>{
   console.log(item);
   setMessagesId(item.messegeId);
   setChatUser(item);
  }

  return (
    <div className='ls'>
      <div className="ls-top">
        <div className="ls-nav">
          <img src={assets.logo} className='logo' alt="" />
          <div className="menu">
            <img src={assets.menu_icon} alt="" />
            <div className="sub-menu">
              <p onClick={() => { navigate('profile-update') }}>Edit Profile</p>
              <hr />
              <p>Logout</p>
            </div>
          </div>
        </div>

        <div className="ls-search">
          <img src={assets.search_icon} alt="" />
          <input onChange={inputHandler} type="text" placeholder='Search here..' />
        </div>

        <div className="ls-list">
          {showsearch && user ?
            <div onClick={addChat} className="friends add user">
              <img src={user.avatar} alt="" />
              <p>{user.name}</p>
            </div>
            // :Array(12).fill("").map((item, index) => (
            //   <div key={index} className="friends">
            //     {/* <img src={item.userData.avatar} alt="" /> */}
            //     <img src={assets.profile_img} alt="" />
            //     <div>
            //       <p>Pissaa</p>
            //       <span>hello kollo</span>
            //     </div>
            //   </div>
            // ))
            :
              chatData && chatData.length > 0 ? (
                chatData.map((item, index) => (
                  <div onClick={()=>{setChat(item)}} key={index} className="friends">
                    <img src={item.userData.avatar} alt="" />
                    <div>
                      <p>{item.userData.name}</p>
                      <span>{item.lastMessage}</span>
                    </div>
                  </div>
                )) 
              )
              : (
                <p>No chats available</p>
              )

          }
        </div>
      </div>
    </div>
  )
}

export default LeftSidebar