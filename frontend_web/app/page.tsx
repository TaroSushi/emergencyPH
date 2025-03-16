'use client';
import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { MapPin, Shield, Hospital, Flame, Scale } from 'lucide-react';
import Link from "next/link";

interface UserLocation {
  city: string;
  country: string;
  region: string;
  brgy: string;
  longitude: number;
  latitude: number;
}

const Index = () => {
  const [location, setLocation] = useState<UserLocation>({
    city: "Fetching...",
    country: "",
    region: "",
    brgy: "",
    longitude: 0,
    latitude: 0,
  });

  const fetchUserLocation = async (latitude: number, longitude: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
      );
      const data = await response.json();
      
      const userLocation: UserLocation = {
        city: data.address.city || data.address.town || "Unknown",
        country: data.address.country || "Unknown",
        region: data.address.region || "Unknown",
        brgy: data.address?.quarter || data.address?.neighbourhood || "Unknown",
        longitude,
        latitude,
      };

      setLocation(userLocation);
      localStorage.setItem('userLocation', JSON.stringify(userLocation));
    } catch (error) {
      console.error("Error fetching location:", error);
    }
  };

  useEffect(() => {
    const updateLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            fetchUserLocation(position.coords.latitude, position.coords.longitude);
          },
          () => {
            const fallbackLocation = {
              city: "Location unavailable",
              country: "",
              region: "",
              brgy: "",
              longitude: 0,
              latitude: 0
            };
            setLocation(fallbackLocation);
            localStorage.setItem('userLocation', JSON.stringify(fallbackLocation));
          }
        );
      }
    };

    // Fetch location immediately when the component mounts
    updateLocation();

    // Set up an interval to update location every 2 minutes
    const interval = setInterval(updateLocation, 120000);

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, []);

  const services = [
    { text: "Police", link: "/contacts/Police", icon: <Shield className="h-10 w-10 text-blue-500" /> },
    { text: "Ambulance", link: "/contacts/Medical", icon: <Hospital className="h-10 w-10 text-red-500" /> },
    { text: "Firetruck", link: "/contacts/Firehouse", icon: <Flame className="h-10 w-10 text-orange-500" /> },
    { text: "Government", link: "/contacts/Politician", icon: <Scale className="h-10 w-10 text-green-500" /> },
  ];

  return (
    /*
    <div className="space-y-8 animate-fade-up">
      <section className="text-center space-y-4">
        <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 whitespace-nowrap">
          Emergency Services
        </h1>
      </section>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto">
        {services.map(service => (
          <Link href={service.link} key={service.link}>
            <Card className="aspect-square hover:shadow-lg cursor-pointer p-3 sm:p-2">
              <div className="flex flex-col justify-center items-center h-full">
                {service.icon}
                <h2 className="text-lg sm:text-base font-semibold">{service.text}</h2>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      <Card className="p-4 bg-gray-50 max-w-3xl mx-auto">
        <div className="flex items-center gap-3">
          <MapPin className="h-5 w-5 text-gray-500" />
          <div>
            <p className="text-sm font-medium">
              {location.brgy}, {location.city}, {location.region}
            </p>
            <p className="text-xs text-gray-600">
              Lat: {location.latitude}, Lng: {location.longitude}
            </p>
          </div>
        </div>
      </Card>
    </div>
    */
    <h2 className="text-lg sm:text-base font-semibold">Under Maintenance</h2>
  );
};

export default Index;
