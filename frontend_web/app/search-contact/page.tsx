"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Phone, Hospital, PlusSquare, Car, Shield, Flame, Scale, User } from "lucide-react";
import { Combobox } from "@/components/custom/combobox";
import { handleSubmit } from "@/actions/contact-search";
import { useEffect } from "react";
import { supabase } from '@/utils/supabase/client';

const getDistanceKm = (lat1, lon1, lat2, lon2) => {
    const toRadians = (deg) => deg * (Math.PI / 180);
    
    const R = 6371; // Earth's radius in km
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);    
    
    const radLat1 = toRadians(lat1);
    const radLat2 = toRadians(lat2);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(radLat1) * Math.cos(radLat2) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    
    return (R * c).toFixed(1);
};

const Emergency = () => {
    const [results, setResults] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [regions, setRegions] = useState([]);
    const [categories, setCategories] = useState([]);
    const [classifications, setClassifications] = useState([]);
    const [userLocation, setUserLocation] = useState(null);

    const getDistance = (lat, lon) => {
        if (!userLocation) return '';
        return `${getDistanceKm(userLocation.lat, userLocation.lon, lat, lon)} km away`;
    };

    useEffect(() => {
        async function fetchFilterOptions() {
            try {
                // Fetch regions
                const { data: regionsData } = await supabase.rpc('get_unique_regions');
                setRegions(regionsData?.map(item => ({ 
                    value: item.p_region, 
                    label: item.p_region 
                })) || []);

                // Fetch categories
                const { data: categoriesData } = await supabase.rpc('get_unique_categories');
                setCategories(categoriesData?.map(item => ({ 
                    value: item.p_category, 
                    label: item.p_category 
                })) || []);

                // Fetch classifications
                const { data: classificationsData } = await supabase.rpc('get_unique_classifications');
                setClassifications(classificationsData?.map(item => ({ 
                    value: item.p_classification, 
                    label: item.p_classification 
                })) || []);

                navigator.geolocation.getCurrentPosition(pos => {
                    setUserLocation({
                        lat: pos.coords.latitude,
                        lon: pos.coords.longitude
                    });
                });
            } catch (error) {
                console.error('Error fetching filter options:', error);
            }
        }

        fetchFilterOptions();
    }, []);

    // Custom form submit handler
    const onSubmit = async (event: any) => {
        event.preventDefault();
        setLoading(true);

        // Create FormData object
        const formData = new FormData(event.target);

        try {
            const response = await handleSubmit(formData); // Call the action
            console.log("Pod" + response)
            setResults(response.data); // Store response in state
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto p-4">
            <div className="text-center mb-6">
                <h1 className="text-2xl font-bold">Emergency Services</h1>
                <p className="text-gray-600">Find and contact emergency services near you</p>
            </div>

            <form onSubmit={onSubmit} className="max-w-xl mx-auto space-y-2">
                <Input name="search" placeholder="Search emergency services..." />
                <Combobox name="region" placeholder="Select Region" options={regions} />
                <Combobox name="category" placeholder="Select Category" options={categories} />
                <Combobox name="classification" placeholder="Select Classification..." options={classifications} />
                <Button type="submit">Search</Button>
            </form>

            {results && userLocation && (
                <div className="mt-4 space-y-4">
                    {results.map(service => (
                        <Card key={service.id} className="p-4">
                            <div className="flex gap-4">
                                <div className="p-3 bg-emergency/10 rounded-full">
                                    {service.type === 'Medical' ? (
                                        <Hospital className="text-emergency" />
                                    ) : service.type === 'Police' ? (
                                        <Shield className="text-emergency" />
                                    ) : service.type === 'Firehouse' ? (
                                        <Flame className="text-emergency" />
                                    ) : service.type === 'Politician' ? (
                                        <Scale className="text-emergency" />
                                    ) : (
                                        <User className="text-emergency" />
                                    )}
                                    </div>

                                <div>   
                                    <h2 className="text-lg font-semibold">{service.name || 'No category'}</h2>
                                    <p className="text-gray-500">
                                    {service.category || 'No cagetory'} • {service.classification || 'No classification'}
                                    </p>
                                    <p className="text-gray-500">
                                    {service.location || 'No region'} • {getDistance(service.lat, service.lon)}
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
            )}
        </div>
    );
};

export default Emergency;
