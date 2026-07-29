import api from "@/lib/axios";
import { ApiResponse, Hotel } from "@/types";

export interface HotelFilters {
  ville?: string;
  type?: string;
  minPrix?: number;
  maxPrix?: number;
  etoiles?: number;
  page?: number;
  limit?: number;
  lat?: number;
  lng?: number;
}

export interface HotelsListResponse {
  hotels: Hotel[];
  total: number;
  page: number;
  totalPages: number;
}

export const hotelService = {
  getHotels: async (filters: HotelFilters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, val]) => {
      if (val !== undefined && val !== "" && val !== null) {
        params.append(key, String(val));
      }
    });
    const res = await api.get<ApiResponse<HotelsListResponse>>(
      `/hotels?${params.toString()}`
    );
    return res.data;
  },

  getHotel: async (slug: string) => {
    const res = await api.get<ApiResponse<{ hotel: Hotel }>>(`/hotels/${slug}`);
    return res.data;
  },

  getVilles: async () => {
    const res = await api.get<ApiResponse<{ villes: string[] }>>(
      "/hotels/villes"
    );
    return res.data;
  },

  getMesHotels: async () => {
    const res = await api.get<ApiResponse<{ hotels: Hotel[] }>>(
      "/hotels/mes-hotels"
    );
    return res.data;
  },

  createHotel: async (formData: FormData) => {
    const res = await api.post<ApiResponse<{ hotel: Hotel }>>(
      "/hotels",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return res.data;
  },

  updateHotel: async (id: string, formData: FormData) => {
    const res = await api.put<ApiResponse<{ hotel: Hotel }>>(
      `/hotels/${id}`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return res.data;
  },

  deleteHotel: async (id: string) => {
    const res = await api.delete<ApiResponse<null>>(`/hotels/${id}`);
    return res.data;
  },
};