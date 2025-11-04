import { createContext, ReactNode, useContext, useState } from "react";

export interface PG {
  id: string;
  name: string;
  address: string;
  postalCode: string;
  city: string;
  lat: number;
  lng: number;
  distance?: number;
}

export interface ContactDetails {
  name: string;
  postalCode: string;
  houseNumber: string;
  street?: string;
  city?: string;
  email: string;
}

export interface RegistrationFormData {
  postalCode: string;
  targetPGs: PG[];
  currentPG: PG | null;
  contactDetails: ContactDetails;
}

interface RegistrationFormContextType {
  formData: RegistrationFormData;
  updatePostalCode: (postalCode: string) => void;
  updateTargetPGs: (pgs: PG[]) => void;
  updateCurrentPG: (pg: PG) => void;
  updateContactDetails: (details: Partial<ContactDetails>) => void;
  reset: () => void;
}

const initialFormData: RegistrationFormData = {
  postalCode: "",
  targetPGs: [],
  currentPG: null,
  contactDetails: {
    name: "",
    postalCode: "",
    houseNumber: "",
    street: "",
    city: "",
    email: "",
  },
};

const RegistrationFormContext = createContext<
  RegistrationFormContextType | undefined
>(undefined);

export function RegistrationFormProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [formData, setFormData] =
    useState<RegistrationFormData>(initialFormData);

  const updatePostalCode = (postalCode: string) => {
    setFormData((prev) => ({ ...prev, postalCode }));
  };

  const updateTargetPGs = (pgs: PG[]) => {
    setFormData((prev) => ({ ...prev, targetPGs: pgs }));
  };

  const updateCurrentPG = (pg: PG) => {
    setFormData((prev) => ({ ...prev, currentPG: pg }));
  };

  const updateContactDetails = (details: Partial<ContactDetails>) => {
    setFormData((prev) => ({
      ...prev,
      contactDetails: { ...prev.contactDetails, ...details },
    }));
  };

  const reset = () => {
    setFormData(initialFormData);
  };

  return (
    <RegistrationFormContext.Provider
      value={{
        formData,
        updatePostalCode,
        updateTargetPGs,
        updateCurrentPG,
        updateContactDetails,
        reset,
      }}
    >
      {children}
    </RegistrationFormContext.Provider>
  );
}

export function useRegistrationForm() {
  const context = useContext(RegistrationFormContext);
  if (!context) {
    throw new Error(
      "useRegistrationForm must be used within RegistrationFormProvider",
    );
  }
  return context;
}
