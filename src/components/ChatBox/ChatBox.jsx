import React, { useContext, useEffect, useState } from 'react'
import './ChatBox.css'
import assets from '../../assets/assets'
import { AppContext } from '../../context/AppContext'
import { onSnapshot, doc, updateDoc } from 'firebase/firestore'
import { db } from '../../config/firebase'
import { arrayUnion, getDoc } from '@firebase/firestore'
import { toast } from 'react-toastify'
// import { uploadBytes, ref } from 'firebase/storage'
import { ref, uploadBytes, getDownloadURL, getStorage } from "firebase/storage"; // Ensure you import these functions

const storage = getStorage();

const ChatBox = () => {
  const { userData, messagesId, chatUser, messages, setMessages } = useContext(AppContext);
  const [input, setInput] = useState("");

  const sendMessage = async () => {
    try {
      if (input && messagesId) {
        await updateDoc(doc(db, 'messeges', messagesId), {
          messages: arrayUnion({
            sId: userData.id,
            text: input,
            createAt: new Date()
          })
        })
        const userIDs = [chatUser.rId, userData.id];

        userIDs.forEach(async (id) => {
          const userChatRef = doc(db, 'chats', id);
          const userChatsSnapshot = await getDoc(userChatRef);

          if (userChatsSnapshot.exists()) {
            const userChatData = userChatsSnapshot.data();
            const chatIndex = userChatData.chatsData.findIndex((c) => c.messegeId === messagesId);
            userChatData.chatsData[chatIndex].lastMessage = input.slice(0, 30);
            userChatData.chatsData[chatIndex].updateAt = Date.now();
            if (userChatData.chatsData[chatIndex].rId === userData.id) {
              userChatData.chatsData[chatIndex].messageSeen = false;

            }
            await updateDoc(userChatRef, {
              chatsData: userChatData.chatsData
            })

          }

        })
      }
    } catch (error) {
      toast.error(error.message);
    }
    setInput("");
  }

  const sendImage = async (e) => {
    try {
      const file = e.target.files[0];
      const storageRef = ref(storage, `images/${file.name}`); // Create a valid reference
      const snapshot = await uploadBytes(storageRef, file); // Upload the file
      const fileURL = await getDownloadURL(snapshot.ref); // Get the download URL

      if (fileURL && messagesId) {
        await updateDoc(doc(db, 'messages', messagesId), {
          messages: arrayUnion({
            sId: userData.id,
            image: fileURL,
            createAt: new Date()
          })
        });

        const userIDs = [chatUser.rId, userData.id];

        userIDs.forEach(async (id) => {
          const userChatRef = doc(db, 'chats', id);
          const userChatsSnapshot = await getDoc(userChatRef);

          if (userChatsSnapshot.exists()) {
            const userChatData = userChatsSnapshot.data();
            const chatIndex = userChatData.chatsData.findIndex((c) => c.messegeId === messagesId);
            userChatData.chatsData[chatIndex].lastMessage = "Image";
            userChatData.chatsData[chatIndex].updateAt = Date.now();
            if (userChatData.chatsData[chatIndex].rId === userData.id) {
              userChatData.chatsData[chatIndex].messageSeen = false;

            }
            await updateDoc(userChatRef, {
              chatsData: userChatData.chatsData
            })

          }
        });
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    }
  };



  // const sendImage = async (e) => {
  //   try {
  //     const fileURl = await uploadBytes(e.target.files[0]);
  //     if (fileURl && messagesId) {
  //       await updateDoc(doc(db, 'messeges', messagesId), {
  //         messages: arrayUnion({
  //           sId: userData.id,
  //           image: fileURl,
  //           createAt: new Date()
  //         })
  //       })

  //       const userIDs = [chatUser.rId, userData.id];

  //       userIDs.forEach(async (id) => {
  //         const userChatRef = doc(db, 'chats', id);
  //         const userChatsSnapshot = await getDoc(userChatRef);

  //         if (userChatsSnapshot.exists()) {
  //           const userChatData = userChatsSnapshot.data();
  //           const chatIndex = userChatData.chatsData.findIndex((c) => c.messegeId === messagesId);
  //           userChatData.chatsData[chatIndex].lastMessage = "Image";
  //           userChatData.chatsData[chatIndex].updateAt = Date.now();
  //           if (userChatData.chatsData[chatIndex].rId === userData.id) {
  //             userChatData.chatsData[chatIndex].messageSeen = false;

  //           }
  //           await updateDoc(userChatRef, {
  //             chatsData: userChatData.chatsData
  //           })

  //         }

  //       })

  //     }
  //   } catch (error) {
  //     toast.error(error.message);
  //     console.log(error);
  //   }
  // }


  const ConvertTimeStamp = (timestamp) => {
    let date = timestamp.toDate();
    const hour = date.getHours();
    const minute = date.getMinutes();
    if (hour > 12) {
      return hour - 12 + ":" + minute + "PM";
    }
    else {
      return hour + ":" + minute + "AM";
    }
  }

  useEffect(() => {
    if (messagesId) {
      const unsub = onSnapshot(doc(db, 'messeges', messagesId), (res) => {
        setMessages(res.data().messages.reverse())
      })
      return () => {
        unsub();
      }
    }
  }, [messagesId])

  return chatUser ?
    <div className='chat-box'>
      <div className="chat-user">
        <img src={chatUser.userData.avatar} alt="" />
        <p> {chatUser.userData.name} <img className='dot' src={assets.green_dot} alt="" /></p>
        <img src={assets.help_icon} className='help' alt="" />
      </div>

      <div className="chat-msg">
        {messages.map((msg, index) => (
          <div key={index} className={msg.sId === userData.id ? "s-msg" : "r-msg"}>
            {msg['image'] ? <img className='msg-img' src={msg.image} alt="" /> : <p className="msg">{msg.text}</p>}
            <div>
              <img src={msg.sId === userData.id ? userData.avatar : chatUser.userData.avatar} alt="" />
              <p>{ConvertTimeStamp(msg.createAt)}</p>
            </div>
          </div>
        ))}




      </div>



      <div className="chat-input">
        <input onChange={(e) => { setInput(e.target.value) }} value={input} type="text" placeholder='send a messege' />
        <input onChange={sendImage} type="file" id="image" accept='image/png, image/jpeg' hidden />
        <label htmlFor="image">
          <img src={assets.gallery_icon} alt="" />
        </label>
        <img onClick={sendMessage} src={assets.send_button} alt="" />
      </div>
    </div>
    : <div className='chat-welcome'>
      <img src={assets.logo_icon} alt="" />
      <p>Chat anytime, anywhere</p>
    </div>
}

export default ChatBox