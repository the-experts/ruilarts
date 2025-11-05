import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useRegistrationForm } from '@/context/registration-form'
import { normalizePostalCode, isValidPostalCode } from '@/lib/form-utils'
import { getNearbyPGs } from '@/data/huisartsen'

export const Route = createFileRoute('/registreren/stap-1')({
  component: Stap1,
})

function Stap1() {
  const navigate = useNavigate()
  const { formData, updatePostalCode, updateTargetPGs } = useRegistrationForm()
  const [input, setInput] = useState(formData.postalCode || '')
  const [houseNumber, setHouseNumber] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInput(value)
    setError('')
  }

    const handleChangeHouseNumber = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setHouseNumber(value)
    setError('')
  }

  const handleNext = async () => {
    const normalized = normalizePostalCode(input)

    // Validate
    if (!normalized) {
      setError('Voer alstublieft uw postcode in')
      return
    }

    if (!isValidPostalCode(normalized)) {
      setError('Voer alstublieft een geldige Nederlandse postcode in (bijv. 1012 AB)')
      return
    }

    if (!houseNumber) {
      setError('Voer alstublieft een geldig huisnummer in')
      return
    }

    // Update form state
    updatePostalCode(normalized)

    setIsLoading(true)
    try {
      await getNearbyPGs({data: {postalCode: normalized, houseNumber}})
      updateTargetPGs([])
      navigate({
         to: "/registreren/$postcode/$houseNumber/stap-2",
        params: { postcode: normalized, houseNumber },
      })
    } catch {
      setError('Er is een fout opgetreden. Probeer het opnieuw.')
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleNext()
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-white">
        <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">Postcode</h1>
            <p className="mt-1 text-sm text-gray-500">Stap 1 van 5</p>
          </div>

          {/* Progress bar */}
          <div className="mt-6 h-1 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full bg-blue-600 transition-all duration-300"
              style={{ width: '20%' }}
            />
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* Help text */}
          <div className="rounded-lg bg-blue-50 p-4">
            <p className="text-sm text-gray-700">
              Voer de postcode in van uw huidig adres. Dit helpt ons om huisartsenpraktijken in uw buurt te vinden.
            </p>
          </div>

          {/* Input form */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="postcode" className="text-base font-semibold">
                Postcode
              </Label>
              <Input
                id="postcode"
                type="text"
                placeholder="bijv. 1012 AB"
                value={input}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
                maxLength={7}
                autoFocus
                className="text-lg"
              />
              <p className="text-xs text-gray-500">
                Spaties en grootte van letters maakt niet uit (bijv. 1012ab, 1012 ab, 1012 AB)
              </p>
            </div>

             <div className="space-y-2">
              <Label htmlFor="postcode" className="text-base font-semibold">
                Huis nummer
              </Label>
              <Input
                id="houseNumber"
                type="text"
                placeholder="bijv. 1"
                value={houseNumber}
                onChange={handleChangeHouseNumber}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
                maxLength={7}
                autoFocus
                className="text-lg"
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>

          {/* Next button */}
          <div className="pt-4">
            <Button
              onClick={handleNext}
              disabled={isLoading || !input.trim()}
              className="w-full"
              size="lg"
            >
              {isLoading ? 'Bezig met laden...' : 'Volgende'}
            </Button>
          </div>

          {/* Info about data */}
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <p className="text-xs text-gray-600">
              ℹ️ We gebruiken uw postcode alleen om huisartsenpraktijken in de buurt te vinden.
              Uw gegevens worden niet opgeslagen zonder uw toestemming.
            </p>
          </div>
        </div>
      </div>

      {/* Footer with step indicators */}
      <div className="border-t bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <div className="flex justify-between">
            {[1, 2, 3, 4, 5].map((step) => (
              <div
                key={step}
                className={`flex flex-col items-center gap-2 ${
                  step <= 1 ? 'text-blue-600' : 'text-gray-400'
                }`}
              >
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                    step <= 1
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-300 text-gray-500'
                  }`}
                >
                  {step}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
