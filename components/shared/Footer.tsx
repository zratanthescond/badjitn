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
              alt="logo"
              width={38}
              height={38}
            />
          </Link>
          <h1 className="h3-bold">adjiTn</h1>
        </div>
        <p>2024 BadjiTN. All Rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
