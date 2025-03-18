"use client"

import { useState, useEffect } from "react"
import "../styles/SignIn.css"

export default function SpaceSignInPage() {
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [stars, setStars] = useState([])
  const [shootingStars, setShootingStars] = useState([])

  useEffect(() => {
    // Generate stars
    const generatedStars = []
    for (let i = 0; i < 100; i++) {
      generatedStars.push({
        id: i,
        size: Math.random() * 3,
        top: Math.random() * 100,
        left: Math.random() * 100,
        opacity: Math.random() * 0.8 + 0.2,
        duration: Math.random() * 5 + 3,
      })
    }
    setStars(generatedStars)

    // Generate shooting stars
    const generatedShootingStars = []
    for (let i = 0; i < 5; i++) {
      generatedShootingStars.push({
        id: i,
        top: Math.random() * 70,
        left: Math.random() * 70,
        delay: Math.random() * 5,
        duration: Math.random() * 10 + 10,
      })
    }
    setShootingStars(generatedShootingStars)
  }, [])

  const handleEmailChange = (e) => {
    setEmail(e.target.value)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))
      console.log("Sign up with email:", email)
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-container">
      {/* Left side - Space Background with Text */}
      <div className="space-background">
        {/* Stars */}
        <div className="stars-container">
          {stars.map((star) => (
            <div
              key={star.id}
              className="star"
              style={{
                width: `${star.size}px`,
                height: `${star.size}px`,
                top: `${star.top}%`,
                left: `${star.left}%`,
                opacity: star.opacity,
                animation: `twinkle ${star.duration}s infinite`,
              }}
            />
          ))}
        </div>

        {/* Shooting stars */}
        {shootingStars.map((star) => (
          <div
            key={star.id}
            className="shooting-star"
            style={{
              width: "2px",
              height: "2px",
              top: `${star.top}%`,
              left: `${star.left}%`,
              animation: `shootingstar ${star.duration}s ${star.delay}s infinite linear`,
            }}
          />
        ))}

        {/* Blue Planet */}
        <div className="blue-planet">
          <div className="planet-cloud" style={{ width: "160px", height: "80px", top: "20%", left: "10%" }}></div>
          <div className="planet-cloud" style={{ width: "240px", height: "64px", top: "40%", left: "20%" }}></div>
          <div className="planet-cloud" style={{ width: "128px", height: "96px", top: "60%", left: "50%" }}></div>
        </div>

        {/* Purple Planet */}
        <div className="purple-planet">
          <div className="planet-cloud" style={{ width: "80px", height: "40px", top: "30%", left: "20%" }}></div>
        </div>

        {/* Small Purple Planet */}
        <div className="small-purple-planet"></div>

        {/* Text overlay at the bottom */}
        <div className="adventure-text">
          <h2>
            SIGN IN TO YOUR
            <br />
            <span>ADVENTURE!</span>
          </h2>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="form-container">
        <div className="form-content">
          <div className="form-header">
            <h1>SIGN IN</h1>
            <p>Sign in with email address</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <div className="input-wrapper">
                <div className="email-icon">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  className="email-input"
                  placeholder="Yourname@gmail.com"
                />
              </div>
            </div>

            <button type="submit" disabled={isSubmitting} className="signup-button">
              {isSubmitting ? "Signing up..." : "Sign up"}
            </button>
          </form>

          <div className="divider">
            <div className="divider-line"></div>
            <span className="divider-text">Or continue with</span>
          </div>

          <div className="social-buttons">
            <button type="button" className="google-button">
              <span className="social-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M12.24 10.285V14.4h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.439-3.389-7.439-7.574s3.345-7.574 7.439-7.574c2.33 0 3.891.989 4.785 1.849l3.254-3.138C18.189 1.186 15.479 0 12.24 0c-6.635 0-12 5.365-12 12s5.365 12 12 12c6.926 0 11.52-4.869 11.52-11.726 0-.788-.085-1.39-.189-1.989H12.24z"
                    fill="currentColor"
                  />
                </svg>
              </span>
              Google
            </button>

            <button type="button" className="facebook-button">
              <span className="social-icon">
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                    clipRule="evenodd"
                  />
                </svg>
              </span>
              Facebook
            </button>
          </div>

          <div className="terms-text">
            By registering you with our{" "}
            <a href="#" className="terms-link">
              Terms and Conditions
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

