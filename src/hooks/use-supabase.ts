"use client"

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export function useProfile() {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let subscription: any = null

    async function getProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        
        if (!error) setProfile(data)

        // Real-time subscription to THIS user's profile
        subscription = supabase
          .channel(`profile-${user.id}`)
          .on('postgres_changes', 
            { event: '*', schema: 'public', table: 'profiles', filter: `id=eq.${user.id}` }, 
            (payload) => {
              setProfile(payload.new)
            }
          )
          .subscribe()
      }
      setLoading(false)
    }

    getProfile()

    return () => {
      if (subscription) supabase.removeChannel(subscription)
    }
  }, [])

  return { profile, loading }
}

export function useMissions(role: string) {
  const [missions, setMissions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchMissions() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      let query = supabase.from('missions').select('*')

      if (role === 'client') {
        query = query.eq('client_id', user.id)
      } else if (role === 'driver') {
        query = query.or(`status.eq.pending,driver_id.eq.${user.id}`)
      }

      const { data, error } = await query.order('created_at', { ascending: false })
      
      if (!error) setMissions(data)
      setLoading(false)
    }

    fetchMissions()

    // Real-time subscription
    const subscription = supabase
      .channel('missions-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'missions' }, () => {
        fetchMissions()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(subscription)
    }
  }, [role])

  return { missions, loading }
}
