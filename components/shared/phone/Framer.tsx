import { usePreview } from "@/hooks/usePreview";
import Image from "next/image";

export const Framer = ({
  src,
  duration,
}: {
  src: string;
  duration: number;
}) => {
  const frames = usePreview(src);
  const isLoading = frames.length === 0;
  if (isLoading) {
    return (
      <div className="w-full flex rounded-lg flex-row my-1 ">
        <div className="w-[4.5rem] h-[9.5rem] bg-card/30 animate-pulse rounded-l-lg "></div>
        <div className="w-[4.5rem]  bg-card/30 animate-pulse  border-s-2"></div>
        <div className="w-[4.5rem]  bg-card/30 animate-pulse  border-s-2"></div>
        <div className="w-[4.5rem]  bg-card/30 animate-pulse  border-s-2"></div>
        <div className="w-[4.5rem]  bg-card/30 animate-pulse  border-s-2"></div>
        <div className="w-[4.5rem]  bg-card/30 animate-pulse border-s-2 "></div>
        <div className="w-[4.5rem]  bg-card/30 animate-pulse border-s-2"></div>
        <div className="w-[4.5rem]  bg-card/30 animate-pulse  border-s-2"></div>
        <div className="w-[4.5rem]  bg-card/30 animate-pulse  border-s-2"></div>
        <div className="w-[4.5rem]  bg-card/30 animate-pulse  border-s-2"></div>
        <div className="w-[4.5rem]  bg-card/30 animate-pulse  border-s-2"></div>
        <div className="w-[4.5rem]  bg-card/30 animate-pulse  border-s-2"></div>
        <div className="w-[4.5rem]  bg-card/30 animate-pulse  border-s-2"></div>
        <div className="w-[4.5rem]  bg-card/30 animate-pulse  border-s-2"></div>
        <div className="w-[4.5rem]  bg-card/30 animate-pulse  border-s-2"></div>
        <div className="w-[4.5rem]  bg-card/30 animate-pulse border-s-2"></div>
        <div className="w-[4.5rem]  bg-card/30 animate-pulse  border-s-2"></div>
        <div className="w-[4.5rem]  bg-card/30 animate-pulse  border-s-2"></div>
        <div className="w-[4.5rem]  bg-card/30 animate-pulse border-s-2"></div>
        <div className="w-[4.5rem]  bg-card/30 animate-pulse  border-s-2"></div>
        <div className="w-[4.5rem]  bg-card/30 animate-pulse rounded-r-lg"></div>
      </div>
    );
  }
  return (
    <div className="w-full flex rounded-lg flex-row my-1 ">
      {frames.map((frame, index) => (
        <div key={index} className="w-[4.5rem]  ">
          <Image
            loader={() => frame}
            blurDataURL="/assets/images/placeholder.png"
            placeholder="blur"
            src={frame}
            style={{ objectFit: "cover" }}
            layout="responsive"
            width={72}
            height={27 / 16 / 9}
            alt="preview"
            className={`${index === 0 ? "rounded-l-lg" : ""} ${
              index === frames.length - 1 ? "rounded-r-lg" : ""
            }`}
          />
        </div>
      ))}
    </div>
  );
};
