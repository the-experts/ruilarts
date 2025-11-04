import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRegistrationForm } from "@/context/registration-form";

import { lookupPDOKAddress } from "@/data/pdok.server";
import {
  isValidEmail,
  isValidName,
  isValidPostalCode,
  normalizePostalCode,
} from "@/lib/form-utils";
import {
  createFileRoute,
  useNavigate,
  useParams,
} from "@tanstack/react-router";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/registreren/$postcode/stap-4")({
  component: Stap4,
});

function Stap4() {
  const navigate = useNavigate();
  const { postcode } = useParams({ from: "/registreren/$postcode/stap-4" });
  const { formData, updateContactDetails } = useRegistrationForm();

  const [name, setName] = useState(formData.contactDetails.name || "");
  const [postalCode, setPostalCode] = useState(
    formData.contactDetails.postalCode || postcode || ""
  );
  const [houseNumber, setHouseNumber] = useState(
    formData.contactDetails.houseNumber || ""
  );
  const [street, setStreet] = useState(formData.contactDetails.street || "");
  const [city, setCity] = useState(formData.contactDetails.city || "");
  const [email, setEmail] = useState(formData.contactDetails.email || "");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isLookingUpAddress, setIsLookingUpAddress] = useState(false);

  // Auto-lookup address when postal code and house number are filled
  useEffect(() => {
    if (!postalCode.trim() || !houseNumber.trim()) {
      return;
    }

    const normalized = normalizePostalCode(postalCode);
    if (!isValidPostalCode(normalized)) {
      return;
    }

    const lookupAddress = async () => {
      setIsLookingUpAddress(true);
      try {
        const result = await lookupPDOKAddress({
          data: {
            postalCode: normalized,
            houseNumber: houseNumber.trim(),
          },
        });

        if (result) {
          setStreet(result.street);
          setCity(result.city);
        }
      } catch (error) {
        console.error("Address lookup error:", error);
      } finally {
        setIsLookingUpAddress(false);
      }
    };

    const timer = setTimeout(lookupAddress, 500); // Debounce
    return () => clearTimeout(timer);
  }, [postalCode, houseNumber]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!isValidName(name)) {
      newErrors.name = "Voer alstublieft uw naam in";
    }

    const normalized = normalizePostalCode(postalCode);
    if (!normalized || !isValidPostalCode(normalized)) {
      newErrors.postalCode = "Voer alstublieft een geldige postcode in";
    }

    if (!houseNumber.trim()) {
      newErrors.houseNumber = "Voer alstublieft uw huisnummer in";
    }

    if (!isValidEmail(email)) {
      newErrors.email = "Voer alstublieft een geldig e-mailadres in";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      await updateContactDetails({
        name: name.trim(),
        postalCode: normalizePostalCode(postalCode),
        houseNumber: houseNumber.trim(),
        street,
        city,
        email: email.trim(),
      });

      navigate({ to: "/registreren/voltooid" });
    } catch (error) {
      console.error("Error:", error);
      setErrors({ form: "Er is een fout opgetreden. Probeer het opnieuw." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Help text */}
      <div className="rounded-lg bg-blue-50 p-4">
        <p className="text-sm text-gray-700">
          Voer uw contactgegevens in. We gebruiken dit om u op de hoogte te
          stellen wanneer we een geschikte huisarts voor u hebben gevonden.
        </p>
      </div>

      {/* Form */}
      <div className="space-y-4">
        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm font-semibold">
            Naam
          </Label>
          <Input
            id="name"
            type="text"
            placeholder="Uw volledige naam"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isLoading}
          />
          {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
        </div>

        {/* Postal Code and House Number */}
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2 space-y-2">
            <Label htmlFor="postalcode" className="text-sm font-semibold">
              Postcode
            </Label>
            <Input
              id="postalcode"
              type="text"
              placeholder="bijv. 1012 AB"
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              maxLength={7}
              disabled={isLoading}
            />
            {errors.postalCode && (
              <p className="text-sm text-red-600">{errors.postalCode}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="housenumber" className="text-sm font-semibold">
              Huisnummer
            </Label>
            <Input
              id="housenumber"
              type="text"
              placeholder="bijv. 50"
              value={houseNumber}
              onChange={(e) => setHouseNumber(e.target.value)}
              disabled={isLoading || isLookingUpAddress}
            />
            {errors.houseNumber && (
              <p className="text-sm text-red-600">{errors.houseNumber}</p>
            )}
          </div>
        </div>

        {isLookingUpAddress && (
          <p className="text-xs text-blue-600">Bezig met adres opzoeken...</p>
        )}

        {/* Auto-filled Street and City */}
        {street && (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="street" className="text-sm font-semibold">
                Straat
              </Label>
              <Input
                id="street"
                type="text"
                value={street}
                disabled
                className="bg-gray-100"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city" className="text-sm font-semibold">
                Plaats
              </Label>
              <Input
                id="city"
                type="text"
                value={city}
                disabled
                className="bg-gray-100"
              />
            </div>
          </div>
        )}

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-semibold">
            E-mailadres
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="u@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
          />
          {errors.email && (
            <p className="text-sm text-red-600">{errors.email}</p>
          )}
        </div>
      </div>

      {/* Summary of selected PGs */}
      <div className="rounded-lg border-2 border-blue-200 bg-blue-50 p-4">
        <h3 className="mb-3 font-semibold text-gray-900">
          Geselecteerde huisartsenpraktijken
        </h3>

        <div className="space-y-2">
          <div className="text-sm">
            <p className="font-semibold text-gray-700">Huidig:</p>
            {formData.currentPG ? (
              <p className="text-gray-600">
                {formData.currentPG.naam} ({formData.currentPG.adres})
              </p>
            ) : (
              <p className="text-gray-500">Niet geselecteerd</p>
            )}
          </div>

          <div className="text-sm">
            <p className="font-semibold text-gray-700">
              Gewenste ({formData.targetPGs.length}):
            </p>
            {formData.targetPGs.length > 0 ? (
              <ul className="list-inside list-disc text-gray-600">
                {formData.targetPGs.map((pg) => (
                  <li key={pg.id}>
                    {pg.naam} ({pg.adres})
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">Geen geselecteerd</p>
            )}
          </div>
        </div>
      </div>

      {errors.form && <p className="text-sm text-red-600">{errors.form}</p>}

      {/* Submit button */}
      <div className="pt-4">
        <Button
          onClick={handleNext}
          disabled={isLoading || isLookingUpAddress}
          className="w-full"
          size="lg"
        >
          {isLoading ? "Bezig met verzenden..." : "Volgende"}
        </Button>
      </div>
    </div>
  );
}
