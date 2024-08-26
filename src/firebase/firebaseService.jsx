import {
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  where,
  deleteDoc,
  orderBy,
  startAfter,
  addDoc,
  limit as firestoreLimit,
} from "firebase/firestore";
import { db } from "./firebaseConfig";
import dayjs from "dayjs";

export const handleCreateJourney = async (title, description) => {
  try {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      throw new Error("User ID not found in localStorage");
    }

    if (!title || !description) {
      throw new Error("Title or Description cannot be empty");
    }

    const usersCollectionRef = collection(db, "journeys");
    const newDocRef = doc(usersCollectionRef);

    await setDoc(newDocRef, {
      user_id: userId,
      title: title,
      description: description,
    });

    console.log("New journey document created with ID:", newDocRef.id);
    alert("新行程已成功創建！");
  } catch (error) {
    console.error("Error creating journey document:", error);
    alert("出了一點問題：" + error.message);
  }
};

export async function fetchUserDocuments({ pageParam = null, limit = 6 }) {
  try {
    const usersCollectionRef = collection(db, "journeys");

    let q = query(
      usersCollectionRef,
      orderBy("user_id"),
      firestoreLimit(limit)
    );

    if (pageParam) {
      q = query(
        usersCollectionRef,
        orderBy("user_id"),
        startAfter(pageParam),
        firestoreLimit(limit)
      );
    }

    const querySnapshot = await getDocs(q);

    const usersList = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];

    return {
      usersList,
      lastVisible,
    };
  } catch (error) {
    console.error("Error fetching user documents:", error);
    throw error;
  }
}

// 獲取用戶的所有行程
export const fetchTrips = async (userId) => {
  try {
    if (!userId) {
      throw new Error("User ID is required");
    }

    const usersCollectionRef = collection(db, "journeys");
    const userQuery = query(usersCollectionRef, where("user_id", "==", userId));
    const querySnapshot = await getDocs(userQuery);

    if (querySnapshot.empty) {
      throw new Error("No user documents found for the given user ID");
    }

    const userDocRef = querySnapshot.docs[0].ref;

    const tripsCollectionRef = collection(userDocRef, "trips");
    const tripSnapshot = await getDocs(tripsCollectionRef);
    const tripsList = tripSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return tripsList;
  } catch (error) {
    console.error("Error fetching trips:", error);
    throw new Error("Failed to fetch trips");
  }
};
export const deleteJourney = async (journeyId) => {
  try {
    const journeyDocRef = doc(db, "journeys", journeyId);

    await deleteDoc(journeyDocRef);
    console.log("Journey deleted successfully!");
  } catch (error) {
    console.error("Error deleting journey document:", error);
    throw new Error("Failed to delete journey");
  }
};

export const fetchAttraction = async (journeyId) => {
  try {
    const attractionDocRef = collection(db, "journeys", journeyId, "journey");
    const querySnapShot = await getDocs(attractionDocRef);

    const attractionsData = querySnapShot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    console.log("data", attractionsData);
    return attractionsData;
  } catch (error) {
    console.log("Error fetching journey", error);
  }
};

export const addAttraction = async (placeDetail, tripDate, tripStartTime) => {
  try {
    console.log("placeDetail", placeDetail);
    const photos = placeDetail.photos
      ? placeDetail.photos.map((photo) => photo.getUrl())
      : [];
    await addDoc(collection(db, "users/NOSTuSs6OBCunlMBm6oF/trips"), {
      name: placeDetail.name,
      address: placeDetail.formatted_address,
      place_id: placeDetail.place_id,
      photos: photos,
      date: dayjs(tripDate).format("YYYY-MM-DD"),
      startTime: dayjs(tripStartTime).format("HH:mm"),
    });
    return true;
  } catch (error) {
    console.error("Error adding place to Firestore:", error);
    return false;
  }
};
