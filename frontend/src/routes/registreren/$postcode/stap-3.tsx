import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useRegistrationForm } from "@/context/registration-form";
import { Huisarts } from "@/data/huisartsService";
import { searchPGs } from "@/data/mocks/huisartsen";
import { List, RowComponentProps } from "react-window";
import {
  createFileRoute,
  useNavigate,
  useParams,
} from "@tanstack/react-router";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/registreren/$postcode/stap-3")({
  loader: ({ params }) => {
    // Validate postcode param exists
    if (!params.postcode) {
      throw new Error("Postcode vereist");
    }
    return params.postcode;
  },
  component: Stap3,
});

function Stap3() {
  const navigate = useNavigate();
  const { postcode } = useParams({ from: "/registreren/$postcode/stap-3" });
  const { formData, updateCurrentPG, updatePostalCode } = useRegistrationForm();
  const loaderPostcode = Route.useLoaderData();

  const [searchQuery, setSearchQuery] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [postalCodeFilter, setPostalCodeFilter] = useState("");
  const [selectedPGId, setSelectedPGId] = useState(formData.currentPG?.id);
  const [error, setError] = useState("");

  const [filteredPGs, setFilteredPGs] = useState<Huisarts[]>([]);

  useEffect(() => {
    const fetchPGs = async () => {
      const results = await searchPGs({
        data: {
          city: cityFilter,
          name: searchQuery,
          postalCode: postalCodeFilter,
        },
      });
      setFilteredPGs(results);
    };

    fetchPGs();
  }, [searchQuery, cityFilter, postalCodeFilter]);

  // Update form context with postcode if not already set
  if (!formData.postalCode && loaderPostcode) {
    updatePostalCode(loaderPostcode);
  }

  const handleNext = () => {
    if (!selectedPGId) {
      setError("Selecteer alstublieft uw huidige huisartsenpraktijk");
      return;
    }

    const selected = filteredPGs.find((pg) => pg.id === selectedPGId);
    if (!selected) {
      setError("Huisartsenpraktijk niet gevonden");
      return;
    }

    updateCurrentPG(selected);
    navigate({ to: `/registreren/${postcode}/stap-4` });
  };

  const handleSelectPG = (pgId: string) => {
    setSelectedPGId(parseInt(pgId));
    setError("");
  };

  return (
    <div className="space-y-6">
      {/* Help text */}
      <div className="rounded-lg bg-blue-50 p-4">
        <p className="text-sm text-gray-700">
          Zoek en selecteer uw huidige huisartsenpraktijk. U kunt zoeken op naam,
          adres, postcode en plaats.
        </p>
      </div>

      {/* Search and filters */}
      <div className="space-y-4">
        {/* Search input */}
        <div className="space-y-2">
          <Label htmlFor="search" className="text-sm font-semibold">
            Zoeken op naam of adres
          </Label>
          <Input
            id="search"
            type="text"
            placeholder="bijv. Huisartsenpraktijk Centrum"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="text-base"
          />
        </div>

        {/* City and postal code filters */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="city" className="text-sm font-semibold">
              Plaats
            </Label>
            <Input
              id="city"
              type="text"
              placeholder="bijv. Amsterdam"
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="text-base"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="postalcode" className="text-sm font-semibold">
              Postcode
            </Label>
            <Input
              id="postalcode"
              type="text"
              placeholder="bijv. 1012"
              value={postalCodeFilter}
              onChange={(e) => setPostalCodeFilter(e.target.value)}
              className="text-base"
            />
          </div>
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {/* Results */}
      <div>
        <p className="mb-3 text-sm text-gray-600">
          {filteredPGs.length} resultaat{filteredPGs.length !== 1 ? "en" : ""}
        </p>

        <RadioGroup
          value={selectedPGId?.toString()}
          onValueChange={handleSelectPG}
        >
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredPGs.length > 0 ? (
              <List
                rowComponent={RowComponent}
                rowCount={filteredPGs.length}
                rowHeight={80}
                rowProps={{ filteredPGs, selectedPGId, handleSelectPG }}
              />
            ) : (
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 text-center">
                <p className="text-sm text-gray-600">
                  Geen huisartsenpraktijken gevonden met uw zoekcriteria.
                </p>
              </div>
            )}
          </div>
        </RadioGroup>
      </div>

      {/* Next button */}
      <div className="pt-4">
        <Button
          onClick={handleNext}
          disabled={!selectedPGId || filteredPGs.length === 0}
          className="w-full"
          size="lg"
        >
          Volgende
        </Button>
      </div>
    </div>
  );
}

function RowComponent({
  index,
  filteredPGs,
  handleSelectPG,
  selectedPGId,
  style,
}: RowComponentProps<{
  filteredPGs: Huisarts[];
  selectedPGId?: number;
  handleSelectPG: (id: string) => void;
}>) {
  const pg = filteredPGs[index];

  return (
    <div
      key={pg.id}
      className={`rounded-lg border-2 p-3 transition-all cursor-pointer ${
        selectedPGId === pg.id
          ? "border-blue-500 bg-blue-50"
          : "border-gray-200 bg-white hover:border-gray-300"
      }`}
   style={{ ...style, marginTop: "8px", height: 72 }}
      onClick={() => handleSelectPG(pg.id.toString())}
    >
      <div className="flex items-start gap-3">
        <RadioGroupItem value={pg.id.toString()} className="mt-1" />
        <div className="flex-1">
          <h3 className="font-medium text-gray-900">{pg.naam}</h3>
          <p className="text-sm text-gray-600">
            {pg.adres}
          </p>
        </div>
      </div>
    </div>
  );
}
