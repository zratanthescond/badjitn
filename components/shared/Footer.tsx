import { formatDateTime } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

const Footer = () => {
  return (
    <footer className="border-t">
      <div className="flex-center wrapper flex-between flex flex-col gap-4 p-5 text-center sm:flex-row">
        <div className="flex flex-row">
          <Link href="/">
            <Image
              src="/assets/images/logo.png"
              width={128}
              height={38}
              alt="BadjiTn logo"
              className="object-cover hidden dark:block  "
            />
            <Image
              src="/assets/images/logoDark.png"
              width={128}
              height={38}
              alt="BadjiTn logo"
              className="object-cover  block dark:hidden"
            />
          </Link>
        </div>
        <p>{new Date().getFullYear()} Badgi.net. All Rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
