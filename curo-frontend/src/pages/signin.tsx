import React, { useState } from 'react';
import { auth } from '@/lib/firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FcGoogle } from 'react-icons/fc';

export default function AuthPage() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError('');

    const form = event.target as HTMLFormElement;
    const email = (form.elements.namedItem('email') as HTMLInputElement).value;
    const password = (form.elements.namedItem('password') as HTMLInputElement).value;
    const isLogin = form.getAttribute('data-form-type') === 'login';

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const name = (form.elements.namedItem('name') as HTMLInputElement).value;
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        
        // Send user data to your backend
        await fetch('http://localhost:3000/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            uid: userCredential.user.uid,
            email,
            name,
          }),
        });
      }
    } catch (err: any) {
      setError(err.message);

    } finally {
      setIsLoading(false);
    }
    console.log('Submitted');
  };

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const result = await signInWithPopup(auth, provider);
      
      // Send user data to your backend
      await fetch('http://localhost:3000/api/auth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uid: result.user.uid,
          email: result.user.email,
          name: result.user.displayName,
        }),
      });
    } catch (err: any) {
      setError(err.message);
    }
  };


  return (
    <div className="flex min-h-screen w-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="flex flex-col items-center justify-center w-full px-4 py-8 mx-auto">
        <div className="w-full sm:w-[480px] md:w-[540px] lg:w-[600px] bg-white rounded-2xl shadow-lg">
          <div className="w-full px-6 py-8 md:px-8">
            <div className="flex items-center justify-center mb-8">
              <div className="w-12 h-12 bg-blue-500 rounded-full"></div>
              <span className="text-2xl font-bold text-blue-800 ml-3">Curo</span>
            </div>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login" className="text-sm sm:text-base">Login</TabsTrigger>
                <TabsTrigger value="signup" className="text-sm sm:text-base">Sign Up</TabsTrigger>
              </TabsList>
              <TabsContent value="login" className="w-full">
                <form data-form-type="login" onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-700">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="m@example.com"
                      required
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-gray-700">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      required
                      className="w-full"
                    />
                  </div>
                  <Button
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    type="submit"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Logging in...' : 'Login'}
                  </Button>
                </form>
              </TabsContent>
              <TabsContent value="signup" className="w-full">
                <form data-form-type="signup" onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-gray-700">Full Name</Label>
                    <Input
                      id="name"
                      placeholder="John Doe"
                      required
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-700">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="m@example.com"
                      required
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-gray-700">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      required
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password" className="text-gray-700">Confirm Password</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      required
                      className="w-full"
                    />
                  </div>
                  <Button
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    type="submit"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Creating Account...' : 'Create Account'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or continue with</span>
                </div>
              </div>
              <Button
                variant="outline"
                className="w-full mt-6"
                onClick={handleGoogleLogin}
              >
                <FcGoogle className="w-5 h-5 mr-2" />
                Google
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}