import { ClosestHuisarts, Huisarts } from "@/data/huisartsService";
import { createMatch } from "@/data/matchService";
import { createContext, ReactNode, useContext, useState } from "react";

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
  targetPGs: ClosestHuisarts[];
  currentPG: Huisarts | null;
  contactDetails: ContactDetails;
}

interface RegistrationFormContextType {
  formData: RegistrationFormData;
  updatePostalCode: (postalCode: string) => void;
  updateTargetPGs: (pgs: ClosestHuisarts[]) => void;
  updateCurrentPG: (pg: Huisarts) => void;
  updateContactDetails: (details: ContactDetails) => Promise<void>;
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

  const updateTargetPGs = (pgs: ClosestHuisarts[]) => {
    setFormData((prev) => ({ ...prev, targetPGs: pgs }));
  };

  const updateCurrentPG = (pg: Huisarts) => {
    setFormData((prev) => ({ ...prev, currentPG: pg }));
  };

  const updateContactDetails = async (details: ContactDetails) => {
    setFormData((prev) => ({
      ...prev,
      contactDetails: { ...prev.contactDetails, ...details },
    }));

    const choices = formData.targetPGs.map(targetPG => targetPG.id)

    await createMatch({
      data: {
        name: details.name.trim(),
        currentPracticeId: formData.currentPG!.id,
        choices
      },
    });
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
      "useRegistrationForm must be used within RegistrationFormProvider"
    );
  }
  return context;
}
