'use client';
import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { MapPin, Phone, Plus, Search } from 'lucide-react';
import Link from "next/link";

const Index = () => {
  const [location, setLocation] = useState({
    city: "Fetching...",
    country: "",
    region: "",
    longitude: 0,
    latitude: 0,
  });

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            );
            const data = await response.json();
            console.log(data)
            setLocation({
              city: data.address.city || data.address.town || "Unknown",
              country: data.address.country || "Unknown",
              region: data.address.region || "Unknown",
              longitude,
              latitude,
            });
          } catch (error) {
            console.error("Error fetching location:", error);
          }
        },
        () => {
          setLocation({ city: "Location unavailable", country: "", region: "", longitude: 0, latitude: 0 });
        }
      );
    }
  }, []);

  const services = [
    { text: "Police", link: "/contacts/Police" },
    { text: "Ambulance", link: "/contacts/Medical" },
    { text: "Firetruck", link: "/contacts/Firehouse" },
    { text: "Politicians", link: "/contacts/Politician" },
  ];

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Header Section */}
      <section className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">Emergency Services</h1>
        <p className="text-gray-600 max-w-2xl mx-auto px-4 sm:px-0">
          Quick access to your emergency contacts and services. Stay prepared and connected.
        </p>
      </section>

      {/* Emergency Services Grid */}
      <div className="flex justify-center w-full px-4">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 w-full max-w-4xl">
          {services.map((service) => (
            <Link href={service.link} key={service.link}>
              <Card className="aspect-square hover:shadow-lg transition-shadow cursor-pointer">
                <div className="flex justify-center items-center flex-col h-full space-x-4">
                  <div className="p-3 bg-emergency/10 rounded-full">
                    <Phone className="h-10 w-10 text-blue-500 text-emergency" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">{service.text}</h2>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Current Location Card */}
      <div className="px-4">
        <Card className="p-4 bg-gray-50">
          <div className="flex items-center gap-3">
            <MapPin className="h-5 w-5 text-gray-500" />
            <div>
              <p className="text-sm font-medium">Current Location</p>
              <p className="text-xs text-gray-600">{location.country}</p>
              <p className="text-xs text-gray-600">{location.city}</p>
              <p className="text-xs text-gray-600">{location.region}</p>
              <p className="text-xs text-gray-600">Lng: {location.longitude} | Lat: {location.latitude}</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Index;
