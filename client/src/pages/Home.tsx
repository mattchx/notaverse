import { Button } from '@/components/ui/button'
import { Link } from "react-router";

function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
        Welcome to Notaverse
      </h1>
      <p className="text-lg text-muted-foreground mb-8">
        Your personal space for notes and thoughts
      </p>
      <div>
        <Link to="/login"><Button variant="secondary" className="hover:cursor-pointer mr-8">Login</Button></Link>
        <Link to="/register"><Button className="hover:cursor-pointer">Register</Button></Link>
      </div>
    </div>
  )
}

export default Home