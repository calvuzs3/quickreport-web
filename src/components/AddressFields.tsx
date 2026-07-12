"use client";

import { useState } from "react";
import type { Address } from "@/types";
import { googleMapsUrl } from "@/lib/address";

interface GeocodeResult {
  street: string | null;
  streetNumber: string | null;
  postalCode: string | null;
  city: string | null;
  province: string | null;
  country: string;
  latitude: number;
  longitude: number;
}

export default function AddressFields({
  value,
  onChange,
}: {
  value: Address;
  onChange: (address: Address) => void;
}) {
  const [locating, setLocating] = useState(false);
  const [lookingUp, setLookingUp] = useState(false);
  const [pasteInput, setPasteInput] = useState("");
  const [addressError, setAddressError] = useState<string | null>(null);

  function set(field: keyof Address, fieldValue: string) {
    onChange({ ...value, [field]: fieldValue });
  }

  function applyResult(result: GeocodeResult) {
    onChange({
      ...value,
      street: result.street ?? value.street,
      streetNumber: result.streetNumber ?? value.streetNumber,
      postalCode: result.postalCode ?? value.postalCode,
      city: result.city ?? value.city,
      province: result.province ?? value.province,
      country: result.country ?? value.country,
      coordinates: { latitude: result.latitude, longitude: result.longitude },
    });
  }

  function useCurrentLocation() {
    if (!navigator.geolocation) {
      setAddressError("Geolocalizzazione non supportata da questo browser");
      return;
    }
    setLocating(true);
    setAddressError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        try {
          const res = await fetch(`/api/geocode/reverse?lat=${latitude}&lon=${longitude}`);
          const data = await res.json();
          if (!res.ok) throw new Error(data.error ?? "Errore geocoding");
          applyResult(data);
        } catch (e) {
          setAddressError(e instanceof Error ? e.message : "Impossibile determinare l'indirizzo");
          onChange({ ...value, coordinates: { latitude, longitude, accuracy } });
        } finally {
          setLocating(false);
        }
      },
      (err) => {
        setLocating(false);
        setAddressError(
          err.code === err.PERMISSION_DENIED
            ? "Permesso di geolocalizzazione negato"
            : "Impossibile determinare la posizione"
        );
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  async function lookupPastedInput() {
    if (!pasteInput.trim()) return;
    setLookingUp(true);
    setAddressError(null);
    try {
      const res = await fetch(`/api/geocode/lookup?q=${encodeURIComponent(pasteInput.trim())}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Errore geocoding");
      applyResult(data);
      setPasteInput("");
    } catch (e) {
      setAddressError(e instanceof Error ? e.message : "Impossibile riconoscere l'indirizzo");
    } finally {
      setLookingUp(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <button type="button" className="btn btn-secondary btn-sm" onClick={useCurrentLocation} disabled={locating}>
          {locating ? "Localizzazione…" : "📍 Usa posizione attuale"}
        </button>
        {value.coordinates && (
          <a href={googleMapsUrl(value.coordinates)} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm">
            🔗 Apri in Google Maps
          </a>
        )}
      </div>

      <div className="form-group">
        <label className="form-label">Incolla indirizzo o link Google Maps</label>
        <div style={{ display: "flex", gap: 8 }}>
          <input className="form-input" type="text" value={pasteInput}
            onChange={e => setPasteInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); lookupPastedInput(); } }}
            placeholder="es. Via Roma 12, Milano oppure https://maps.app.goo.gl/..." />
          <button type="button" className="btn btn-secondary btn-sm" onClick={lookupPastedInput} disabled={lookingUp || !pasteInput.trim()}>
            {lookingUp ? "Ricerca…" : "Cerca"}
          </button>
        </div>
      </div>

      {addressError && <div className="alert alert-error">{addressError}</div>}

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Via</label>
          <input className="form-input" type="text" value={value.street ?? ""}
            onChange={e => set("street", e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">N. civico</label>
          <input className="form-input" type="text" value={value.streetNumber ?? ""}
            onChange={e => set("streetNumber", e.target.value)} />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">CAP</label>
          <input className="form-input" type="text" value={value.postalCode ?? ""}
            onChange={e => set("postalCode", e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Città</label>
          <input className="form-input" type="text" value={value.city ?? ""}
            onChange={e => set("city", e.target.value)} />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Provincia</label>
          <input className="form-input" type="text" value={value.province ?? ""}
            onChange={e => set("province", e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Paese</label>
          <input className="form-input" type="text" value={value.country ?? "Italia"}
            onChange={e => set("country", e.target.value)} />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Note indirizzo</label>
        <textarea className="form-textarea" value={value.notes ?? ""}
          onChange={e => set("notes", e.target.value)} placeholder="Indicazioni per raggiungere la sede..." />
      </div>
    </div>
  );
}
