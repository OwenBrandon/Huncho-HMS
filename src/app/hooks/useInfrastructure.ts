import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import type { Building, Room } from '../types';

export function useInfrastructure() {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [rooms, setRooms] = useState<(Room & { building?: Building })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInfrastructure = async () => {
    setIsLoading(true);
    try {
      // Fetch Buildings
      const { data: bData, error: bError } = await supabase
        .from('buildings')
        .select('*')
        .order('name');
      
      if (bError) throw bError;
      setBuildings(bData || []);

      // Fetch Rooms with Building details
      const { data: rData, error: rError } = await supabase
        .from('rooms')
        .select(`
          *,
          building:buildings(*)
        `)
        .order('room_number');

      if (rError) throw rError;
      
      // Flatten joined building data
      const flattenedRooms = rData?.map(r => ({
        ...r,
        building: Array.isArray(r.building) ? r.building[0] : r.building
      })) || [];
      
      setRooms(flattenedRooms);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInfrastructure();
  }, []);

  const addBuilding = async (building: Omit<Building, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase
      .from('buildings')
      .insert(building)
      .select()
      .single();
    
    if (error) throw error;
    setBuildings(prev => [...prev, data]);
    return data;
  };

  const addRoom = async (room: Omit<Room, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase
      .from('rooms')
      .insert(room)
      .select(`
        *,
        building:buildings(*)
      `)
      .single();
    
    if (error) throw error;
    
    // Flatten joined building data
    const flattenedRoom = {
      ...data,
      building: Array.isArray(data.building) ? data.building[0] : data.building
    };
    
    setRooms(prev => [...prev, flattenedRoom]);
    return flattenedRoom;
  };

  return { buildings, rooms, isLoading, error, refresh: fetchInfrastructure, addBuilding, addRoom };
}
