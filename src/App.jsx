import { useState, useEffect, useRef } from 'react'
import saunaLogo from './assets/sauna.svg'
import oldManSvg from './assets/old-man.png'
import './App.css'

function App() {
  const [fogOpacity, setFogOpacity] = useState(1)
  const progressPercentage = 100 - (fogOpacity * 100)
  const audioRef = useRef(null)
  const ambienceRef = useRef(null)
  const finaleRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showOldMan, setShowOldMan] = useState(false)
  useEffect(() => {
      // Initialize audio elements
      audioRef.current = new Audio('/WaterThrow.mp3')
      ambienceRef.current = new Audio('/Ambience.mp3')
      finaleRef.current = new Audio('/Finale.mp3')
      
      // Configure ambience sound to loop and play at lower volume
      ambienceRef.current.loop = true
      ambienceRef.current.volume = 0.3
      
      // Handle autoplay restrictions by attempting to play and catching any errors
      const playAmbience = () => {
        const playPromise = ambienceRef.current.play()
        
        // Modern browsers return a promise from the play method
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              // Autoplay started successfully
              console.log('Ambience audio started successfully')
            })
            .catch(error => {
              // Autoplay was prevented due to browser policy
              console.warn('Autoplay prevented:', error)
              // We'll rely on the throwWater button click to start audio
              document.addEventListener('click', () => {
                ambienceRef.current.play()
              }, { once: true })
            })
        }
      }
      
      playAmbience()
      
      // Add ended event listener to update playing state
      audioRef.current.addEventListener('ended', () => {
        setIsPlaying(false)
      })
      
      // Cleanup function to remove event listener and stop sounds
      return () => {
        if (audioRef.current) {
          audioRef.current.removeEventListener('ended', () => {
            setIsPlaying(false)
          })
        }
        if (ambienceRef.current) {
          ambienceRef.current.pause()
        }
      }
    }, [])
    
    const throwWater = () => {
      // Decrease fog opacity by 0.01 on each click, but not below 0
      // This makes the fog take much longer to fade away (about 100 clicks to clear)
      const newOpacity = Math.max(fogOpacity - 0.01, 0)
      setFogOpacity(newOpacity)
      
      // Show old man when fog is completely cleared
      if (newOpacity === 0 && !showOldMan) {
        setShowOldMan(true)
        // Play finale sound after 3 seconds
        setTimeout(() => {
          if (finaleRef.current) {
            finaleRef.current.play()
              .catch(error => console.warn('Could not play finale sound:', error))
          }
        }, 3000)
      }
      
      // Ensure ambience is playing (might have been blocked by autoplay policy)
      if (ambienceRef.current && ambienceRef.current.paused) {
        ambienceRef.current.play()
          .catch(error => console.warn('Could not play ambience:', error))
      }
      
      // Play the water throw sound only if it's not currently playing
      if (audioRef.current && !isPlaying) {
        audioRef.current.currentTime = 0 // Reset audio to start
        audioRef.current.play()
          .catch(error => console.warn('Could not play water sound:', error))
        setIsPlaying(true)
      }
    }
    
    const resetGame = () => {
      setFogOpacity(1)
      setShowOldMan(false)
      setAnimationComplete(false)
      if (finaleRef.current) {
        finaleRef.current.currentTime = 0
        finaleRef.current.pause()
      }
    }
    
    // Old man will appear automatically when fog is cleared

  return (
    <div className="sauna-container">
      <h1>Finnish Sauna Experience</h1>
      <div className="sauna-image-container">
        <img src={saunaLogo} className="sauna-image" alt="Sauna" />
        {showOldMan && (
          <img src={oldManSvg} className="old-man" alt="Old Man" />
        )}
        <div 
          className="fog-effect" 
          style={{ opacity: fogOpacity }}
        ></div>
        <svg width="0" height="0">
          <filter id="steam-filter">
            <feTurbulence type="fractalNoise" baseFrequency="0.01" numOctaves="3" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="30" />
          </filter>
        </svg>
      </div>
      
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${progressPercentage}%` }}></div>
        <span className="progress-text">{Math.round(progressPercentage)}% saunottu</span>
      </div>
      
      <div className="controls">
        <button onClick={throwWater} className="water-button">
          Nakkaa löylyä
        </button>
        {showOldMan && (
          <button onClick={resetGame} className="water-button again-button">
            Sauno uudestaan
          </button>
        )}
      </div>
      
      <div className="instructions">
        <p></p>
      </div>
    </div>
  )
}

export default App
