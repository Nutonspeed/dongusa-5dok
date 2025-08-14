"use client"

import { useState } from "react"
import { Globe, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { globalExpansionService, type CountryConfig } from "@/lib/global-expansion-service"

interface CountrySelectorProps {
  onCountryChange?: (country: CountryConfig) => void
  className?: string
}

export function CountrySelector({ onCountryChange, className }: CountrySelectorProps) {
  const [currentCountry, setCurrentCountry] = useState(globalExpansionService.getCurrentCountry())
  const countries = globalExpansionService.getAllCountries()

  const handleCountryChange = (country: CountryConfig) => {
    setCurrentCountry(country)
    globalExpansionService.setCurrentCountry(country.code)
    onCountryChange?.(country)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className={className}>
          <Globe className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">
            {currentCountry.name} ({currentCountry.currency.symbol})
          </span>
          <span className="sm:hidden">{currentCountry.code}</span>
          <ChevronDown className="h-4 w-4 ml-2" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {countries.map((country) => (
          <DropdownMenuItem
            key={country.code}
            onClick={() => handleCountryChange(country)}
            className="flex items-center justify-between"
          >
            <div className="flex items-center">
              <span className="text-lg mr-2">
                {country.code === "TH" && "🇹🇭"}
                {country.code === "SG" && "🇸🇬"}
                {country.code === "MY" && "🇲🇾"}
                {country.code === "US" && "🇺🇸"}
                {country.code === "GB" && "🇬🇧"}
                {country.code === "AU" && "🇦🇺"}
              </span>
              <div>
                <div className="font-medium">{country.name}</div>
                <div className="text-sm text-muted-foreground">
                  {country.currency.code} ({country.currency.symbol})
                </div>
              </div>
            </div>
            {currentCountry.code === country.code && <div className="w-2 h-2 bg-primary rounded-full" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
