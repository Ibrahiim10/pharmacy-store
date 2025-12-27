import { Button } from "@/components/ui/button"
import { Card, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useMutation } from "@tanstack/react-query"
import { LoaderCircle } from "lucide-react"
import { useState } from "react"
import useAuthStore from "@/lib/store/authStore"
import {
    CardContent,
    CardDescription,
    CardFooter,
    CardTitle,
} from "../ui/card"
import { useNavigate } from "react-router"
import api from "@/lib/api/apiClient"

const RegisterForm = () => {
    const navigate = useNavigate()
    const setAuth = useAuthStore((s) => s.setAuth)

    const [formValues, setFormValues] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
    })

    const [error, setError] = useState(null)

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormValues((prev) => ({ ...prev, [name]: value }))
    }

    const registerMutation = useMutation({
        mutationFn: async (userData) => {
            const { data } = await api.post("/auth/register", userData)
            return data // expected: { token, user }
        },
        onSuccess: (data) => {
            // ✅ Option A: auto-login after register (recommended)
            if (data?.token && data?.user) {
                setAuth(data.user, data.token)
                navigate("/")
                return
            }

            // ✅ Option B: if your backend returns only token, send them to login
            navigate("/login")
        },
        onError: (err) => {
            setError(extractErrorMessage(err))
        },
    })

    const handleSubmit = (e) => {
        e.preventDefault()
        setError(null)

        const { name, email, password, confirmPassword } = formValues

        if (!name || !email || !password || !confirmPassword) {
            setError("All fields are required")
            return
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match")
            return
        }

        registerMutation.mutate({ name, email, password })
    }

    return (
        <Card className="w-full border-border">
            <CardHeader className="space-y-1 pb-4">
                <CardTitle className="text-xl text-center">Create an account</CardTitle>
                <CardDescription className="text-center">
                    Enter your details to register
                </CardDescription>

                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4 pt-0">
                        {error && (
                            <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-md">
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <div className="text-sm font-medium text-left">Full Name</div>
                            <Input
                                type="text"
                                name="name"
                                placeholder="John Doe"
                                required
                                value={formValues.name}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="text-sm font-medium text-left">Email</div>
                            <Input
                                type="email"
                                name="email"
                                placeholder="johndoe@gmail.com"
                                required
                                value={formValues.email}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="text-sm font-medium text-left">Password</div>
                            <Input
                                name="password"
                                type="password"
                                placeholder="*****"
                                required
                                value={formValues.password}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="text-sm font-medium text-left">
                                Confirm Password
                            </div>
                            <Input
                                name="confirmPassword"
                                type="password"
                                placeholder="*****"
                                required
                                value={formValues.confirmPassword}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div className="py-4">
                            <Button
                                type="submit"
                                className="w-full cursor-pointer"
                                disabled={registerMutation.isPending}
                            >
                                {registerMutation.isPending ? (
                                    <span className="flex items-center gap-2">
                                        <LoaderCircle className="animate-spin" />
                                        Creating account...
                                    </span>
                                ) : (
                                    "Create Account"
                                )}
                            </Button>
                        </div>
                    </CardContent>

                    <CardFooter className="flex justify-center pt-0">
                        <div className="text-center text-sm">
                            Already have an account?{" "}
                            <span
                                onClick={() => navigate("/login")}
                                className="text-primary hover:underline cursor-pointer"
                            >
                                Sign in
                            </span>
                        </div>
                    </CardFooter>
                </form>
            </CardHeader>
        </Card>
    )
}

export default RegisterForm
