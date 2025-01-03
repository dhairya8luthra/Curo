export interface Location {
    latitude: number;
    longitude: number;
  }
  
  export interface OpeningHours {
    open_now: boolean;
    weekday_text?: string[];
    periods?: {
      open: {
        day: number;
        hour: number;
        minute: number;
      };
      close: {
        day: number;
        hour: number;
        minute: number;
      };
    }[];
  }
  
  export interface Review {
    author_name: string;
    rating: number;
    relative_time_description: string;
    text: string;
    profile_photo_url: string;
  }
  
  export interface Photo {
    photo_reference: string;
    height: number;
    width: number;
  }
  
  export interface Hospital {
    place_id: string;
    name: string;
    vicinity: string;
    geometry?: {
      location: {
        lat: number;
        lng: number;
      };
    };
    rating?: number;
    user_ratings_total?: number;
    opening_hours?: OpeningHours;
    types?: string[];
    photos?: Photo[];
    reviews?: Review[];
  }