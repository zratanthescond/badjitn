import { formatSeconds } from "@/lib/utils";

export const TimeStep = ({
  duration,
  currentTime,
}: {
  duration: number;
  currentTime: number;
}) => {
  const blocks = Array.from(Array(duration).keys());
  const Step = ({ time }) => {
    return (
      <div className=" flex w-72 h-8 time-step">{formatSeconds(time)}</div>
    );
  };
  return (
    <div className="flex rounded-lg backdrop-blur-sm bg-pink-500 flex-row">
      <div
        className="needle z-50 h-52"
        style={{
          transform: `translateX(${(currentTime - 1) * 18 + 1 * 18}rem)`,
          transition: `transform 1s linear`,
        }}
      >
        <div className="cursor"></div>
        <div className="line z-50"></div>
      </div>
      {blocks.map((block, index) => (
        <Step key={index} time={block} />
      ))}
    </div>
  );
};
