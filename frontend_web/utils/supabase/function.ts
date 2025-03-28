export interface Service {
    id: number;
    type: string;
    name: string;
    category?: string;
    classification?: string;
    location?: string;
    distance?: string;
    description?: string;
    contact_no?: string;
    lat: number;
    lon: number;
    verified?: boolean;
  }
export const handleReport = (service: Service) => {

    // Extend this to send the report to an API, open a modal, etc.
  };