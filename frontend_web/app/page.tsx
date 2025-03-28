'use client';
import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  MapPin, 
  Shield, 
  Hospital, 
  Flame, 
  Scale, 
  Bell, 
  Clock, 
  AlertTriangle,
  PhoneCall,
  Plus,
  User,
  RefreshCw
} from 'lucide-react';
import Link from "next/link";

interface UserLocation {
  city: string;
  country: string;
  region: string;
  brgy: string;
  longitude: number;
  latitude: number;
}

interface Alert {
  id: number;
  title: string;
  description: string;
  location: string;
  timestamp: Date;
  type: {
    name: string;
    color: string;
  };
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
  const [isUpdateLocation, setIsUpdateLocation] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const fetchUserLocation = async (latitude: number, longitude: number) => {
    try {
      setIsUpdateLocation(true);
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
      setIsUpdateLocation(false);
    } catch (error) {
      console.error("Error fetching location:", error);
      setIsUpdateLocation(false);
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
    { id: 1, text: "Medical", link: "/contacts/Medical", icon: <Hospital className="h-10 w-10 text-white" />, color: "#FF6B6B" },
    { id: 2, text: "Police", link: "/contacts/Police", icon: <Shield className="h-10 w-10 text-white" />, color: "#4D96FF" },
    { id: 3, text: "Fire", link: "/contacts/Firehouse", icon: <Flame className="h-10 w-10 text-white" />, color: "#FF9F45" },
    { id: 4, text: "Rescue", link: "/contacts/Rescue", icon: <PhoneCall className="h-10 w-10 text-white" />, color: "#6BCB77" },
  ];

  // Mock data for recent alerts
  const recentAlerts: Alert[] = [
    {
      id: 1,
      title: "Flash Flood Warning",
      description: "Areas near Pasig River are experiencing rising water levels due to heavy rain.",
      location: "Pasig City",
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 mins ago
      type: { name: "Flood", color: "#4D96FF" }
    },
    {
      id: 2,
      title: "Road Closure",
      description: "EDSA southbound lane closed due to accident near Kamuning.",
      location: "Quezon City",
      timestamp: new Date(Date.now() - 1000 * 60 * 120), // 2 hours ago
      type: { name: "Traffic", color: "#FF9F45" }
    },
    {
      id: 3,
      title: "Power Outage",
      description: "Several areas in Makati experiencing power interruption.",
      location: "Makati City",
      timestamp: new Date(Date.now() - 1000 * 60 * 180), // 3 hours ago
      type: { name: "Utility", color: "#6BCB77" }
    }
  ];

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - timestamp.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 60) {
      return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`;
    } else {
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) {
        return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
      } else {
        const diffDays = Math.floor(diffHours / 24);
        return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
      }
    }
  };

  const getAlertIcon = (alertType: string) => {
    switch (alertType.toLowerCase()) {
      case 'flood':
        return <AlertTriangle className="h-6 w-6 text-blue-500" />;
      case 'traffic':
        return <AlertTriangle className="h-6 w-6 text-orange-500" />;
      case 'utility':
        return <AlertTriangle className="h-6 w-6 text-green-500" />;
      default:
        return <AlertTriangle className="h-6 w-6 text-red-500" />;
    }
  };

  const showAuthDialog = () => {
    alert("You need to log in to access this feature");
    // You would handle authentication here
    setIsAuthenticated(true); // For demo purposes
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-up">
      {/* Header with Profile Link */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          Emergency<span className="text-blue-500">PH</span>
        </h1>
        <button 
          onClick={() => isAuthenticated ? alert("Profile would open here") : showAuthDialog()}
          className="p-2 rounded-full hover:bg-gray-100"
        >
          <User className="h-6 w-6 text-blue-500" />
        </button>
      </div>

      {/* Location Bar */}
      <div 
        className="flex items-center gap-2 bg-gray-50 p-3 rounded-lg cursor-pointer shadow-sm hover:bg-gray-100 transition-colors"
        onClick={() => {
          if (!isUpdateLocation) {
            if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition(
                (position) => {
                  fetchUserLocation(position.coords.latitude, position.coords.longitude);
                }
              );
            }
          }
        }}
      >
        <MapPin className="h-5 w-5 text-blue-500" />
        <div className="flex-1">
          <p className="text-sm font-medium truncate">
            {isUpdateLocation ? "Updating location..." : `${location.brgy}, ${location.city}, ${location.region}`}
          </p>
        </div>
        {isUpdateLocation && <RefreshCw className="h-4 w-4 text-gray-500 animate-spin" />}
      </div>

      {/* Emergency Services Section */}
      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Emergency Services</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {services.map(service => (
            <Link href={service.link} key={service.id}>
              <div 
                className="rounded-xl shadow-md hover:shadow-lg cursor-pointer transition-all duration-300 aspect-square flex flex-col justify-center items-center p-4"
                style={{ backgroundColor: service.color }}
              >
                <div className="flex flex-col justify-center items-center h-full">
                  {service.icon}
                  <h2 className="text-lg font-semibold text-white mt-3">{service.text}</h2>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Recent Alerts Section */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Recent Alerts</h2>
          <Link href="#" className="text-blue-500 text-sm hover:underline">View All</Link>
        </div>
        
        <div className="bg-gray-50 border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          {/* Scroll indicator */}
          <div className="flex justify-center pt-2">
            <div className="w-10 h-1 bg-gray-300 rounded-full"></div>
          </div>
          
          <div className="divide-y divide-gray-100">
            {recentAlerts.length > 0 ? (
              recentAlerts.map(alert => (
                <div key={alert.id} className="p-4 bg-white m-2 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg" style={{ backgroundColor: `${alert.type.color}20` }}>
                      {getAlertIcon(alert.type.name)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{alert.title}</h3>
                      <p className="text-sm text-gray-600 line-clamp-2 mb-2">{alert.description}</p>
                      <div className="flex items-center text-xs text-gray-500 gap-2">
                        <Clock className="h-3 w-3" />
                        <span>{formatTimestamp(alert.timestamp)}</span>
                        <MapPin className="h-3 w-3 ml-2" />
                        <span className="truncate">{alert.location}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">
                No recent alerts
              </div>
            )}
          </div>
          
          {/* Scroll footer indicator */}
          <div className="bg-gray-100 p-2 text-xs text-gray-500 flex items-center justify-center gap-1">
            <span>Scroll for more alerts</span>
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </section>

      {/* Report Alert Button */}
      <section>
        <Button 
          className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-4 rounded-xl shadow-md transition-colors"
          onClick={() => isAuthenticated ? alert("Report Alert form would open") : showAuthDialog()}
        >
          Report Alert
        </Button>
      </section>

      {/* Contribute Section */}
      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Contribute to Emergency Services</h2>
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 shadow-sm">
          <p className="text-gray-700 mb-4">
            Help us improve our emergency services database by adding contact information for emergency services in your area.
          </p>
          <Button 
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-lg shadow-md transition-colors"
            onClick={() => isAuthenticated ? alert("Add Number form would open") : showAuthDialog()}
          >
            <Plus className="h-4 w-4 mr-2" /> Add Number
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Index;
