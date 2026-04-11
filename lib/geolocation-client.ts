"use client";

export type GeolocationResult = {
  lat: number;
  lng: number;
  city: string;
  provincia: string;
};

function getComponent(
  components: Array<{ long_name: string; short_name: string; types: string[] }>,
  type: string,
) {
  return components.find((component) => component.types.includes(type));
}

export async function detectLocationWithGoogle(): Promise<GeolocationResult> {
  if (typeof window === "undefined" || !("geolocation" in navigator)) {
    throw new Error("Geolocalizzazione non supportata dal browser.");
  }

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    throw new Error("Chiave Google Maps non configurata.");
  }

  const position = await new Promise<GeolocationPosition>((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 12000,
      maximumAge: 0,
    });
  }).catch((error: GeolocationPositionError) => {
    if (error.code === 1) {
      throw new Error("Permesso geolocalizzazione negato. Abilitalo dalle impostazioni del browser.");
    }
    throw new Error("Impossibile rilevare la posizione in questo momento.");
  });

  const lat = position.coords.latitude;
  const lng = position.coords.longitude;
  const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&language=it&key=${apiKey}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Errore nel reverse geocoding.");
  }

  const data = (await response.json()) as {
    status: string;
    results?: Array<{ address_components: Array<{ long_name: string; short_name: string; types: string[] }> }>;
  };

  if (data.status !== "OK" || !data.results?.length) {
    throw new Error("Non sono riuscito a ricavare citta e provincia dalla posizione.");
  }

  const components = data.results[0].address_components;
  const city =
    getComponent(components, "locality")?.long_name ||
    getComponent(components, "administrative_area_level_3")?.long_name ||
    "";
  const provincia =
    getComponent(components, "administrative_area_level_2")?.short_name ||
    getComponent(components, "administrative_area_level_1")?.short_name ||
    "";

  if (!city && !provincia) {
    throw new Error("Posizione rilevata, ma non ho trovato citta/provincia.");
  }

  return {
    lat,
    lng,
    city,
    provincia: provincia.toUpperCase(),
  };
}
