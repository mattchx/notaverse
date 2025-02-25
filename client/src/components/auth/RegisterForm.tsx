import { useState, FormEvent } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface RegisterFormProps {
  onSubmit: (credentials: { email: string; password: string; confirmPassword: string }) => void;
  error?: string;
}

export function RegisterForm({ onSubmit, error }: RegisterFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setPasswordError("Passwords don't match");
      return;
    }
    
    setPasswordError('');
    onSubmit({ email, password, confirmPassword });
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md w-full mx-auto space-y-8 p-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Create an account</h1>
        <p className="text-sm text-muted-foreground">Enter your details to sign up</p>
      </div>

      {(error || passwordError) && (
        <div className="p-3 text-sm text-red-500 bg-red-100 rounded-md">
          {error || passwordError}
        </div>
      )}

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
          />
          <p className="text-xs text-muted-foreground">
            Must be at least 8 characters
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
      </div>

      <Button type="submit" className="w-full">
        Sign up
      </Button>

      <div className="text-center text-sm">
        <p className="text-muted-foreground">
          Already have an account?{' '}
          <a href="/login" className="text-primary underline-offset-4 hover:underline">
            Sign in
          </a>
        </p>
      </div>
    </form>
  );
}