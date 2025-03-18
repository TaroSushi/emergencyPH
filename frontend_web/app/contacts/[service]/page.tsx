'use client';

import { useParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Phone, Hospital, Shield, Flame, Scale, User, Flag, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from '@/utils/supabase/client';
import { handleReport, Service } from "@/utils/supabase/function";
import {ReportModal} from "@/components/custom/report_button";

const getDistanceKm = (lat1, lon1, lat2, lon2) => {
  const toRadians = (deg) => deg * (Math.PI / 180);
  const R = 6371;
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return (R * c).toFixed(1); // Distance in km
};

const NearestServicesPage = () => {
  const { service } = useParams();
  const type = typeof service === 'string' ? decodeURIComponent(service) : '';
  const [locationDisplay, setLocationDisplay] = useState<string[]>([]);


  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

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
  
        let servicesList: Service[] = [];
  
        if (type === 'Politician') {
          // 🔹 Fetch Barangay Data First
          const { data: barangayData, error: barangayError } = await supabase
            .from("contacts")
            .select('*')
            .eq('type', type)
            .eq("category", "Barangay")
            .ilike('barangay', `%${userLocation.brgy}%`)
            .ilike('city', `%${userLocation.city}%`);
  
          if (barangayError) throw barangayError;
  
          if (barangayData) {
            servicesList.push(...barangayData);
            setServices([...servicesList]); // ✅ Update state with barangay data
          }

          console.log(barangayData)
  
          // 🔹 Fetch City Data Next
          const { data: cityData, error: cityError } = await supabase
            .from("contacts")
            .select('*')
            .eq('type', type)
            .eq("category", "City Government")
            .ilike('city', `%${userLocation.city}%`);
  
          if (cityError) throw cityError;
  
          if (cityData) {
            servicesList.push(...cityData);
            setServices([...servicesList]); // ✅ Update state with city data
          }

          console.log(cityData)
        } else {
          // 🔹 Fetch General Services if Not Politician
          const { data, error } = await supabase.from("contacts").select('*').eq('type', type);
          if (error) throw error;
          servicesList = data;
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
            service.lat ?? 0, 
            service.lon ?? 0
          )
        })).sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
  
        sessionStorage.setItem(sessionKey, JSON.stringify(sorted));
        setServices([...sorted]); 
        
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
      default: return <User />;
    }
  }; 

  if (loading) return <p className="max-w-3xl mx-auto p-4">Loading services...</p>;
  if (error) return <p className="max-w-3xl mx-auto p-4 text-red-500">{error}</p>;

  const handleReportSubmission = async (serviceId: number) => {
    try {
      console.log("Pressed Submit Report")
      const { data, error } = await supabase
        .rpc('insert_reported', {
          p_service_id: serviceId,
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

  const renderPoliticianCard = (service: Service, faded = false) => (
    <Card key={service.id} className={`p-4 mb-4 relative flex flex-col overflow-hidden transition-opacity duration-300 ${faded ? "relative after:content-[''] after:absolute after:top-0 after:left-0 after:w-full after:h-1/2 after:bg-gradient-to-b after:from-white after:to-transparent" : ""}`} style={{ height: faded ? '50%' : 'auto', clipPath: faded ? 'inset(0 0 50% 0)' : 'none' }}>
      <ReportModal onSubmit={async () => {
        await handleReportSubmission(service.id);
      }} />

      <div className="flex gap-4 items-center">
        <div className="p-3 bg-emergency/10 rounded-full">
          {getIcon(service.type)}
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-semibold pr-8">{service.name}</h2>
          <p className="text-gray-500">{service.classification || 'No classification'}</p>
        </div>
      </div>

      {service.contact_no && (
        <Button 
          variant="outline"
          asChild
          className="w-full mt-2"
        >
          <a href={`tel:${service.contact_no.replace(/\D/g, '')}`} className="flex items-center justify-center">
            <Phone className="w-5 h-5 mr-2" />
            {service.contact_no}
          </a>
        </Button>
      )}
    </Card>
  );


  const renderServiceCard = (service: Service) => (
    <Card key={service.id} className="p-4 mb-4 relative flex flex-col">
      <ReportModal onSubmit={async () => {
        console.log("Pressed Submit Report")
         await handleReportSubmission(service.id);
      }}  />

      <div className="flex gap-4 items-center">
        <div className="p-3 bg-emergency/10 rounded-full">
          {getIcon(service.type)}
        </div>
        <div className="flex-1">
          {/* 🔹 Ensures the name does not overlap with the flag */}
          <h2 className="text-lg font-semibold pr-8">{service.name}</h2>
          <p className="text-gray-500">{service.classification || 'No classification'}</p>
          <p className="text-gray-500">
            {service.category || 'No category'}
            {service.type !== 'Politician' && ` • ${service.distance} km away`}
          </p>
        </div>
      </div>

      {/* 🔹 Contact Number - Spans the Entire Width of the Card */}
      {service.contact_no && (
        <Button 
          variant="outline"
          asChild
          className="w-full mt-2"
        >
          <a href={`tel:${service.contact_no.replace(/\D/g, '')}`} className="flex items-center justify-center">
            <Phone className="w-5 h-5 mr-2" />
            {service.contact_no}
          </a>
        </Button>
      )}
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
      {services.slice(0,8).map(renderServiceCard)}
    </div>
  );

};

export default NearestServicesPage;
