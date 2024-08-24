import {
  collection,
  query,
  orderBy,
  limit,
  startAfter,
  getDocs,
} from "firebase/firestore";
import { db } from "./firebaseConfig";

export const fetchTrips = async ({ pageParam = null }) => {
  const tripsCollectionRef = collection(db, "users/jV6znb7KQrDC3kOmXlGC/trips");

  let tripsQuery;

  if (pageParam) {
    tripsQuery = query(
      tripsCollectionRef,
      orderBy("time"),
      startAfter(pageParam),
      limit(6)
    );
  } else {
    tripsQuery = query(tripsCollectionRef, orderBy("time"), limit(6));
  }

  const tripDocs = await getDocs(tripsQuery);
  const trips = tripDocs.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  const lastVisible = tripDocs.docs[tripDocs.docs.length - 1];

  return { trips, lastVisible };
};
