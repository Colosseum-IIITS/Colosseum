'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Trophy, Users } from 'lucide-react'

const PlayerDetails = () => {
  const [player, setPlayer] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchPlayerProfile = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/player/profile', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          },
          credentials: 'include',
        })

        if (response.ok) {
          const data = await response.json()
          setPlayer(data)
        } else {
          setError('Failed to fetch player data')
        }
      } catch (error) {
        setError('An error occurred while fetching player data')
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    fetchPlayerProfile()
  }, [])

  if (loading) {
    return (
      <div className="text-center text-xl text-gray-500">Loading player details...</div>
    )
  }

  if (error) {
    return (
      <div className="text-center text-xl text-red-500">{error}</div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white flex justify-center items-center py-12">
      {/* Profile Card */}
      <Card className="w-full max-w-md bg-gray-800 bg-opacity-80 border-pink-500 border-2 transform hover:scale-105 transition-transform duration-300">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-pink-500 text-center">Player Profile</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-6 p-6">
          <Avatar className="w-24 h-24 ring-4 ring-pink-500 ring-opacity-50">
            <AvatarImage src={player.profilePhoto || '/default-profile.png'} alt="Player Avatar" />
            <AvatarFallback>PP</AvatarFallback>
          </Avatar>
          <div className="text-center">
            <h2 className="text-3xl font-semibold mb-2">{player.username}</h2>
            <p className="text-gray-400 mb-2">Email: {player.email}</p>
            <p className="text-gray-400 mb-2">Team: {player.team || 'No Team Assigned'}</p>
            <div className="flex justify-center gap-8 mt-4">
              <div className="flex items-center gap-1">
                <Trophy className="w-6 h-6 text-yellow-500" />
                <span className="text-gray-400">Rank: {player.rank || 'Unranked'}</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-6 h-6 text-green-500" />
                <span className="text-gray-400">Followers: {player.followers || '0'}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default PlayerDetails
