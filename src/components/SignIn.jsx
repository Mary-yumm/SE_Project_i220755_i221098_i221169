"use client"

import { useState, useEffect } from "react"
import "../styles/SignIn.css"

export default function BrainByteSignInPage() {
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [codeParticles, setCodeParticles] = useState([])
  const [matrixRain, setMatrixRain] = useState([])

  useEffect(() => {
    // Generate code particles
    const generatedParticles = []
    for (let i = 0; i < 80; i++) {
      generatedParticles.push({
        id: i,
        size: Math.random() * 3,
        top: Math.random() * 100,
        left: Math.random() * 100,
        opacity: Math.random() * 0.8 + 0.2,
        duration: Math.random() * 5 + 3,
        content: getRandomCodeSymbol(),
        color: getRandomCodeColor(),
      })
    }
    setCodeParticles(generatedParticles)

    // Generate matrix rain
    const generatedRain = []
    for (let i = 0; i < 15; i++) {
      generatedRain.push({
        id: i,
        top: -20 - Math.random() * 10,
        left: Math.random() * 100,
        delay: Math.random() * 5,
        duration: Math.random() * 10 + 10,
        length: Math.floor(Math.random() * 20) + 10,
      })
    }
    setMatrixRain(generatedRain)
  }, [])

  const getRandomCodeSymbol = () => {
    const symbols = [
      "{ }",
      "[ ]",
      "( )",
      "<>",
      "//",
      "/*",
      "*/",
      "&&",
      "||",
      "==",
      "===",
      "!=",
      "!==",
      "=>",
      "++",
      "--",
      "+=",
      "-=",
      "*=",
      "/=",
      "%=",
      "<<",
      ">>",
      "<<<",
      ">>>",
      "&=",
      "|=",
      "^=",
      "~",
      "?",
      ":",
      ";",
      ",",
      ".",
      "#",
      "@",
      "$",
      "_",
      "0",
      "1",
    ]
    return symbols[Math.floor(Math.random() * symbols.length)]
  }

  const getRandomCodeColor = () => {
    const colors = ["#a78bfa", "#8b5cf6", "#7c3aed", "#6d28d9", "#5b21b6", "#c4b5fd", "#ddd6fe", "#ede9fe", "#f5f3ff"]
    return colors[Math.floor(Math.random() * colors.length)]
  }

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
    <div className="brainbyte-container">
      {/* Left side - Code Background with Text */}
      <div className="code-background">
        {/* Code particles */}
        <div className="particles-container">
          {codeParticles.map((particle) => (
            <div
              key={particle.id}
              className="code-particle"
              style={{
                fontSize: `${particle.size * 5 + 8}px`,
                top: `${particle.top}%`,
                left: `${particle.left}%`,
                opacity: particle.opacity,
                color: particle.color,
                animation: `float ${particle.duration}s infinite`,
              }}
            >
              {particle.content}
            </div>
          ))}
        </div>

        {/* Matrix rain */}
        <div className="matrix-container">
          {matrixRain.map((column) => (
            <div
              key={column.id}
              className="matrix-column"
              style={{
                top: `${column.top}%`,
                left: `${column.left}%`,
                animationDelay: `${column.delay}s`,
                animationDuration: `${column.duration}s`,
              }}
            >
              {Array.from({ length: column.length }).map((_, i) => (
                <div
                  key={i}
                  className="matrix-character"
                  style={{
                    animationDelay: `${i * 0.1}s`,
                    opacity: 1 - i / column.length,
                  }}
                >
                  {Math.random() > 0.5 ? "0" : "1"}
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Text overlay at the bottom */}
        <div className="escape-text">
          <h2>
            SIGN IN TO
            <br />
            <span>ESCAPE THE CODE</span>
          </h2>
          <p>Solve puzzles. Break the locks. Debug your way out.</p>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="form-container">
        <div className="form-content">
          <div className="form-header">
            <h1>
              ACCESS <span className="highlight">BRAINBYTE</span>
            </h1>
            <p>Sign in with your credentials to begin</p>
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
                  placeholder="user@brainbyte.io"
                />
              </div>
            </div>

            <button type="submit" disabled={isSubmitting} className="signup-button">
              {isSubmitting ? "AUTHENTICATING..." : "ENTER THE GAME"}
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
            By signing in you agree to our{" "}
            <a href="#" className="terms-link">
              Terms and Conditions
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

