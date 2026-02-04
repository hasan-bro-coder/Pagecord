import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Link from "next/link";


export default function Home() {

  return <div>
    <Navbar></Navbar>
    <main className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden bg-black h-screen">
      
      {/* The "Glow" background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-125 bg-gray-500/20 green-500/20 blur-[120px] rounded-full" />
      
      <div className="container relative z-10 mx-auto px-4 text-center">
        
        <h1 className="text-5xl md:text-8xl font-extrabold tracking-tight mb-6 bg-linear-to-b from-white to-white/50 bg-clip-text text-transparent">
          <span className="text-white green-600 ">Pagecord</span>
        </h1>
        
        <p className="max-w-2xl mx-auto text-lg md:text-xl text-zinc-400 mb-10">
          Pagecord is a minimal chat app like discord made by me for talking with my friends.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button size="lg" className="h-12 px-8 bg-white text-black hover:bg-zinc-200 text-base font-semibold">
            <Link href="/me">Start Chatting Now</Link>
          </Button>
          <Button size="lg" variant="link" className="h-12 px-8 text-white text-base border-2 border-white">
            <Link target="_blank" href="https://github.com/hasan-bro-coder/Pagecord.git">View Github</Link>
          </Button>
        </div>
      </div>
    </main>
  </div>
}

// "use client";
// import { useState, useEffect } from "react";
// import { useAuthState } from "react-firebase-hooks/auth";
// import {
//   collection,
//   query,
//   where,
//   onSnapshot,
//   addDoc,
//   getDocs,
//   orderBy,
// } from "firebase/firestore";
// import { auth, db } from "@/lib/firebase";
// import {
//   signInWithPopup,
//   signOut,
//   createUserWithEmailAndPassword,
//   signInWithEmailAndPassword,
// } from "firebase/auth";
// import { googleProvider } from "@/lib/firebase";
// import Link from "next/link";

// interface User {
//   id: string;
//   email: string;
//   name: string;
//   photoURL?: string;
// }

// interface Conversation {
//   id: string;
//   participants: string[];
//   lastMessage?: string;
//   lastMessageAt?: any;
//   otherUser?: User;
// }

// export default function Home() {
//   const [user, loading] = useAuthState(auth as any);
//   const [users, setUsers] = useState<User[]>([]);
//   const [conversations, setConversations] = useState<Conversation[]>([]);
//   // const [email, setEmail] = useState("");
//   // const [password, setPassword] = useState("");
//   // const [name, setName] = useState("");
//   const [showSignUp, setShowSignUp] = useState(false);

//   // Listen for conversations where user is a participant
//   useEffect(() => {
//     if (!user) return;

//     const q = query(
//       collection(db, "conversations"),
//       where("participants", "array-contains", user.uid),
//       orderBy("lastMessageAt", "desc"),
//     );

//     const unsubscribe = onSnapshot(q, async (snapshot) => {
//       const convos = await Promise.all(
//         snapshot.docs.map(async (doc) => {
//           const data = doc.data();
//           const otherUserId = data.participants.find(
//             (id: string) => id !== user.uid,
//           );
//           let otherUser = null;

//           if (otherUserId) {
//             const userDoc = await getDocs(collection(db, "users"));
//             const users = userDoc.docs.map(
//               (doc) => ({ id: doc.id, ...doc.data() }) as User,
//             );
//             otherUser = users.find((u) => u.id === otherUserId);
//           }

//           return {
//             id: doc.id,
//             ...data,
//             otherUser,
//           } as Conversation;
//         }),
//       );
//       setConversations(convos);
//     });

//     return () => unsubscribe();
//   }, [user]);

//   // Load all users
//   useEffect(() => {
//     if (!user) return;

//     const loadUsers = async () => {
//       const usersSnapshot = await getDocs(collection(db, "users"));
//       const allUsers = usersSnapshot.docs
//         .map((doc) => ({ id: doc.id, ...doc.data() }) as User)
//         .filter((u) => u.id !== user.uid);
//       setUsers(allUsers);
//     };

//     loadUsers();
//   }, [user]);

//   const handleGoogleSignIn = async () => {
//     try {
//       const result = await signInWithPopup(auth, googleProvider);
//       // Create/update user in Firestore
//       await addDoc(collection(db, "users"), {
//         id: result.user.uid,
//         email: result.user.email,
//         name: result.user.displayName,
//         photoURL: result.user.photoURL,
//         createdAt: new Date(),
//       });
//     } catch (error) {
//       console.error("Google sign in error:", error);
//     }
//   };

//   // const handleEmailSignUp = async () => {
//   //   try {
//   //     const result = await createUserWithEmailAndPassword(auth, email, password);
//   //     await addDoc(collection(db, "users"), {
//   //       id: result.user.uid,
//   //       email: result.user.email,
//   //       name: name,
//   //       createdAt: new Date(),
//   //     });
//   //   } catch (error) {
//   //     console.error("Email sign up error:", error);
//   //   }
//   // };

//   // const handleEmailSignIn = async () => {
//   //   try {
//   //     await signInWithEmailAndPassword(auth, email, password);
//   //   } catch (error) {
//   //     console.error("Email sign in error:", error);
//   //   }
//   // };

//   const startNewDM = async (otherUserId: string) => {
//     if (!user) return;

//     // Check if conversation already exists
//     const q = query(
//       collection(db, "conversations"),
//       where("participants", "array-contains", user.uid),
//     );

//     const snapshot = await getDocs(q);
//     const existingConvo = snapshot.docs.find((doc) => {
//       const data = doc.data();
//       return data.participants.includes(otherUserId);
//     });

//     if (existingConvo) {
//       // Conversation already exists
//       return;
//     }

//     // Create new conversation
//     await addDoc(collection(db, "conversations"), {
//       participants: [user.uid, otherUserId],
//       createdAt: new Date(),
//       lastMessageAt: new Date(),
//     });
//   };

//   if (loading) return <div className="p-4">Loading...</div>;

//   if (!user) {
//     return (
//       <div className="min-h-screen bg-gray-100 flex items-center justify-center">
//         <div className="bg-white p-8 rounded-lg shadow-md w-96">
//           <h1 className="text-2xl font-bold mb-6">Chat App</h1>

//           <button
//             onClick={handleGoogleSignIn}
//             className="w-full bg-blue-500 text-white py-2 rounded mb-4 hover:bg-blue-600"
//           >
//             Sign in with Google
//           </button>

//           <div className="border-t pt-4">
//             {showSignUp && (
//               <>
//                 <input
//                   type="text"
//                   placeholder="Name"
//                   value={name}
//                   onChange={(e) => setName(e.target.value)}
//                   className="w-full p-2 border rounded mb-2"
//                 />
//                 <input
//                   type="email"
//                   placeholder="Email"
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                   className="w-full p-2 border rounded mb-2"
//                 />
//                 <input
//                   type="password"
//                   placeholder="Password"
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                   className="w-full p-2 border rounded mb-4"
//                 />
//                 <button
//                   onClick={handleEmailSignUp}
//                   className="w-full bg-green-500 text-white py-2 rounded mb-2 hover:bg-green-600"
//                 >
//                   Sign Up
//                 </button>
//                 <button
//                   onClick={() => setShowSignUp(false)}
//                   className="text-blue-500 text-sm"
//                 >
//                   Already have an account? Sign in
//                 </button>
//               </>
//             )}
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-100">
//       <nav className="bg-white shadow p-4 flex justify-between items-center">
//         <h1 className="text-xl font-bold">Chat App</h1>
//         <div className="flex items-center gap-4">
//           <span>Hello, {user.displayName || user.email}</span>
//           <button
//             onClick={() => signOut(auth)}
//             className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
//           >
//             Sign Out
//           </button>
//         </div>
//       </nav>

//       <div className="max-w-4xl mx-auto p-4">
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//           {/* Users List */}
//           <div className="md:col-span-1 bg-white rounded-lg shadow">
//             <div className="p-4 border-b">
//               <h2 className="font-bold">Start New Chat</h2>
//             </div>
//             <div className="max-h-[500px] overflow-y-auto">
//               {users.map((userItem) => (
//                 <div
//                   key={userItem.id}
//                   className="p-4 border-b hover:bg-gray-50 cursor-pointer"
//                   onClick={() => startNewDM(userItem.id)}
//                 >
//                   <div className="flex items-center gap-3">
//                     {userItem.photoURL ? (
//                       <img
//                         src={userItem.photoURL}
//                         alt={userItem.name}
//                         className="w-10 h-10 rounded-full"
//                       />
//                     ) : (
//                       <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white">
//                         {userItem.name?.charAt(0)}
//                       </div>
//                     )}
//                     <div>
//                       <p className="font-medium">{userItem.name}</p>
//                       <p className="text-sm text-gray-500">{userItem.email}</p>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* Conversations List */}
//           <div className="md:col-span-2 bg-white rounded-lg shadow">
//             <div className="p-4 border-b">
//               <h2 className="font-bold">Your Conversations</h2>
//             </div>
//             <div className="max-h-[500px] overflow-y-auto">
//               {conversations.length === 0 ? (
//                 <div className="p-8 text-center text-gray-500">
//                   No conversations yet. Start a new chat!
//                 </div>
//               ) : (
//                 conversations.map((convo) => (
//                   <Link
//                     key={convo.id}
//                     href={`/${convo.id}`}
//                     className="block p-4 border-b hover:bg-gray-50"
//                   >
//                     <div className="flex items-center gap-3">
//                       {convo.otherUser?.photoURL ? (
//                         <img
//                           src={convo.otherUser.photoURL}
//                           alt={convo.otherUser.name}
//                           className="w-12 h-12 rounded-full"
//                         />
//                       ) : (
//                         <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center text-white">
//                           {convo.otherUser?.name?.charAt(0)}
//                         </div>
//                       )}
//                       <div className="flex-1">
//                         <div className="flex justify-between">
//                           <p className="font-medium">{convo.otherUser?.name}</p>
//                           <span className="text-sm text-gray-500">
//                             {convo.lastMessageAt?.toDate().toLocaleDateString()}
//                           </span>
//                         </div>
//                         <p className="text-gray-600 truncate">
//                           {convo.lastMessage || "No messages yet"}
//                         </p>
//                       </div>
//                     </div>
//                   </Link>
//                 ))
//               )}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
