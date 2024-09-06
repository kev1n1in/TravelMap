import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  deleteDoc,
  addDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebaseConfig";
import dayjs from "dayjs";
import { GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import { getAuth } from "firebase/auth";

export const createNewJourney = async (title, description) => {
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
      updatedAt: serverTimestamp(),
    });
    return newDocRef.id;
  } catch (error) {
    console.error("Error creating journey document:", error);
  }
};

export const saveJourneyInfo = async (documentId, title, description) => {
  const journeyRef = doc(db, "journeys", documentId);
  await updateDoc(journeyRef, {
    title,
    description,
    updatedAt: serverTimestamp(),
  });
};

export async function fetchAndSortUserJourneys(userId) {
  try {
    const journeyRef = collection(db, "journeys");
    const q = query(journeyRef, where("uid", "==", userId));
    const snapshot = await getDocs(q);
    const journeys = await Promise.all(
      snapshot.docs.map(async (doc) => {
        const journeyData = doc.data();
        const journeySubcollectionRef = collection(doc.ref, "journey");
        const journeySubcollectionSnapshot = await getDocs(
          journeySubcollectionRef
        );
        const journeySubcollectionData = journeySubcollectionSnapshot.docs.map(
          (subDoc) => subDoc.data()
        );

        const sortedTimes = journeySubcollectionData
          .map((item) => ({
            date: item.date,
            startTime: item.startTime,
          }))
          .filter((item) => item.date && item.startTime)
          .sort((a, b) => {
            const dateCompare = a.date.localeCompare(b.date);
            return dateCompare !== 0
              ? dateCompare
              : a.startTime.localeCompare(b.startTime);
          });

        return {
          id: doc.id,
          ...journeyData,
          journey: journeySubcollectionData,
          start:
            sortedTimes.length > 0
              ? `${sortedTimes[0].date} ${sortedTimes[0].startTime}`
              : null,
          end:
            sortedTimes.length > 0
              ? `${sortedTimes[sortedTimes.length - 1].date} ${
                  sortedTimes[sortedTimes.length - 1].startTime
                }`
              : null,
          createdAt: dayjs(journeyData.createdAt).format("YYYY-MM-DD"),
          updatedAt: journeyData.updatedAt,
        };
      })
    );

    const sortedJourneys = journeys.sort((a, b) => {
      const hasJourneyA = a.journey && a.journey.length > 0;
      const hasJourneyB = b.journey && b.journey.length > 0;

      if (hasJourneyA && !hasJourneyB) {
        return -1;
      }
      if (!hasJourneyA && hasJourneyB) {
        return 1;
      }

      if (hasJourneyA && hasJourneyB) {
        const startDateA = a.start ? a.start.split(" ")[0] : "";
        const startDateB = b.start ? b.start.split(" ")[0] : "";
        return startDateB.localeCompare(startDateA);
      }

      const updatedAtA = a.updatedAt
        ? new Date(a.updatedAt.seconds * 1000)
        : new Date(0);
      const updatedAtB = b.updatedAt
        ? new Date(b.updatedAt.seconds * 1000)
        : new Date(0);
      return updatedAtB - updatedAtA;
    });

    return sortedJourneys;
  } catch (error) {
    console.error("Error fetching and sorting user journeys:", error.message);
    throw error;
  }
}

export const fetchAttractions = async (journeyId) => {
  try {
    if (!journeyId) {
      return null;
    }
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
    const journeyRef = doc(db, "journeys", journeyId);
    await updateDoc(journeyRef, {
      updatedAt: serverTimestamp(),
    });

    await deleteDoc(journeyRef);
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
      date: tripDate,
      startTime: tripStartTime,
      lat: placeDetail.geometry.location.lat(),
      lng: placeDetail.geometry.location.lng(),
    });

    const journeyRef = doc(db, "journeys", journeyId);
    await updateDoc(journeyRef, {
      updatedAt: serverTimestamp(),
    });

    return true;
  } catch (error) {
    console.error("Error adding place to Firestore:", error);
    return false;
  }
};

export const signInWithGoogle = async (accessToken) => {
  const auth = getAuth();
  const googleCredential = GoogleAuthProvider.credential(null, accessToken);
  return await signInWithCredential(auth, googleCredential);
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

      const journeyRef = doc(db, "journeys", journeyId);
      await updateDoc(journeyRef, {
        updatedAt: serverTimestamp(),
      });

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
      const journeyRef = doc(db, "journeys", journeyId);
      await updateDoc(journeyRef, {
        updatedAt: serverTimestamp(),
      });

      return true;
    }
  } catch (error) {
    console.error("Error updating attraction document:", error.message);
    return false;
  }
};

export const fetchJourneyInfo = async (journeyId) => {
  try {
    const journeyDocRef = doc(db, "journeys", journeyId);
    const journeyDoc = await getDoc(journeyDocRef);

    if (journeyDoc.exists()) {
      return journeyDoc.data();
    } else {
      throw new Error("Journey not found");
    }
  } catch (error) {
    console.error("Error fetching journey:", error);
    throw error;
  }
};

export const getUserProfile = async () => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      throw new Error("User not authenticated");
    }

    const userRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      return userDoc.data();
    } else {
      throw new Error("User profile not found");
    }
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw error;
  }
};
