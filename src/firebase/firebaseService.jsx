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
  updateDoc,
  limit as firestoreLimit,
} from "firebase/firestore";
import { db } from "./firebaseConfig";
import dayjs from "dayjs";
import { GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import { auth } from "./firebaseConfig";
import { getAuth } from "firebase/auth";

export const handleCreateJourney = async (title, description) => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      throw new Error("User not authenticated");
    }

    const userId = user.uid;

    if (!title || !description) {
      throw new Error("Title and Description cannot be empty");
    }

    const journeysCollectionRef = collection(db, "journeys");
    const newDocRef = doc(journeysCollectionRef);

    await setDoc(newDocRef, {
      uid: userId,
      title: title,
      description: description,
      createdAt: new Date().toISOString(),
    });

    console.log("New journey document created with ID:", newDocRef.id);
    alert("新行程已成功創建！");
  } catch (error) {
    console.error("Error creating journey document:", error);
    alert("出了一點問題：" + error.message);
  }
};

export async function fetchUserJourneys(
  userId,
  { pageParam = null, limit = 6 }
) {
  try {
    const journeyRef = collection(db, "journeys");
    let q = query(
      journeyRef,
      where("uid", "==", userId),
      orderBy("createdAt"),
      firestoreLimit(limit)
    );

    if (pageParam) {
      q = query(
        journeyRef,
        where("uid", "==", userId),
        orderBy("createdAt"),
        startAfter(pageParam),
        firestoreLimit(limit)
      );
    }

    const snapshot = await getDocs(q);
    const journeys = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: dayjs(doc.data().createdAt).format("YYYY-MM-DD"),
    }));

    const lastVisible = snapshot.docs[snapshot.docs.length - 1];

    return {
      journeys,
      lastVisible,
    };
  } catch (error) {
    console.error("Error fetching user journeys:", error.message);
    throw error;
  }
}

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
      lat: placeDetail.geometry.location.lat(),
      lng: placeDetail.geometry.location.lng(),
    });

    console.log("New attraction added successfully!");
    return true;
  } catch (error) {
    console.error("Error adding place to Firestore:", error);
    return false;
  }
};

export const signInWithGoogle = async (googleToken) => {
  const credential = GoogleAuthProvider.credential(googleToken);
  return signInWithCredential(auth, credential);
};

export const updateUserProfile = async (user) => {
  const userRef = doc(db, "users", user.uid);
  return setDoc(
    userRef,
    {
      uid: user.uid,
      userName: user.displayName,
      email: user.email,
      photoURL: user.photoURL,
      lastLogin: new Date(),
    },
    { merge: true }
  );
};

export const deleteAttraction = async (journeyId, placeId) => {
  try {
    const journeyCollectionRef = collection(
      db,
      "journeys",
      journeyId,
      "journey"
    );
    const q = query(journeyCollectionRef, where("place_id", "==", placeId));
    const querySnapshot = await getDocs(q);

    for (const docSnapshot of querySnapshot.docs) {
      const docRef = doc(db, "journeys", journeyId, "journey", docSnapshot.id);
      await deleteDoc(docRef);
      return true;
    }
  } catch (error) {
    console.error("Error deleting documents:", error.message);
    return false;
  }
};

export const updateAttraction = async (
  journeyId,
  placeId,
  newDate,
  newStartTime
) => {
  console.log(journeyId, placeId, newDate, newStartTime);
  try {
    const journeyCollectionRef = collection(
      db,
      "journeys",
      journeyId,
      "journey"
    );
    const q = query(journeyCollectionRef, where("place_id", "==", placeId));
    const querySnapshot = await getDocs(q);
    for (const docSnapshot of querySnapshot.docs) {
      const docRef = doc(db, "journeys", journeyId, "journey", docSnapshot.id);
      await updateDoc(docRef, {
        date: dayjs(newDate).format("YYYY-MM-DD"),
        startTime: dayjs(newStartTime).format("HH:mm"),
      });
      return true;
    }
  } catch (error) {
    console.error("Error deleting documents:", error.message);
    return false;
  }
};
