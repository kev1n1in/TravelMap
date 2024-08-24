import { collection, addDoc } from "firebase/firestore";
import { db } from "./firebaseConfig";

export const handleCreateTrip = async (placeDetail) => {
  try {
    console.log("placeDetail", placeDetail);
    const photos = placeDetail.photos
      ? placeDetail.photos.map((photo) => photo.getUrl())
      : [];
    await addDoc(collection(db, "users/jV6znb7KQrDC3kOmXlGC/trips"), {
      name: placeDetail.name,
      address: placeDetail.formatted_address,
      place_id: placeDetail.place_id,
      photos: photos,
    });

    console.log("add new attraction successfully!");
  } catch (error) {
    console.error("Error adding place to Firestore:", error);
  }
};
