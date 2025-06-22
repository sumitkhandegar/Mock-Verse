import Link from "next/link";
import Image from "next/image";
import { ReactNode } from "react";

const RootLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div>
      <nav>
        <Link href="/" passHref legacyBehavior>
          <a>
            <Image
              src="/logo.png"
              alt="Logo"
              width={50}
              height={50}
              style={{
                width: "50px",
                height: "50px",
              }}
            />
          </a>
        </Link>
      </nav>
      {children}
    </div>
  );
};

export default RootLayout;
