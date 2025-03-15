"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from '@/utils/supabase/client';
import { Card } from "@/components/ui/card";
import { Phone, Hospital, Shield, Flame, Scale, User } from "lucide-react";
import { Button } from "@/components/ui/button";

const getDistanceKm = (lat1, lon1, lat2, lon2) => {
    const toRadians = (deg) => deg * (Math.PI / 180);
    const R = 6371;
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c).toFixed(1);
};

const NearestServicesPage = () => {
    const { service } = useParams();
    const type = decodeURIComponent(service);

    const [services, setServices] = useState([]);
    const [userLocation, setUserLocation] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(
            pos => {
                setUserLocation({
                    lat: pos.coords.latitude,
                    lon: pos.coords.longitude
                });
            },
            () => setError("Unable to retrieve your location.")
        );
    }, []);

    useEffect(() => {
        const fetchServices = async () => {
            if (!userLocation || !type) return;

            try {
                const { data, error } = await supabase
                    .from("contacts") // confirm this is your correct table name
                    .select('*')
                    .eq('type', type);

                if (error) throw error;

                const sortedData = data
                    .map(service => ({
                        ...service,
                        distance: getDistanceKm(userLocation.lat, userLocation.lon, service.lat, service.lon)
                    }))
                    .sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));

                setServices(sortedData);
            } catch (err) {
                setError("Error fetching services data.");
                console.error(err);
            }
        };

        fetchServices();
    }, [userLocation, type]); // <-- Only run this effect when userLocation or type changes.

    const getIcon = (type) => {
        switch (type) {
            case 'Medical': return <Hospital className="text-emergency" />;
            case 'Police': return <Shield className="text-emergency" />;
            case 'Firehouse': return <Flame className="text-emergency" />;
            case 'Politician': return <Scale className="text-emergency" />;
            default: return <User className="text-emergency" />;
        }
    };

    if (error) {
        return <div className="max-w-3xl mx-auto p-4 text-red-500">{error}</div>;
    }

    return (
        <div className="max-w-3xl mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Nearest {type} Services</h1>

            {services.length === 0 && <p>Loading or no services found...</p>}

            {services.map(service => (
                <Card key={service.id} className="p-4 mb-4">
                    <div className="flex gap-4">
                        <div className="p-3 bg-emergency/10 rounded-full">
                            {getIcon(service.type)}
                        </div>
                        <div>   
                            <h2 className="text-lg font-semibold">{service.name || 'No name'}</h2>
                            <p className="text-gray-500">
                                {service.category || 'No category'} • {service.classification || 'No classification'}
                            </p>
                            <p className="text-gray-500">
                                {service.location || 'No region'} • {service.distance} km away
                            </p>
                            <p className="mt-1">{service.description || 'No description'}</p>
                            <Button variant="outline" asChild className="mt-2">
                                <a href={`tel:${service.contact_no.replace(/\D/g, '')}`}> 
                                    <Phone className="w-4 h-4 mr-2" />
                                    {service.contact_no}
                                </a>
                            </Button>
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    );
};

export default NearestServicesPage;
