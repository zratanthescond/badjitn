import { useUser } from "@/lib/actions/user.actions";
import { Separator } from "../ui/separator";
import { useEffect, useState } from "react";
import { IUser } from "@/lib/database/models/user.model";
import { Skeleton } from "../ui/skeleton";
import { getEventById } from "@/lib/actions/event.actions";
import { IEvent } from "@/lib/database/models/event.model";
import { QRCode } from "react-qrcode-logo";
import { Button } from "../ui/button";
import { useTransition } from "react";
import {
  createCertification,
  getCertificationByUseridAndEventId,
} from "@/lib/actions/certification.actions";
import { toast } from "@/hooks/use-toast";
import { ICertificate } from "@/lib/database/models/certification.model";
import { Badge } from "../ui/badge";
import { Download, Printer } from "lucide-react";
import { useReactToPrint } from "react-to-print";
import { useRef } from "react";
import generatePDF from "react-to-pdf";
import { pdfOptions } from "@/lib/utils";
import { json } from "stream/consumers";
export default function CertifcationComponent({
  eventId,
  userId,
}: {
  eventId: string;
  userId: string;
}) {
  const contentRef = useRef<HTMLDivElement>(null);
  const reactToPrintFn = useReactToPrint({ contentRef });
  const [user, setUser] = useState<IUser | null>(null);
  const [event, setEvent] = useState<IEvent | null>(null);
  const [isPending, startTransition] = useTransition();
  const [qrcodeContent, setQrcodeContent] = useState<string | undefined>(
    "sample"
  );
  const [certification, setCertification] = useState<ICertificate | null>(null);
  const getUserCredencials = async () => {
    const user = await useUser();
    setUser(JSON.parse(JSON.stringify(user)));
    const event = await getEventById(eventId);
    //alert(JSON.stringify(event));
    setEvent(JSON.parse(JSON.stringify(event)));
  };
  const getCertification = async () => {
    const certification = await getCertificationByUseridAndEventId({
      eventId,
      userId,
    });
    setCertification(certification);
  };
  useEffect(() => {
    getUserCredencials();
    getCertification();
  }, []);
  useEffect(() => {
    if (certification && certification.status === "approved") {
      alert(JSON.stringify(certification));
      setQrcodeContent(certification._id);
    }
  }, [certification]);
  const requestCertification = () => {
    startTransition(async () => {
      const certification = await createCertification({ eventId, userId });
      if (certification) {
        toast({
          title: "Success",
          description: "Certification Requested Successfully",
        });
      }
    });
  };
  return (
    <div className="flex flex-col items-center gap-2 justify-center h-full min-h-[80vh] bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div
        ref={contentRef}
        className=" w-full flex flex-col items-center justify-between min-h-[80vh] bg-card  p-8 rounded-lg shadow-lg"
      >
        <div className="flex flex-col items-center justify-between h-2/3">
          <h1 className="text-3xl font-bold  dark:text-white mb-4">
            Certificate of Achievement
          </h1>
          <Separator className="my-4" />

          {user ? (
            <h2 className="text-5xl font-bold text-foreground mb-6 capitalize">
              {`${user?.firstName} ${user?.lastName}`}
            </h2>
          ) : (
            <Skeleton className="h-12 w-3/4 rounded-full" />
          )}
          {event ? (
            <p className="text-muted-foreground text-lg max-w-[600px] text-center mb-8">
              In recognition of your outstanding contribution and dedication to
              the “ {event?.title} ” event program.
            </p>
          ) : (
            <>
              <Skeleton className="h-4 w-full rounded-full" />
              <Skeleton className="h-4 w-full rounded-full" />
              <Skeleton className="h-4 w-full rounded-full" />
            </>
          )}
        </div>
        <div className="border-t w-full border-muted pt-6 flex justify-between items-center">
          <p className="text-muted-foreground text-sm">
            Awarded on :{" "}
            {certification && certification.approvedAt
              ? new Date(certification.approvedAt).toLocaleDateString()
              : new Date().toLocaleDateString()}
          </p>

          <div className="flex items-center justify-between gap-2">
            <AwardIcon className="w-6 h-6 text-primary" />
            {event ? (
              <>
                <p className="text-muted-foreground text-sm">
                  Organizer: {event?.organizer.firstName}{" "}
                  {event?.organizer.lastName}
                </p>
                <QRCode
                  value={qrcodeContent}
                  size={100}
                  logoImage={`${process.env.NEXT_PUBLIC_SERVER_URL}/assets/images/qrcodeMotif.png`}
                  removeQrCodeBehindLogo={false}
                  logoPadding={3}
                  //
                  logoPaddingStyle="square"
                  logoWidth={20}
                  qrStyle="fluid"
                  eyeRadius={6}
                  fgColor="#64748b"
                  bgColor="#f8fafc"
                  ecLevel="H"
                  quietZone={10}
                />
              </>
            ) : (
              <>
                <Skeleton className="h-4 w-36 rounded-full bg-slate-50" />
                <Skeleton className="h-10 w-10 rounded-sm" />
              </>
            )}
          </div>
        </div>
      </div>
      <div className="w-full flex flex-col md:flex-row items-center justify-between min-h-[15vh] bg-card  p-8 rounded-lg shadow-lg">
        <p className="text-muted-foreground text-sm">
          This is a sample certification request a real one from the event
          organizer
        </p>
        {certification ? (
          certification.status === "pending" ? (
            <Badge className="h-8 p-2" title="Processing request">
              Processing request
            </Badge>
          ) : certification.status === "approved" ? (
            <div className="flex flex-row items-center  justify-center gap-2">
              <Badge
                className="h-8 p-2 bg-green-500"
                title="Certification Approved"
              >
                Certification Approved
              </Badge>
              <Button
                variant={"ghost"}
                className="glass"
                onClick={() => {
                  reactToPrintFn();
                }}
              >
                <Printer />
              </Button>
              <Button
                variant={"ghost"}
                className="glass"
                onClick={() => {
                  generatePDF(contentRef, {
                    filename: `certification_${user?.firstName}_${user?.lastName}_.pdf`,
                    page: {
                      format: "A4",
                      orientation: "landscape",
                      margin: 0,
                    },
                    canvas: {
                      mimeType: "image/png",
                      qualityRatio: 1,
                    },
                  });
                }}
              >
                <Download />
              </Button>
            </div>
          ) : (
            <Badge
              variant={"destructive"}
              className="h-8 p-2"
              title="Certification Rejected"
            >
              Certification Rejected
            </Badge>
          )
        ) : (
          <Button
            variant={"ghost"}
            className="glass flex flex-row items-center justify-between "
            size={"lg"}
            disabled={isPending}
            onClick={() => requestCertification()}
          >
            <AwardIcon className="w-8 h-8 text-primary" />
            Order a Certification
          </Button>
        )}
      </div>
    </div>
  );
}

function AwardIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526" />
      <circle cx="12" cy="8" r="6" />
    </svg>
  );
}
