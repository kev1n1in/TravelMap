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

    const usersList = [];

    for (const doc of querySnapshot.docs) {
      // Fetch the journey subcollection for each document
      const journeyCollectionRef = collection(doc.ref, "journey");
      const journeySnapshot = await getDocs(journeyCollectionRef);

      const journeyData = journeySnapshot.docs.map((journeyDoc) => ({
        id: journeyDoc.id,
        ...journeyDoc.data(),
      }));

      usersList.push({
        id: doc.id,
        ...doc.data(),
        journey: journeyData, // Attach the journey subcollection data
      });
    }

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

export const handleCreateTrip = async (placeDetail, date, startTime) => {
  try {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      throw new Error("User ID not found in localStorage");
    }

    const usersCollectionRef = collection(db, "journeys");
    const userQuery = query(usersCollectionRef, where("user_id", "==", userId));
    const querySnapshot = await getDocs(userQuery);

    if (querySnapshot.empty) {
      throw new Error("No user documents found for the given user ID");
    }

    const userDocRef = querySnapshot.docs[0].ref;

    const photos = placeDetail.photos
      ? placeDetail.photos.map((photo) => photo.getUrl())
      : [];

    const tripsCollectionRef = collection(userDocRef, "journey");

    await addDoc(tripsCollectionRef, {
      name: placeDetail.name,
      address: placeDetail.formatted_address,
      place_id: placeDetail.place_id,
      photos: photos,
      date: date,
      startTime: startTime,
    });

    console.log("New attraction added successfully!");
  } catch (error) {
    console.error("Error adding place to Firestore:", error);
  }
};

export const fetchJourney = async (journeyId) => {
  try {
    const journeyDocRef = doc(db, "journeys", journeyId);
    const journeyCollectionRef = collection(journeyDocRef, "journey");
    const journeySnapshot = await getDocs(journeyCollectionRef);
    const journeyList = journeySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return journeyList;
  } catch (error) {
    console.error("Error fetching journeys:", error);
    throw new Error("Failed to fetch journeys");
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

export const addAttraction = async (
  journeyId,
  placeDetail,
  tripDate,
  tripStartTime
) => {
  try {
    console.log("placeDetail", placeDetail);
    const photos = placeDetail.photos
      ? placeDetail.photos.map((photo) => photo.getUrl())
      : [];
    const journeyCollectionRef = collection(
      db,
      `journeys/${journeyId}/journey`
    );

    await addDoc(journeyCollectionRef, {
      name: placeDetail.name,
      address: placeDetail.formatted_address,
      place_id: placeDetail.place_id,
      photos: photos,
      date: dayjs(tripDate).format("YYYY-MM-DD"),
      startTime: dayjs(tripStartTime).format("HH:mm"),
    });

    console.log("New attraction added successfully!");
    return true;
  } catch (error) {
    console.error("Error adding place to Firestore:", error);
    return false;
  }
};
