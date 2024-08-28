import {
  GoogleMap,
  MarkerF,
  PolylineF,
  OverlayView,
} from "@react-google-maps/api";
import bluePin from "./img/bluePin.png";
import PropTypes from "prop-types";
const Map = ({
  onUnmount,
  polylinePath,
  places,
  journeyData,
  center,
  onClickMarker,
  sortedJourney,
  onMapLoad,
}) => {
  return (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      center={center}
      zoom={13}
      options={{ styles: mapStyles }}
      onLoad={onMapLoad}
      onUnmount={onUnmount}
    >
      {polylinePath?.length > 0 && (
        <PolylineF
          key={JSON.stringify(polylinePath)}
          path={polylinePath}
          options={{
            strokeColor: "#D22D2D",
            strokeOpacity: 0.7,
            strokeWeight: 5,
          }}
        />
      )}
      {places?.map((place) => {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        const isInJourneys = journeyData?.some(
          (journey) => journey.lat === lat && journey.lng === lng
        );
        return (
          <>
            <MarkerF
              key={place.place_id}
              position={{ lat: lat, lng: lng }}
              onClick={() => onClickMarker(place, isInJourneys)}
              icon={
                isInJourneys
                  ? undefined
                  : {
                      url: bluePin,
                      scaledSize: new window.google.maps.Size(35, 35),
                    }
              }
            />
            <OverlayView
              position={{ lat: lat, lng: lng }}
              mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
              getPixelPositionOffset={(offsetWidth, offsetHeight) => ({
                x: -(offsetWidth / 2) - 30,
                y: -(offsetHeight + 60),
              })}
            >
              <div
                style={{
                  fontSize: "16px",
                  color: "#101213",
                  whiteSpace: "nowrap",
                  fontWeight: "700",
                  textShadow:
                    "1px 1px 3px white, -1px -1px 3px white, -1px 1px 3px white, 1px -1px 3px white",
                }}
              >
                {place.name}
              </div>
            </OverlayView>
          </>
        );
      })}
      {sortedJourney?.map((journey, index) => (
        <MarkerF
          key={journey.id}
          position={{ lat: journey.lat, lng: journey.lng }}
          onClick={() => onClickMarker(journey, true)}
          label={{
            text: (index + 1).toString(),
            color: "white",
            fontSize: "20px",
            fontWeight: "bold",
            labelOrigin: new window.google.maps.Point(20, -30),
          }}
        />
      ))}
    </GoogleMap>
  );
};

export default Map;

Map.propTypes = {
  onUnmount: PropTypes.func,
  polylinePath: PropTypes.arrayOf(
    PropTypes.shape({
      lat: PropTypes.number,
      lng: PropTypes.number,
    })
  ),
  places: PropTypes.arrayOf(
    PropTypes.shape({
      place_id: PropTypes.string,
      geometry: PropTypes.shape({
        location: PropTypes.shape({
          lat: PropTypes.func,
          lng: PropTypes.func,
        }),
      }),
      name: PropTypes.string,
    })
  ),
  journeyData: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      lat: PropTypes.number,
      lng: PropTypes.number,
      date: PropTypes.string,
      startTime: PropTypes.string,
    })
  ),
  center: PropTypes.shape({
    lat: PropTypes.number.isRequired,
    lng: PropTypes.number.isRequired,
  }),
  onClickMarker: PropTypes.func,
  sortedJourney: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      lat: PropTypes.number,
      lng: PropTypes.number,
      date: PropTypes.string,
      startTime: PropTypes.string,
    })
  ),
  onMapLoad: PropTypes.func,
};

const mapContainerStyle = {
  width: "100%",
  height: "100%",
};

const mapStyles = [
  {
    featureType: "administrative.land_parcel",
    elementType: "labels",
    stylers: [
      {
        visibility: "off",
      },
    ],
  },
  {
    featureType: "poi",
    elementType: "labels.text",
    stylers: [
      {
        visibility: "off",
      },
    ],
  },
  {
    featureType: "poi.business",
    stylers: [
      {
        visibility: "off",
      },
    ],
  },
  {
    featureType: "poi.park",
    elementType: "labels.text",
    stylers: [
      {
        visibility: "off",
      },
    ],
  },
  {
    featureType: "road.arterial",
    elementType: "labels",
    stylers: [
      {
        visibility: "off",
      },
    ],
  },
  {
    featureType: "road.highway",
    elementType: "labels",
    stylers: [
      {
        visibility: "off",
      },
    ],
  },
  {
    featureType: "road.local",
    stylers: [
      {
        visibility: "off",
      },
    ],
  },
  {
    featureType: "road.local",
    elementType: "labels",
    stylers: [
      {
        visibility: "off",
      },
    ],
  },
];
