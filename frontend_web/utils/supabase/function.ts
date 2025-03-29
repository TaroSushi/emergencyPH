export interface Service {
    id?: number;
    service_id?: number;
    type: string;
    name: string;
    category?: string;
    classification?: string;
    location?: string;
    distance?: string;
    description?: string;
    contact?: string;
    latitude?: number;
    longitude?: number;
    brgy?: string;
    city?: string;
    region?: string;
    province?: string;
    street?: string;
    is_verified?: boolean;
    verified?: boolean;
  }
export const handleReport = (service: Service) => {

    // Extend this to send the report to an API, open a modal, etc.
  };