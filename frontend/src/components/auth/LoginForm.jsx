import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useMutation } from "@tanstack/react-query"
import { LoaderCircle } from "lucide-react"
import { useState } from "react"

import useAuthStore from "@/lib/store/authStore"
import api from "@/lib/api/apiClient"
import { useNavigate } from "react-router"

const LoginForm = () => {
    const navigate = useNavigate()
    const setAuth = useAuthStore((s) => s.setAuth)

    const [formValues, setFormValues] = useState({
        email: "",
        password: "",
    })

    const [error, setError] = useState(null)

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormValues((prev) => ({ ...prev, [name]: value }))
    }

    const loginMutation = useMutation({
        mutationFn: async (credentials) => {
            const { data } = await api.post("/auth/login", credentials)
            return data // expected: { token, user }
        },
        onSuccess: (data) => {
            if (data?.token && data?.user) {
                setAuth(data.user, data.token)

                const role = data.user.role
                if (role === "admin" || role === "pharmacist") {
                    navigate("/admin")
                } else {
                    navigate("/")
                }
                return
            }

            setError("Unexpected server response")
        },
        onError: (err) => {
            setError(extractErrorMessage(err))
        },
    })

    const handleSubmit = (e) => {
        e.preventDefault()
        setError(null)

        if (!formValues.email || !formValues.password) {
            setError("All fields are required")
            return
        }

        loginMutation.mutate({
            email: formValues.email.trim(),
            password: formValues.password,
        })
    }

    return (
        <Card className="w-full border-border">
            <CardHeader className="space-y-1 pb-4">
                <CardTitle className="text-xl text-center">Sign In</CardTitle>
                <CardDescription className="text-center">
                    Enter your credentials to access your account
                </CardDescription>

                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4 pt-0">
                        {error && (
                            <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-md">
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <div className="text-sm font-medium text-left">Email</div>
                            <Input
                                name="email"
                                type="email"
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

                        <div className="py-4">
                            <Button
                                type="submit"
                                className="w-full cursor-pointer"
                                disabled={loginMutation.isPending}
                            >
                                {loginMutation.isPending ? (
                                    <span className="flex items-center gap-2">
                                        <LoaderCircle className="animate-spin" />
                                        Logging in...
                                    </span>
                                ) : (
                                    "Login Account"
                                )}
                            </Button>
                        </div>
                    </CardContent>

                    <CardFooter className="flex justify-center pt-0">
                        <div className="text-center text-sm">
                            Don’t have an account?{" "}
                            <span
                                onClick={() => navigate("/register")}
                                className="text-primary hover:underline cursor-pointer"
                            >
                                Sign up
                            </span>
                        </div>
                    </CardFooter>
                </form>
            </CardHeader>
        </Card>
    )
}

export default LoginForm
