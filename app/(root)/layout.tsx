import { Link } from 'lucide-react';
import { ReactNode } from 'react';

const RootLayout = ({ children } : { children : ReactNode }) => {
  return (
    <div>
      <nav>
        <Link href="/">
            <img src="/logo.png" alt="Logo" style={{ width: '50px', height: '50px' }} />
        </Link>
      </nav>
      {children}
    </div>
  )
}

export default RootLayout;