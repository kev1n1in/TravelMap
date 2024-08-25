import {
  collection,
  doc,
  setDoc,
  addDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebaseConfig";

// 創建用戶文檔
export const createUser = async (userId) => {
  try {
    const usersCollectionRef = collection(db, "users");

    // 使用 doc() 來生成一個隨機的文檔 ID
    const userDocRef = doc(usersCollectionRef);

    // 使用 setDoc 設置用戶文檔的內容，包括 user_id 和 createAt
    await setDoc(userDocRef, {
      user_id: userId,
      createAt: serverTimestamp(), // 自動設置創建時間
    });

    console.log("User created with ID:", userDocRef.id);
    return userDocRef.id;
  } catch (error) {
    console.error("Error creating user:", error);
    throw new Error("Failed to create user");
  }
};

// 創建旅行文檔
export const createTravel = async (userDocId, travelData) => {
  try {
    // 指定用戶文檔的路徑
    const userDocRef = doc(db, "users", userDocId);

    // 指定 journeys 子集合
    const travelsCollectionRef = collection(userDocRef, "journeys");

    // 使用 addDoc 在 journeys 子集合中創建旅行文檔，隨機生成 ID
    const travelDocRef = await addDoc(travelsCollectionRef, {
      ...travelData,
      createAt: serverTimestamp(),
    });

    console.log("Journey created with ID:", travelDocRef.id);
    return { id: travelDocRef.id, ...travelData };
  } catch (error) {
    console.error("Error creating travel:", error);
    throw new Error("Failed to create travel");
  }
};

// 抓取用戶的所有 journeys 文檔，並按照 createAt 進行排序
export const fetchJourneys = async (userDocId) => {
  try {
    const userDocRef = doc(db, "users", userDocId);
    const journeysCollectionRef = collection(userDocRef, "journeys");

    // 按照 createAt 字段排序
    const journeysQuery = query(
      journeysCollectionRef,
      orderBy("createAt", "asc")
    );

    const querySnapshot = await getDocs(journeysQuery);
    const journeys = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return journeys;
  } catch (error) {
    console.error("Error fetching journeys:", error);
    throw new Error("Failed to fetch journeys");
  }
};
