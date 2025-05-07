"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";

// Loading component to use during Suspense
function AuthLoading() {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Loading...</h2>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
      </div>
    </div>
  );
}

// Component that uses useSearchParams
function AuthPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = searchParams.get("role");

  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false); // Loading state
  const [errorMessage, setErrorMessage] = useState(""); // To show error messages
  const form = useForm();

  useEffect(() => {
    if (!role) {
      router.push("/");
    }
  }, [role, router]);

  const handleSubmit = async (data) => {
    const endpoint = `/auth/${role}/${isSignUp ? "signup" : "signin"}`;

    setLoading(true);
    setErrorMessage(""); // Reset error message before each submit

    console.log(`Attempting to ${isSignUp ? "sign up" : "sign in"} as ${role}`);
    console.log(`API URL: ${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${endpoint}`);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${endpoint}`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        credentials: "include", // Re-enabling credentials to handle cookies properly
      });

      console.log("Response status:", res.status);
      console.log("Response headers:", [...res.headers.entries()]);

      const responseData = await res.json();
      console.log("Response data:", responseData);

      if (res.ok) {
        // Always use token-based auth for cross-domain deployment
        // Store all necessary auth info in localStorage
        if (responseData.token) {
          localStorage.setItem("token", responseData.token);
          localStorage.setItem("userRole", role);
          localStorage.setItem("isAuthenticated", "true");
          
          // Store any additional user data if available
          if (responseData.user) {
            localStorage.setItem("userData", JSON.stringify(responseData.user));
          }
          
          console.log("Auth data stored in localStorage");
        } else {
          console.error("No token received in the response");
          setErrorMessage("Authentication error. No token received.");
          setLoading(false);
          return;
        }

        console.log(`Redirecting to ${role} dashboard`);

        // Redirect to the appropriate dashboard
        if (role === "player") {
          router.push("/player/home");
        } else if (role === "admin") {
          router.push("/admin/user-management");
        } else {
          router.push("/org/dashboard");
        }
      } else {
        console.error("Error response:", responseData);
        setErrorMessage(responseData.errorMessage || "Something went wrong.");
      }
    } catch (error) {
      console.error("Error during submission:", error);
      setErrorMessage("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!role) {
    return null;
  }

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <video
        className="absolute top-0 left-0 w-full h-auto transform scale-150 object-cover"
        src="/videos/authBackground.mp4"
        autoPlay
        loop
        muted
      ></video>

      <div className="relative z-10 flex justify-center items-center h-screen bg-black bg-opacity-50">
        <div className="w-full max-w-md p-6 bg-white bg-opacity-90 rounded-lg shadow-md">
          <h2 className="text-center text-2xl font-bold mb-4">
            {isSignUp ? "Sign Up" : "Sign In"} as {role.charAt(0).toUpperCase() + role.slice(1)}
          </h2>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input
                    {...form.register("username", { required: "Username is required" })}
                    placeholder="Enter your username"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>

              {isSignUp && (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      {...form.register("email", { required: "Email is required" })}
                      placeholder="Enter your email"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}

              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    {...form.register("password", { required: "Password is required" })}
                    placeholder="Enter your password"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Loading..." : isSignUp ? "Sign Up" : "Sign In"}
              </Button>
            </form>
          </Form>

          {errorMessage && <div className="text-red-500 mt-4">{errorMessage}</div>}

          <div className="mt-4 text-center">
            <p className="text-sm">
              {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
              <button
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-blue-500 hover:underline"
              >
                {isSignUp ? "Sign In" : "Sign Up"}
              </button>
            </p>
          </div>

          <div className="mt-4 text-center">
            <Button variant="link" onClick={() => router.push("/")}>
              Back to Role Selection
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main component with Suspense boundary
export default function AuthPage() {
  return (
    <Suspense fallback={<AuthLoading />}>
      <AuthPageContent />
    </Suspense>
  );
}
