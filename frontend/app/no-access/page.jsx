
'use client';

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation"; // Updated import for App Router
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

export default function NoAccessPage() {
  const router = useRouter();

  const handleGoBack = () => {
    router.push('/'); // Redirect to the home page or a relevant page
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Card className="max-w-sm p-6">
        <CardHeader>
          <CardTitle>No Access</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertTitle>Permission Denied</AlertTitle>
            <AlertDescription>
              You do not have the required permissions to access this page. Please contact an administrator if you believe this is an error.
            </AlertDescription>
          </Alert>
          <div className="mt-4">
            <Button variant="outline" onClick={handleGoBack}>Go Back</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
