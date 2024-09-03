import { initializeApp } from "firebase/app";
import { createUserWithEmailAndPassword, getAuth, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { getFirestore, setDoc, doc, collection } from "firebase/firestore";
import { toast } from "react-toastify";
import { getDocs, query, where } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyBSREqOHOp9Pf4WAUfzBjg0R8jo5OCoPOA",
    authDomain: "chat-app-9ed14.firebaseapp.com",
    projectId: "chat-app-9ed14",
    storageBucket: "chat-app-9ed14.appspot.com",
    messagingSenderId: "840138133319",
    appId: "1:840138133319:web:f40bc708932396d243c662"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const signup = async (username, email, password) => {
    try {
        const res = await createUserWithEmailAndPassword(auth, email, password);
        const user = res.user;
        await setDoc(doc(db, 'users', user.uid), {
            id: user.uid,
            username: username.toLowerCase(),
            email,
            name: "",
            avatar: "",
            bio: "Hey,there i am using chat app",
            lastSeen: Date.now()

        })
        await setDoc(doc(db, 'chats', user.uid), {
            chatsData: []
        })

    } catch (error) {
        console.error(error);
        toast.error(error.code.split('/')[1].split('-').join(' '));
    }
}

const login = async (email, password) => {
    try {
        await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
        console.error(error);
        toast.error(error.code.split('/')[1].split('-').join(' '));
    }
}

const logout = async () => {
    try {
        await signOut(auth);
    }
    catch (error) {
        console.error(error);
        toast.error(error.code.split('/')[1].split('-').join(' '));
    }
}

const resetPass = async (email) => {
    if (!email) {
        toast.error('Please provide an email');
        return;
    }
    try {
        const userRef = collection(db, 'users');
        const q = query(userRef, where('email', '==', email));
        const querySnap = await getDocs(q);
        if (!querySnap.empty) {
            await sendPasswordResetEmail(auth, email);
            toast.success('Reset link sent to your email');
        }
        else {
            toast.error('Email not found');
        }
    } catch (error) {
        console.error(error);
        toast.error(error.code.split('/')[1].split('-').join(' '));
    }
}

export { signup, login, logout, auth, db, resetPass }