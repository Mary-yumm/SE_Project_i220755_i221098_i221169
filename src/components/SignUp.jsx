
import { useState, useEffect } from "react"
import { Link } from "react-router-dom";
import "../styles/SignIn.css"
import { signUp } from "../utils/auth"; // Import auth functions
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../utils/firebase"; // Import Firebase auth
import { useNavigate } from "react-router-dom"; // Import useNavigate


export default function BrainByteSignUpPage() {
    const navigate = useNavigate(); // Initialize navigation

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        age: "",
        experience: "beginner",
    })
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [codeParticles, setCodeParticles] = useState([])
    const [matrixRain, setMatrixRain] = useState([])
    const [showPassword, setShowPassword] = useState(false)
    const [passwordMatch, setPasswordMatch] = useState(true)

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

    useEffect(() => {
        // Check if passwords match
        if (formData.confirmPassword) {
            setPasswordMatch(formData.password === formData.confirmPassword)
        }
    }, [formData.password, formData.confirmPassword])

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

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData({
            ...formData,
            [name]: value,
        })
    }

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (formData.password !== formData.confirmPassword) {
            setPasswordMatch(false)
            return
        }

        setIsSubmitting(true)

        try {
            // Firebase Authentication - Create User
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                formData.email,
                formData.password
            );

            console.log("User signed up:", userCredential.user);
            navigate("/SignIn")
            alert("Signup successful!");
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
                        JOIN THE
                        <br />
                        <span>CODE BREAKERS</span>
                    </h2>
                    <p>Create your profile and start solving the most challenging coding puzzles.</p>
                </div>
            </div>

            {/* Right side - Form */}
            <div className="form-container">
                <div className="form-content signup-form-content">
                    <div className="form-header">
                        <h1>
                            CREATE <span className="highlight">ACCOUNT</span>
                        </h1>
                        <p>Sign up to start your coding escape adventure</p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <div className="input-wrapper">
                                <div className="input-icon">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="20"
                                        height="20"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </div>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className="form-input"
                                    placeholder="Full Name"
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <div className="input-wrapper">
                                <div className="input-icon">
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
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="form-input"
                                    placeholder="Email Address"
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <div className="input-wrapper">
                                <div className="input-icon">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="20"
                                        height="20"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    className="form-input"
                                    placeholder="Password"
                                    required
                                />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={togglePasswordVisibility}
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? (
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="20"
                                            height="20"
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z"
                                                clipRule="evenodd"
                                            />
                                            <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                                        </svg>
                                    ) : (
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="20"
                                            height="20"
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                        >
                                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                            <path
                                                fillRule="evenodd"
                                                d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        <div className="form-group">
                            <div className="input-wrapper">
                                <div className="input-icon">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="20"
                                        height="20"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleInputChange}
                                    className={`form-input ${!passwordMatch ? "input-error" : ""}`}
                                    placeholder="Confirm Password"
                                    required
                                />
                            </div>
                            {!passwordMatch && <div className="error-message">Passwords do not match</div>}
                        </div>

                        <div className="form-row">
                            <div className="form-group half-width">
                                <div className="input-wrapper">
                                    <div className="input-icon">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="20"
                                            height="20"
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                    </div>
                                    <input
                                        type="number"
                                        name="age"
                                        value={formData.age}
                                        onChange={handleInputChange}
                                        className="form-input"
                                        placeholder="Age"
                                        min="13"
                                        max="120"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group half-width">
                                <div className="select-wrapper">
                                    <div className="input-icon">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="20"
                                            height="20"
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                    </div>
                                    <select
                                        name="experience"
                                        value={formData.experience}
                                        onChange={handleInputChange}
                                        className="form-select"
                                        required
                                    >
                                        <option value="beginner">Beginner</option>
                                        <option value="intermediate">Intermediate</option>
                                        <option value="advanced">Advanced</option>
                                        <option value="expert">Expert</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <button type="submit" disabled={isSubmitting || !passwordMatch} className="signup-button">
                            {isSubmitting ? "CREATING ACCOUNT..." : "JOIN THE CHALLENGE"}
                        </button>
                    </form>

                    <div className="account-prompt">
                        Already have an account?{" "}
                        <Link to="/SignIn" className="account-link">
                            Sign in here
                        </Link>
                    </div>

                    <div className="terms-text">
                        By signing up you agree to our{" "}
                        <a href="#" className="terms-link">
                            Terms and Conditions
                        </a>
                    </div>
                </div>
            </div>
        </div>
    )
}

