'use client';

import { useParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Phone, Hospital, Shield, Flame, Scale, User, Flag, ChevronDown, CheckCircle, AlertCircle, PhoneCall } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from '@/utils/supabase/client';
import { handleReport, Service } from "@/utils/supabase/function";
import {ReportModal} from "@/components/custom/report_button";

// Define a helper function to get a valid ID from a service
const getServiceId = (service: Service): string | number => {
  const id = service.service_id || service.id;
  return id !== undefined ? id : `unknown-${Math.random()}`;
};

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
  const type = typeof service === 'string' ? decodeURIComponent(service) : '';
  const [locationDisplay, setLocationDisplay] = useState<string[]>([]);


  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [serviceContributors, setServiceContributors] = useState<Record<string | number, {id: number; username: string}[]>>({});

  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      try {
        sessionStorage.removeItem(`services-${type}`);
        let userLocation = JSON.parse(localStorage.getItem('userLocation') || 'null');

        if (!userLocation) {
          userLocation = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
              pos => {
                const loc = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
                localStorage.setItem('userLocation', JSON.stringify(loc));
                resolve(loc);
              },
              () => reject('Unable to get your location.')
            );
          });
        }

        const sessionKey = `services-${type}-${userLocation.brgy || userLocation.city || userLocation.region || 'default'}`;
        sessionStorage.removeItem(sessionKey);

        const servicesList: Service[] = [];

        if (type === 'Politician') {
          // 🔹 Fetch Barangay Data First from verified services
          const { data: barangayData, error: barangayError } = await supabase
            .from("service")
            .select('*')
            .eq('type', type)
            .eq("category", "Barangay")
            .eq('is_verified', true)
  
          if (barangayError) throw barangayError;
          
          // 🔹 Also fetch from unverified_service table for Barangay
          const { data: unverifiedBarangayData, error: unverifiedBarangayError } = await supabase
            .from("service")
            .select('*')
            .eq('type', type)
            .eq("category", "Barangay")
            .eq('is_verified', false)
            
          if (unverifiedBarangayError) throw unverifiedBarangayError;

          // Add data from verified and unverified sources, marking them accordingly
          if (barangayData) {
            const verifiedServices = barangayData.map(service => ({
              ...service,
              verified: true
            }));
            servicesList.push(...verifiedServices);
          }
          
          if (unverifiedBarangayData) {
            const unverifiedServices = unverifiedBarangayData.map(service => ({
              ...service,
              verified: false
            }));
            servicesList.push(...unverifiedServices);
            setServices([...servicesList]); // Update state with combined data
          }
  
          // 🔹 Fetch City Data Next - verified services
          const { data: cityData, error: cityError } = await supabase
            .from("service")
            .select('*')
            .eq('type', type)
            .eq("category", "City Government")
            .eq('is_verified', true)
  
          if (cityError) throw cityError;
          
          // 🔹 Also fetch from unverified_service table for City
          const { data: unverifiedCityData, error: unverifiedCityError } = await supabase
            .from("unverified_service")
            .select('*')
            .eq('type', type)
            .eq("category", "City Government")
            .eq('is_verified', false)
            
          if (unverifiedCityError) throw unverifiedCityError;

          // Add data from verified and unverified sources, marking them accordingly
          if (cityData) {
            const verifiedServices = cityData.map(service => ({
              ...service,
              verified: true
            }));
            servicesList.push(...verifiedServices);
          }
          
          if (unverifiedCityData) {
            const unverifiedServices = unverifiedCityData.map(service => ({
              ...service,
              verified: false
            }));
            servicesList.push(...unverifiedServices);
            setServices([...servicesList]); // Update state with combined data
          }
        } else {
          // 🔹 Fetch General Services if Not Politician - verified first
          const { data: verifiedData, error: verifiedError } = await supabase
            .from("service")
            .select('*')
            .eq('type', type)
            .eq('is_verified', true);

          console.log("verifiedData", verifiedData)
            
          if (verifiedError) throw verifiedError;
          
          // Then fetch unverified services
          const { data: unverifiedData, error: unverifiedError } = await supabase
            .from("service")
            .select('*')
            .eq('type', type)
            .eq('is_verified', false);
            
          if (unverifiedError) throw unverifiedError;
          
          // Combine data with appropriate verification tags
          if (verifiedData) {
            const verifiedServices = verifiedData.map(service => ({
              ...service,
              verified: true
            }));
            servicesList.push(...verifiedServices);
          }
          
          if (unverifiedData) {
            const unverifiedServices = unverifiedData.map(service => ({
              ...service,
              verified: false
            }));
            servicesList.push(...unverifiedServices);
          }
          
          setServices([...servicesList]);
        }
        
        console.log(servicesList)
        setLocationDisplay([userLocation.brgy, userLocation.city, userLocation.region].filter(Boolean));
  
        // 🔹 Sort by Distance
        const sorted = servicesList.map(service => ({
          ...service,
          distance: getDistanceKm(
            userLocation.latitude, 
            userLocation.longitude, 
            service.latitude ?? 0, 
            service.longitude ?? 0
          ),
          verified: !!service.verified // Ensure verified is a boolean
        })).sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
        
        // First, filter and get top 2 verified services
        const verifiedServices = sorted.filter(service => service.verified).slice(0, 2);
        
        // Then, filter and get top 6 unverified services
        const unverifiedServices = sorted.filter(service => !service.verified).slice(0, 6);
        
        // Combine them for the final list (verified first, then unverified)
        const finalServicesList = [...verifiedServices, ...unverifiedServices];
        
        // Sort the final list by distance again to maintain distance order
        const orderedServices = finalServicesList.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
  
        sessionStorage.setItem(sessionKey, JSON.stringify(orderedServices));
        setServices([...orderedServices]); 

        // Fetch history for each service
        try {
          // Check if we have any services to process
          if (orderedServices.length > 0) {
            const contributorsMap: Record<string | number, {id: number; username: string}[]> = {};
            
            // Process each service
            for (const service of orderedServices) {
              const serviceId = getServiceId(service);
              
              // Fetch the 3 most recent history entries for this service
              const { data: historyData, error: historyError } = await supabase
                .from('history')
                .select('history_id, user_id, service_id, date_modified')
                .eq('service_id', serviceId)
                .order('date_modified', { ascending: false })
                .limit(3);
              
              if (historyError) {
                console.error(`Error fetching history for service ${serviceId}:`, historyError);
                contributorsMap[serviceId] = [];
                continue;
              }
              
              if (historyData && historyData.length > 0) {
                // Get user_ids from history data
                const userIds = historyData.map(item => item.user_id);
                
                // Fetch usernames for these user_ids
                const { data: usersData, error: usersError } = await supabase
                  .from('users')
                  .select('user_id, username')
                  .in('user_id', userIds);
                
                if (usersError) {
                  console.error(`Error fetching usernames for service ${serviceId}:`, usersError);
                  contributorsMap[serviceId] = [];
                } else if (usersData && usersData.length > 0) {
                  // Map to the format needed for contributors
                  const serviceContributors = historyData.map(historyItem => {
                    const user = usersData.find(user => user.user_id === historyItem.user_id);
                    return {
                      id: historyItem.user_id,
                      username: user ? user.username : 'Unknown User'
                    };
                  });
                  contributorsMap[serviceId] = serviceContributors;
                } else {
                  contributorsMap[serviceId] = [];
                }
              } else {
                // No history found for this service
                contributorsMap[serviceId] = [];
              }
            }
            
            setServiceContributors(contributorsMap);
          }
        } catch (error) {
          console.error('Error fetching history:', error);
          console.log('Error details:', JSON.stringify(error, null, 2));
        }
        
      } catch (err) {
        setError(typeof err === 'string' ? err : 'Error fetching services.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
  
    fetchServices();
  }, [type]);
  
  const toggleShowMore = (category: string) => {
    setExpandedCategories(prev => ({ ...prev, [category]: !prev[category] }));
  };

  const getIcon = (type) => {
    switch (type) {
      case 'Medical': return <Hospital />;
      case 'Police': return <Shield />;
      case 'Firehouse': return <Flame />;
      case 'Politician': return <Scale />;
      case 'Rescue': return <PhoneCall />;
      default: return <User />;
    }
  }; 

  if (loading) return <p className="max-w-3xl mx-auto p-4">Loading services...</p>;
  if (error) return <p className="max-w-3xl mx-auto p-4 text-red-500">{error}</p>;

  const handleReportSubmission = async (serviceId: number | undefined) => {
    try {
      if (!serviceId) {
        toast.error('Cannot report: service ID is missing');
        return false;
      }
      
      console.log("Pressed Submit Report for service ID:", serviceId);
      // Insert to reported table directly
      const { data, error } = await supabase
        .from('reported')
        .insert({
          service_id: serviceId
        });

      if (error) throw error;

      toast.success('Report submitted successfully');
      return true;
    } catch (error) {
      console.error('Error submitting report:', error);
      toast.error('Failed to submit report. Please try again.');
      return false;
    }
  };

  const renderSpecialThanks = (service: Service) => {
    const serviceId = getServiceId(service);
    const contributors = serviceContributors[serviceId] || [];
    
    return (
      <div className="mt-3 bg-gray-50 p-3 rounded-lg text-sm">
        <h3 className="font-semibold mb-1">Special Thanks</h3>
        {contributors.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {contributors.map(contributor => (
              <div key={contributor.id} className="bg-white px-2 py-0.5 rounded-full text-xs shadow-sm">
                @{contributor.username}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-xs">No history yet</p>
        )}
      </div>
    );
  };

  const renderPoliticianCard = (service: Service, faded = false) => (
    <Card key={getServiceId(service)} className={`p-4 mb-4 relative flex flex-col overflow-hidden transition-opacity duration-300 
      ${faded ? "relative after:content-[''] after:absolute after:top-0 after:left-0 after:w-full after:h-1/2 after:bg-gradient-to-b after:from-white after:to-transparent" : ""}`} 
      style={{ height: faded ? '50%' : 'auto', clipPath: faded ? 'inset(0 0 50% 0)' : 'none' }}>
      <ReportModal onSubmit={async () => {
        await handleReportSubmission(service.id);
      }} />

      <div className="flex gap-4 items-center">
        <div className="p-3 rounded-full bg-emergency/10">
          {getIcon(service.type)}
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-semibold pr-2">{service.name}</h2>
          {!service.verified && (
            <div className="mt-1">
              <Badge variant="warning" className="flex items-center gap-1 inline-flex">
                <AlertCircle className="h-3 w-3" />
                Unverified
              </Badge>
            </div>
          )}
          <p className="text-gray-500 mt-1">{service.classification || 'No classification'}</p>
        </div>
      </div>

      {service.contact && (
        <Button 
          variant="outline"
          asChild
          className="w-full mt-2"
        >
          <a href={`tel:${service.contact.replace(/\D/g, '')}`} className="flex items-center justify-center">
            <Phone className="w-5 h-5 mr-2" />
            {service.contact}
          </a>
        </Button>
      )}

      {!service.verified && !faded && (
        <div className="mt-2 text-xs text-yellow-600 bg-yellow-50 p-2 rounded">
          <p>This contact hasn&apos;t been verified by our team. Please report if incorrect.</p>
        </div>
      )}

      {!faded && renderSpecialThanks(service)}
    </Card>
  );


  const renderServiceCard = (service: Service) => (
    <Card key={getServiceId(service)} className="p-4 mb-4 relative flex flex-col">
      <ReportModal onSubmit={async () => {
        console.log("Pressed Submit Report")
        const serviceId = getServiceId(service);
        await handleReportSubmission(typeof serviceId === 'number' ? serviceId : undefined);
      }}  />

      <div className="flex gap-4 items-center">
        <div className="p-3 rounded-full bg-emergency/10">
          {getIcon(service.type)}
        </div>
        <div className="flex-1">
          {/* 🔹 Ensures the name does not overlap with the flag */}
          <h2 className="text-lg font-semibold pr-2">{service.name}</h2>
          {!service.verified && (
            <div className="mt-1">
              <Badge variant="warning" className="flex items-center gap-1 inline-flex">
                <AlertCircle className="h-3 w-3" />
                Unverified
              </Badge>
            </div>
          )}
          <p className="text-gray-500 mt-1">{service.classification || 'No classification'}</p>
          <p className="text-gray-500">
            {service.category || 'No category'}
            {service.type !== 'Politician' && ` • ${service.distance} km away`}
          </p>
        </div>
      </div>

      {/* 🔹 Contact Number - Spans the Entire Width of the Card */}
      {service.contact && (
        <Button 
          variant="outline"
          asChild
          className="w-full mt-2"
        >
          <a href={`tel:${service.contact.replace(/\D/g, '')}`} className="flex items-center justify-center">
            <Phone className="w-5 h-5 mr-2" />
            {service.contact}
          </a>
        </Button>
      )}

      {!service.verified && (
        <div className="mt-2 text-xs text-gray-500 p-2 rounded">
          <p>This contact hasn&apos;t been verified by our team. Please report if incorrect.</p>
        </div>
      )}

      {renderSpecialThanks(service)}
    </Card>
  );


  if (type === 'Politician') {
    return (
      <>
        {services.length === 0 && <p>No services found nearby.</p>}

        
        {["Barangay", "City Government", "Regional Government"].map((category, index) => {
          const filteredServices = services.filter((service) => service.category === category);
          if (filteredServices.length === 0) return null;

          const highestRanking = filteredServices[0];
          const otherOfficials = filteredServices.slice(1);

          const expanded = expandedCategories[category];

          return (
            <div key={category} className="mb-6">
              <h2 className="text-xl font-semibold mb-2">{locationDisplay[index]}</h2>

              {highestRanking && renderPoliticianCard(highestRanking)}

              {otherOfficials.length > 0 && (
                <div className="relative">
                  <div className="relative">
                    {renderPoliticianCard(otherOfficials[0], !expandedCategories[category])}
                    {!expandedCategories[category] && (
                    <>
                      <Button
                        variant="outline"
                        className="w-full text-center absolute bottom-0 transform -translate-y-4"
                        onClick={() => toggleShowMore(category)}
                    >
                        {expanded ? 'Show Less' : `Show More (${filteredServices.length - 1})`}
                    </Button>
                    </>
                  )}
                    
                  </div>

                  {expandedCategories[category] && (
                    <>
                      {otherOfficials.slice(1).map(service => renderPoliticianCard(service))}
                      <Button
                        variant="outline"
                        className="w-full text-center mt-6"
                        onClick={() => toggleShowMore(category)}
                      >
                        Show Less
                      </Button>
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </>
    );
  }



  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Nearest {type} Services</h1>
      {services.length === 0 && <p>No services found nearby.</p>}
      {services.map(renderServiceCard)}
    </div>
  );
};

export default NearestServicesPage;
